// three.js globe — draws land and sea (3D noise fbm) and a cloud shell (radius 1.007, additive blend .5) with our own shaders, and
// Spins turns times in step with document (or track element) scroll progress (scrub). Clouds drift slowly on their own. Colors are read from skin variables
(() => {
  const NOISE = `
    vec3 h3(vec3 p){p=vec3(dot(p,vec3(127.1,311.7,74.7)),dot(p,vec3(269.5,183.3,246.1)),dot(p,vec3(113.5,271.9,124.6)));return -1.0+2.0*fract(sin(p)*43758.5453);}
    float n3(vec3 p){vec3 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);
      return mix(mix(mix(dot(h3(i),f),dot(h3(i+vec3(1,0,0)),f-vec3(1,0,0)),u.x),mix(dot(h3(i+vec3(0,1,0)),f-vec3(0,1,0)),dot(h3(i+vec3(1,1,0)),f-vec3(1,1,0)),u.x),u.y),
                 mix(mix(dot(h3(i+vec3(0,0,1)),f-vec3(0,0,1)),dot(h3(i+vec3(1,0,1)),f-vec3(1,0,1)),u.x),mix(dot(h3(i+vec3(0,1,1)),f-vec3(0,1,1)),dot(h3(i+vec3(1,1,1)),f-vec3(1,1,1)),u.x),u.y),u.z);}
    float fbm(vec3 p){float s=0.0,a=0.5;for(int i=0;i<5;i++){s+=a*n3(p);p*=2.03;a*=0.5;}return s;}`;
  const VERT = `varying vec3 vP;varying vec3 vN;varying vec3 vV;
    void main(){vP=position;vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`;
  const EARTH = `uniform vec3 uOcean;uniform vec3 uLand;uniform vec3 uRim;uniform vec3 uLight;varying vec3 vP;varying vec3 vN;varying vec3 vV;${NOISE}
    void main(){float h=fbm(vP*2.2);float land=smoothstep(0.02,0.06,h);
      vec3 c=mix(uOcean,uLand,land)*(0.92+0.16*fbm(vP*9.0));
      float d=max(dot(normalize(vN),normalize(uLight)),0.0);c*=0.35+0.75*d;
      float rim=pow(1.0-max(dot(normalize(vN),vV),0.0),2.5);c=mix(c,uRim,rim*0.7);gl_FragColor=vec4(c,1.0);}`;
  const CLOUD = `uniform vec3 uCloud;uniform float uTime;uniform float uAlpha;uniform vec3 uLight;varying vec3 vP;varying vec3 vN;varying vec3 vV;${NOISE}
    void main(){float c=fbm(vP*3.2+vec3(uTime*0.02,0.0,uTime*0.01));c=smoothstep(0.05,0.35,c);
      float d=max(dot(normalize(vN),normalize(uLight)),0.0);gl_FragColor=vec4(uCloud*(0.4+0.6*d),c*uAlpha);}`;

  kfFx.register("scroll-globe", (el, { options, reduce, scroller }) => {
    if (!window.THREE) return;
    const T = window.THREE;
    const turns = +(options.turns ?? 1), tilt = +(options.tilt ?? 0.4), dist = +(options.distance ?? 3.2), alpha = +(options.clouds ?? 0.5);
    const css = getComputedStyle(document.documentElement);
    const col = (v, f) => new T.Color((css.getPropertyValue(v) || f).trim() || f);
    const ink = col("--kf-ink", "black"), bg = col("--kf-bg", "white"), surf = col("--kf-surface", "white");
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
    el.append(renderer.domElement);
    const scene = new T.Scene(), camera = new T.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, dist);
    const light = new T.Vector3(-0.6, 0.5, 1);
    const group = new T.Group();
    group.rotation.x = tilt;
    const geo = new T.SphereGeometry(1, 30, 30), cgeo = new T.SphereGeometry(1.007, 30, 30);
    const earth = new T.Mesh(geo, new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: EARTH,
      uniforms: { uOcean: { value: ink.clone().lerp(bg, 0.68) }, uLand: { value: ink.clone().lerp(bg, 0.88) }, uRim: { value: bg }, uLight: { value: light } } }));
    const cloudMat = new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: CLOUD, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
      uniforms: { uCloud: { value: surf }, uTime: { value: 0 }, uAlpha: { value: alpha }, uLight: { value: light } } });
    const cloud = new T.Mesh(cgeo, cloudMat);
    group.add(earth, cloud);
    scene.add(group);
    const size = () => { const w = el.clientWidth || 1, h = el.clientHeight || 1; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    const ro = new ResizeObserver(size); ro.observe(el); size();
    let spin = 0, seen = true, t = 0;
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting)); io.observe(el);
    const track = options.track ? document.querySelector(options.track) : null;
    const st = window.ScrollTrigger && ScrollTrigger.create({
      trigger: track || document.documentElement, scroller: scroller || undefined, start: "top top", end: "bottom bottom", scrub: reduce ? false : 1,
      onUpdate: (s) => { spin = s.progress * turns * Math.PI * 2; },
    });
    const draw = (time, dt) => {
      if (!seen) return;
      t += reduce ? 0 : Math.max(1, dt) / 1000;
      group.rotation.y = spin;
      cloud.rotation.y = t * 0.03;
      cloudMat.uniforms.uTime.value = t;
      renderer.render(scene, camera);
    };
    gsap.ticker.add(draw);
    return () => {
      gsap.ticker.remove(draw); st?.kill(); ro.disconnect(); io.disconnect();
      geo.dispose(); cgeo.dispose(); earth.material.dispose(); cloudMat.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  });
})();
