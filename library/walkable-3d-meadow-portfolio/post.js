// Screen post-processing — re-wrote with our own shaders the effects the original (FilmPostProcessing chunk, pmndrs postprocessing 6.39) applies.
// Original order: SMAA → bloom (additive, 8-step mip blur) → brightness · contrast → hue · saturation → vignette → shutter. The library is Zlib-licensed, so we don’t use it and write the same formulas fresh.
//   Bloom: brightness threshold .8 · smoothness .26 · strength .3 · radius .64 (morning .24/.86/.68 · sunset .4/.83/.74 · night .46/.9/.66, smoothness .5 at night, rain .2)
//   brightness .016 · contrast .078 · saturation .065 · vignette offset .22 · darkness .38 (shifts toward morning · sunset · night values)
// Values follow by damping like the original (night 4, others 2.4). Instead of SMAA the scene buffer is drawn with MSAA 4.
// When graphics quality is High, ambient occlusion is added like the original (N8AO spot) — half-resolution depth SSAO, radius .5m · distance falloff .9 · strength 1.5 · charcoal shade.
// Film grain is not in the original post-processing (the effects above are all of the FilmPostProcessing chunk).
// Opening depth of field: the original boot dandelion blurs the seeds behind the head (depth below −.25) by 0.35 + (depth − .25) × 1.1 px.
// The copy draws those seeds as separate layers (center .55px · farthest .95px) and blurs the two sheets with a disc sample over the scene.
window.MeadowPost = (T, renderer) => {
  const quad = new T.Mesh(new T.PlaneGeometry(2, 2));
  quad.frustumCulled = false;
  const quadScene = new T.Scene();
  quadScene.add(quad);
  const quadCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const VERT = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
  const target = (opts = {}) => new T.WebGLRenderTarget(1, 1, { type: T.HalfFloatType, depthBuffer: false, ...opts });
  const sceneRT = target({ depthBuffer: true, samples: 4 });
  sceneRT.depthTexture = new T.DepthTexture(1, 1);
  sceneRT.depthTexture.type = T.UnsignedIntType;
  const aoRT = target({ type: T.UnsignedByteType }), aoBlurRT = target({ type: T.UnsignedByteType });
  const layerRT = [target({ depthBuffer: true, samples: 4 }), target({ depthBuffer: true, samples: 4 })];
  const LEVELS = 8;
  const lumRT = target();
  const down = Array.from({ length: LEVELS }, () => target());
  const up = Array.from({ length: LEVELS - 1 }, () => target());

  const lumMat = new T.ShaderMaterial({
    uniforms: { tMap: { value: null }, threshold: { value: 0.8 }, smoothing: { value: 0.26 } },
    vertexShader: VERT,
    fragmentShader: `uniform sampler2D tMap; uniform float threshold; uniform float smoothing; varying vec2 vUv;
      void main(){ vec4 c = texture2D(tMap, vUv); float l = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
        gl_FragColor = vec4(c.rgb * smoothstep(threshold, threshold + smoothing, l), 1.0); }`,
    depthTest: false, depthWrite: false,
  });
  // 13 sample downloads (center .125, inner four .125, outer four .03125, cross four .0625)
  const downMat = new T.ShaderMaterial({
    uniforms: { tMap: { value: null }, texel: { value: new T.Vector2() } },
    vertexShader: VERT,
    fragmentShader: `uniform sampler2D tMap; uniform vec2 texel; varying vec2 vUv;
      vec3 s(vec2 o){ return texture2D(tMap, vUv + o * texel).rgb; }
      void main(){
        vec3 c = s(vec2(0.0)) * 0.125;
        c += (s(vec2(-1.0, 1.0)) + s(vec2(1.0, 1.0)) + s(vec2(-1.0, -1.0)) + s(vec2(1.0, -1.0))) * 0.125;
        c += (s(vec2(-2.0, 2.0)) + s(vec2(2.0, 2.0)) + s(vec2(-2.0, -2.0)) + s(vec2(2.0, -2.0))) * 0.03125;
        c += (s(vec2(0.0, 2.0)) + s(vec2(-2.0, 0.0)) + s(vec2(2.0, 0.0)) + s(vec2(0.0, -2.0))) * 0.0625;
        gl_FragColor = vec4(c, 1.0); }`,
    depthTest: false, depthWrite: false,
  });
  // 9 Blend the specimen tent’s upward-received value with the same tier’s downward-received value by the radius
  const upMat = new T.ShaderMaterial({
    uniforms: { tMap: { value: null }, tBase: { value: null }, texel: { value: new T.Vector2() }, radius: { value: 0.64 } },
    vertexShader: VERT,
    fragmentShader: `uniform sampler2D tMap; uniform sampler2D tBase; uniform vec2 texel; uniform float radius; varying vec2 vUv;
      vec3 s(vec2 o){ return texture2D(tMap, vUv + o * texel).rgb; }
      void main(){
        vec3 c = s(vec2(0.0)) * 0.25;
        c += (s(vec2(-1.0, 0.0)) + s(vec2(1.0, 0.0)) + s(vec2(0.0, 1.0)) + s(vec2(0.0, -1.0))) * 0.125;
        c += (s(vec2(-1.0, 1.0)) + s(vec2(1.0, 1.0)) + s(vec2(-1.0, -1.0)) + s(vec2(1.0, -1.0))) * 0.0625;
        gl_FragColor = vec4(mix(texture2D(tBase, vUv).rgb, c, radius), 1.0); }`,
    depthTest: false, depthWrite: false,
  });
  // Ambient occlusion (original N8AO: radius .5m · distance falloff .9 · intensity 1.5 · half resolution · shadow tint brown). Position and normal are rebuilt from depth and measured with 16 hemisphere samples
  const kernel = Array.from({ length: 16 }, (_, i) => {
    const a = i * 2.399963, z = 0.15 + 0.85 * ((i * 0.618034) % 1), r = Math.sqrt(1 - z * z), s = 0.1 + 0.9 * Math.pow((i + 1) / 16, 2);
    return new T.Vector3(Math.cos(a) * r * s, Math.sin(a) * r * s, z * s);
  });
  const aoMat = new T.ShaderMaterial({
    uniforms: { tDepth: { value: null }, proj: { value: new T.Matrix4() }, projInv: { value: new T.Matrix4() }, kernel: { value: kernel }, radius: { value: 0.5 }, falloff: { value: 0.9 } },
    vertexShader: VERT,
    fragmentShader: `uniform sampler2D tDepth; uniform mat4 proj; uniform mat4 projInv; uniform vec3 kernel[16]; uniform float radius; uniform float falloff; varying vec2 vUv;
      vec3 viewAt(vec2 uv){ float d = texture2D(tDepth, uv).r; vec4 p = projInv * vec4(uv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0); return p.xyz / p.w; }
      void main(){
        float d = texture2D(tDepth, vUv).r;
        if (d >= 0.9999) { gl_FragColor = vec4(1.0); return; }
        vec3 p = viewAt(vUv), n = normalize(cross(dFdx(p), dFdy(p)));
        float ang = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) * 6.2831853;
        vec3 r = vec3(cos(ang), sin(ang), 0.0), t = normalize(r - n * dot(r, n)), b = cross(n, t);
        mat3 tbn = mat3(t, b, n);
        float occ = 0.0;
        for (int i = 0; i < 16; i++) {
          vec3 s = p + tbn * kernel[i] * radius;
          vec4 c = proj * vec4(s, 1.0); vec2 uv = c.xy / c.w * 0.5 + 0.5;
          if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) continue;
          float sz = viewAt(uv).z;
          float range = 1.0 - smoothstep(0.0, 1.0, abs(p.z - sz) / (radius / max(falloff, 0.01)));
          occ += step(s.z + 0.02, sz) * range;
        }
        gl_FragColor = vec4(vec3(1.0 - occ / 16.0), 1.0);
      }`,
    depthTest: false, depthWrite: false,
  });
  const aoBlurMat = new T.ShaderMaterial({
    uniforms: { tMap: { value: null }, texel: { value: new T.Vector2() } },
    vertexShader: VERT,
    fragmentShader: `uniform sampler2D tMap; uniform vec2 texel; varying vec2 vUv;
      void main(){ float a = 0.0; for (int x = -2; x < 2; x++) for (int y = -2; y < 2; y++) a += texture2D(tMap, vUv + (vec2(float(x), float(y)) + 0.5) * texel).r; gl_FragColor = vec4(vec3(a / 16.0), 1.0); }`,
    depthTest: false, depthWrite: false,
  });
  const finalMat = new T.ShaderMaterial({
    uniforms: {
      tScene: { value: null }, tBloom: { value: null }, tLayer0: { value: null }, tLayer1: { value: null }, tAO: { value: null }, aoOn: { value: 0 },
      aoTint: { value: new T.Color(0.023, 0.018, 0.009) }, aoPower: { value: 1.5 },
      layerBlur: { value: new T.Vector2(0.55, 0.95) }, layerOn: { value: 0 }, px: { value: new T.Vector2() },
      intensity: { value: 0.3 }, bloomOn: { value: 1 }, brightness: { value: 0.016 }, contrast: { value: 0.078 },
      hue: { value: new T.Vector3(1, 0, 0) }, saturation: { value: 0.065 }, offset: { value: 0.22 }, darkness: { value: 0.38 },
    },
    vertexShader: VERT,
    fragmentShader: `uniform sampler2D tScene; uniform sampler2D tBloom; uniform sampler2D tLayer0; uniform sampler2D tLayer1; uniform sampler2D tAO; uniform float aoOn; uniform vec3 aoTint; uniform float aoPower;
      uniform vec2 layerBlur; uniform float layerOn; uniform vec2 px; uniform float intensity; uniform float bloomOn;
      uniform float brightness; uniform float contrast; uniform vec3 hue; uniform float saturation; uniform float offset; uniform float darkness;
      varying vec2 vUv;
      vec4 soft(sampler2D t, float r){
        vec4 c = texture2D(t, vUv) * 0.2;
        for (int i = 0; i < 8; i++) { float a = float(i) * 0.7853982; c += texture2D(t, vUv + vec2(cos(a), sin(a)) * r * px) * 0.1; }
        return c;
      }
      void main(){
        vec4 base = texture2D(tScene, vUv);
        vec3 color = base.rgb;
        if (aoOn > 0.5) color *= mix(aoTint, vec3(1.0), pow(texture2D(tAO, vUv).r, aoPower));
        if (layerOn > 0.5) {
          vec4 l1 = soft(tLayer1, layerBlur.y); color = color * (1.0 - l1.a) + l1.rgb;
          vec4 l0 = soft(tLayer0, layerBlur.x); color = color * (1.0 - l0.a) + l0.rgb;
        }
        color += texture2D(tBloom, vUv).rgb * intensity * bloomOn;
        color += vec3(brightness - 0.5);
        if (contrast > 0.0) color /= vec3(1.0 - contrast); else color *= vec3(1.0 + contrast);
        color += vec3(0.5);
        color = vec3(dot(color, hue.xyz), dot(color, hue.zxy), dot(color, hue.yzx));
        vec3 diff = (color.r + color.g + color.b) / 3.0 - color;
        if (saturation > 0.0) color += diff * (1.0 - 1.0 / (1.001 - saturation)); else color += diff * -saturation;
        color = max(color, 0.0);
        color *= smoothstep(0.8, offset * 0.799, distance(vUv, vec2(0.5)) * (darkness + offset));
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    depthTest: false, depthWrite: false,
  });

  const pass = (mat, out) => {
    quad.material = mat;
    renderer.setRenderTarget(out);
    renderer.render(quadScene, quadCam);
  };
  let W = 1, H = 1;
  function setSize(w, h) {
    W = Math.max(1, Math.round(w)); H = Math.max(1, Math.round(h));
    sceneRT.setSize(W, H);
    layerRT.forEach((t) => t.setSize(W, H));
    let lw = Math.max(1, W >> 1), lh = Math.max(1, H >> 1);
    lumRT.setSize(lw, lh);
    aoRT.setSize(lw, lh); aoBlurRT.setSize(lw, lh);
    aoBlurMat.uniforms.texel.value.set(1 / lw, 1 / lh);
    for (let i = 0; i < LEVELS; i++) {
      lw = Math.max(1, lw >> 1); lh = Math.max(1, lh >> 1);
      down[i].setSize(lw, lh);
      if (i < LEVELS - 1) up[i].setSize(lw, lh);
    }
    finalMat.uniforms.px.value.set(1 / W, 1 / H);
  }

  // Like the original, follows the day’s mood (morning, sunset, night, rain, sleep) with damping and shifts effect values
  const mood = { golden: 0, morning: 0, night: 0, rainy: 0, sleeping: 0 };
  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  function setMood(m, dt) {
    const d = Math.min(dt, 0.05);
    mood.night = damp(mood.night, m.night || 0, 4, d);
    for (const k of ["golden", "morning", "rainy", "sleeping"]) mood[k] = damp(mood[k], m[k] || 0, 2.4, d);
    const { golden: G, morning: M, night: N, rainy: R, sleeping: S } = mood, u = finalMat.uniforms;
    u.intensity.value = lerp(lerp(lerp(lerp(0.3, 0.24, M), 0.4, G), 0.46, N) * (1 - R) + 0.2 * R, 0.38, S);
    lumMat.uniforms.threshold.value = lerp(lerp(lerp(0.8, 0.86, M), 0.83, G), 0.9, N);
    lumMat.uniforms.smoothing.value = lerp(0.26, 0.5, N);
    upMat.uniforms.radius.value = lerp(lerp(lerp(0.64, 0.68, M), 0.74, G), 0.66, N);
    u.brightness.value = lerp(lerp(lerp(0.016, 0.01, M), 0.012, G), 0, N);
    u.contrast.value = lerp(lerp(lerp(0.078, 0.048, M), 0.052, G), 0.055, N);
    const h = -0.003 * G * (1 - N), sh = Math.sin(h), ch = Math.cos(h);
    u.hue.value.set((2 * ch + 1) / 3, (-Math.sqrt(3) * sh - ch + 1) / 3, (Math.sqrt(3) * sh - ch + 1) / 3);
    u.saturation.value = lerp(lerp(lerp(0.065, 0.025, M), -0.012, G), -0.025, N);
    u.offset.value = lerp(lerp(0.22, 0.28, G), 0.26, N);
    u.darkness.value = lerp(lerp(lerp(0.38, 0.34, G), 0.32, N), 0.48, S);
  }

  // layers: the three layer numbers holding the blur seed layers [center, farthest back] — when given, only those layers render separately and overlay as a disc blur
  function render(scene, camera, { bloom = true, ao = false, layers = null } = {}) {
    const keep = camera.layers.mask, clear = renderer.getClearAlpha();
    renderer.setRenderTarget(sceneRT);
    renderer.clear();
    renderer.render(scene, camera);
    finalMat.uniforms.aoOn.value = ao ? 1 : 0;
    if (ao) {
      aoMat.uniforms.tDepth.value = sceneRT.depthTexture;
      aoMat.uniforms.proj.value.copy(camera.projectionMatrix);
      aoMat.uniforms.projInv.value.copy(camera.projectionMatrixInverse);
      pass(aoMat, aoRT);
      aoBlurMat.uniforms.tMap.value = aoRT.texture;
      pass(aoBlurMat, aoBlurRT);
      finalMat.uniforms.tAO.value = aoBlurRT.texture;
    }
    finalMat.uniforms.layerOn.value = layers ? 1 : 0;
    if (layers) {
      renderer.setClearAlpha(0);
      layers.forEach((n, i) => {
        camera.layers.set(n);
        renderer.setRenderTarget(layerRT[i]);
        renderer.clear();
        renderer.render(scene, camera);
      });
      camera.layers.mask = keep;
      renderer.setClearAlpha(clear);
      // The original applies blur to the seed image (px ratio min(dpr, 1.5)) and draws it scaled up by dpr divided by that ratio — in screen pixels the blur is blur × dpr
      const dpr = renderer.getPixelRatio();
      finalMat.uniforms.layerBlur.value.set(0.55 * dpr, 0.95 * dpr);
      finalMat.uniforms.tLayer0.value = layerRT[0].texture;
      finalMat.uniforms.tLayer1.value = layerRT[1].texture;
    }
    finalMat.uniforms.bloomOn.value = bloom ? 1 : 0;
    if (bloom) {
      lumMat.uniforms.tMap.value = sceneRT.texture;
      pass(lumMat, lumRT);
      let src = lumRT;
      for (let i = 0; i < LEVELS; i++) {
        downMat.uniforms.tMap.value = src.texture;
        downMat.uniforms.texel.value.set(1 / src.width, 1 / src.height);
        pass(downMat, down[i]);
        src = down[i];
      }
      for (let i = LEVELS - 2; i >= 0; i--) {
        upMat.uniforms.tMap.value = src.texture;
        upMat.uniforms.tBase.value = down[i].texture;
        upMat.uniforms.texel.value.set(1 / src.width, 1 / src.height);
        pass(upMat, up[i]);
        src = up[i];
      }
      finalMat.uniforms.tBloom.value = src.texture;
    }
    finalMat.uniforms.tScene.value = sceneRT.texture;
    pass(finalMat, null);
  }
  // The surrounding shade light color comes from the skin (a color index.js makes from the charcoal tone)
  const setAoTint = (c) => finalMat.uniforms.aoTint.value.copy(c);
  return { setSize, setMood, setAoTint, render };
};
