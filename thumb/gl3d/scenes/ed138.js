/* ============================================================================
   scene: ed138
   An icy, cratered dwarf-planet candidate far beyond Pluto, lit hard from the
   left by the Sun, which is only a blazing point at 46 AU. Milky Way behind.
   The planet is an exact sphere (fast march); craters, ridges and frost live
   in a height field that bends the normal and drives the albedo, so the
   silhouette stays round and the render stays cheap on SwiftShader.
   ========================================================================= */
window.SCENES = window.SCENES || {};

window.SCENES['ed138'] = {
  camera: { pos: [0.0, 0.12, 2.85], target: [0.0, 0.0, 0.0], fl: 1.55, shiftX: 0.66, shiftY: -0.04, roll: 0.0 },
  steps: 90,
  post: {
    exposure: 1.25,
    focus: 2.35, aperture: 0.05, maxCoC: 1.5,
    bloomThresh: 1.35, bloomKnee: 0.7,
    bloom: 0.36, bloom2: 0.42, bloom3: 0.50,
    grain: 0.008, vignette: 0.34, saturation: 1.18,
    tint: [1.0, 1.0, 1.0], shadowTint: [0.003, 0.006, 0.016], lift: 0.0,
    leftFall: 0.25, leftEdge: 0.30, contrast: 1.08
  },
  glsl: `
#define FAR 40.0
vec3  calcNormal(vec3 p, float t);
float calcAO(vec3 p, vec3 n);
float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k, int iters);
float lightOcc(vec3 ro, vec3 rd, float maxt, int iters);

const vec3 LSUN = vec3(-0.8600, 0.3600, 0.3600);     // toward the Sun: left, a bit up, a bit toward camera
const vec3 SUNCOL = vec3(5.6, 5.1, 4.4);
const vec3 RIMDIR = vec3(0.70, 0.25, -0.67);
const vec3 RIMCOL = vec3(0.30, 0.48, 0.95);

vec2 mapScene(vec3 p){ return vec2(length(p) - 1.0, 1.0); }

/* crater field on the unit sphere: returns height (bowls < 0, rims > 0) */
float craterH(vec3 d){
  float h = 0.0;
  for(int i = 0; i < 90; i++){
    vec3 c = normalize(hash31(float(i) + 3.7)*2.0 - 1.0);
    float r = 0.025 + 0.17*pow(hash11(float(i)*1.91 + 0.3), 3.0);
    float x = acos(clamp(dot(d, c), -1.0, 1.0))/r;
    if(x < 1.6){
      float bowl = -(1.0 - x*x)*step(x, 1.0);
      float rim = 0.55*exp(-pow((x - 1.0)/0.22, 2.0));
      h += (bowl + rim)*r*0.20;
    }
  }
  return h;
}
float terrH(vec3 d){
  vec2 uv = vec2(atan(d.z, d.x), asin(clamp(d.y, -1.0, 1.0)));
  float n = fbm2(uv*vec2(3.2, 3.6) + 7.0)*0.030 + fbm2(uv*vec2(11.0, 12.0) + 3.0)*0.010;
  return craterH(d) + n;
}
vec3 bumpN(vec3 n){
  float e = 0.004;
  vec3 t1 = normalize(cross(n, abs(n.y) < 0.95 ? vec3(0,1,0) : vec3(1,0,0)));
  vec3 t2 = cross(n, t1);
  float h0 = terrH(n), h1 = terrH(normalize(n + t1*e)), h2 = terrH(normalize(n + t2*e));
  vec3 g = t1*(h1 - h0)/e + t2*(h2 - h0)/e;
  return normalize(n - g*1.25);
}
Mat matOf(float id, vec3 p, vec3 n){
  vec3 d = normalize(p);
  vec2 uv = vec2(atan(d.z, d.x), asin(clamp(d.y, -1.0, 1.0)));
  float h = craterH(d);
  float big = fbm2(uv*vec2(1.6, 2.0) + 11.0);
  vec3 rust = vec3(0.42, 0.25, 0.16), tanC = vec3(0.66, 0.50, 0.38), frost = vec3(0.86, 0.84, 0.86);
  vec3 alb = mix(rust, tanC, smoothstep(0.35, 0.70, big));
  alb = mix(alb, rust*0.80, smoothstep(0.0, -0.02, h));                    // darker crater floors
  alb = mix(alb, frost, smoothstep(0.006, 0.016, h)*0.28);                 // frosted rims
  alb = mix(alb, frost, smoothstep(0.62, 0.80, fbm2(uv*vec2(5.0, 6.0) + 2.0))*0.35);
  alb *= 0.86 + 0.22*fbm2(uv*vec2(22.0, 24.0));
  return mkMat(alb, 0.88, 0.0, vec3(0.0), 1.0);
}
vec3 stars(vec3 rd){
  vec3 col = vec3(0.0);
  for(int k = 0; k < 3; k++){
    float sc = 90.0 + 110.0*float(k);
    vec3 q = rd*sc; vec3 id = floor(q); vec3 f = fract(q) - 0.5;
    float h = hash12(id.xy + id.z*17.13 + float(k)*3.1);
    if(h > 0.93){
      vec3 o = (hash31(h*91.7) - 0.5)*0.6;
      float d = length(f - o);
      float b = pow(hash11(h*13.1), 3.0)*(k == 0 ? 3.0 : 1.4);
      vec3 tint = mix(vec3(1.0, 0.85, 0.7), vec3(0.75, 0.85, 1.0), hash11(h*7.3));
      col += tint*b*exp(-d*d*90.0);
    }
  }
  return col;
}
vec3 background(vec3 rd){
  /* Milky Way: a soft band of light and dust across the frame */
  vec3 ax = normalize(vec3(0.25, 0.92, -0.30));
  float band = dot(rd, ax);
  vec2 uv = vec2(atan(rd.z, rd.x), rd.y);
  float dust = fbm2(uv*vec2(6.0, 14.0) + 4.0);
  float mw = exp(-band*band*110.0)*(0.35 + 0.9*fbm2(uv*vec2(7.0, 16.0)));
  mw *= 1.0 - 0.85*smoothstep(0.42, 0.72, dust)*exp(-band*band*260.0);
  vec3 col = vec3(0.004, 0.006, 0.014) + vec3(0.10, 0.12, 0.20)*mw + vec3(0.12, 0.08, 0.06)*mw*mw;
  col += stars(rd)*(0.7 + 2.6*mw);
  /* the Sun at 46 AU: a point, with glare and a horizontal flare */
  const vec3 SUNV = vec3(-0.5900, 0.3500, -0.7275);   // where the Sun sits in the frame (upper left)
  float s = max(dot(rd, SUNV), 0.0);
  col += vec3(1.0, 0.93, 0.80)*(pow(s, 40000.0)*160.0 + pow(s, 3000.0)*4.0 + pow(s, 300.0)*0.35 + pow(s, 30.0)*0.05);
  vec3 sx = normalize(cross(SUNV, vec3(0, 1, 0)));
  vec3 rp = rd - SUNV*dot(rd, SUNV);
  float fl = exp(-pow(dot(rp, vec3(0, 1, 0))*140.0, 2.0))*exp(-abs(dot(rp, sx))*7.0)*step(0.0, dot(rd, SUNV));
  col += vec3(1.0, 0.92, 0.80)*fl*0.55;
  return col;
}
vec3 shadePoint(vec3 p, vec3 n, vec3 rd, Mat m, float t){
  vec3 v = -rd;
  vec3 nb = bumpN(normalize(p));
  vec3 col = vec3(0.0);
  /* crater self-shadow: march the height field a little way toward the Sun */
  float sh = 1.0, h0 = terrH(normalize(p));
  for(int i = 1; i < 7; i++){
    vec3 q = normalize(normalize(p) + LSUN*0.012*float(i));
    float rise = (terrH(q) - h0) - 0.012*float(i)*max(dot(LSUN, normalize(p)), 0.0);
    sh = min(sh, clamp(1.0 - rise*14.0, 0.25, 1.0));
  }
  float term = smoothstep(-0.02, 0.10, dot(n, LSUN));                       // the terminator stays soft but sharp-edged
  col += brdfA(nb, v, LSUN, m, SUNCOL, 0.01)*sh*term;
  col += brdfA(nb, v, RIMDIR, m, RIMCOL*1.1, 0.2);                           // cold rim from the Milky Way side
  col += m.alb*vec3(0.010, 0.012, 0.020);                                     // faint starlight fill
  float NoV = max(dot(n, v), 1e-4);
  col += vec3(0.25, 0.42, 0.90)*pow(1.0 - NoV, 3.0)*0.22;
  return col;
}
`
};
