/* ============================================================================
   scene: nvidia-chip
   A cracked AI accelerator board tipping into a dark server-hall canyon,
   lit mostly by the emissive fracture running through the die.

   A scene supplies:
     glsl    - GLSL ES 3.0 source defining FAR, mapScene, matOf,
               shadePoint, background
     camera  - { pos, target, fl, shiftX, shiftY, roll }
     post    - exposure / dof / bloom / grade parameters
     steps   - march step budget
   ========================================================================= */
window.SCENES = window.SCENES || {};

window.SCENES['nvidia-chip'] = {
  camera: {
    pos: [1.12, 0.70, 1.86],
    target: [0.16, -0.10, -0.04],
    fl: 1.58,
    shiftX: 0.76,      // push the subject into the right two thirds
    shiftY: 0.045,
    roll: 0.0
  },
  steps: 150,
  post: {
    exposure: 1.40,
    focus: 2.30, aperture: 0.42, maxCoC: 6.0,
    bloomThresh: 1.55, bloomKnee: 0.80,
    bloom: 0.34, bloom2: 0.40, bloom3: 0.44,
    grain: 0.009, vignette: 0.30, saturation: 1.24,
    tint: [1.0, 1.0, 1.0], shadowTint: [0.004, 0.009, 0.018], lift: 0.0,
    leftFall: 0.42, leftEdge: 0.34, contrast: 1.10
  },

  glsl: `
#define FAR 60.0

/* ------------------------------------------------------------ prototypes
   defined by the renderer template after this block                     */
vec3  calcNormal(vec3 p, float t);
float calcAO(vec3 p, vec3 n);
float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k, int iters);
float lightOcc(vec3 ro, vec3 rd, float maxt, int iters);

/* ----------------------------------------------------------- material ids */
#define M_PCB       1.0
#define M_LID       2.0
#define M_GOLD      3.0
#define M_DARK      4.0
#define M_CORE      5.0
#define M_CONCRETE  6.0
#define M_LED       7.0
#define M_ALU       8.0
#define M_STEEL     9.0
#define M_PLASTIC  10.0
#define M_SHARD    11.0

/* ------------------------------------------------------------------ lights */
const vec3 LKEY  = vec3(-0.6690, 0.7073, 0.2284);   // normalize(-0.70,0.74,0.239)
const vec3 LRIM  = vec3(-0.2540, 0.3861,-0.8867);   // normalize(-0.25,0.38,-0.873)
const vec3 KEYCOL = vec3(0.62,0.75,1.00)*12.0;
const vec3 RIMCOL = vec3(0.74,0.90,1.00)*6.0;
const vec3 CORECOL= vec3(0.44,1.00,0.52)*7.0;
const vec3 LWARM = vec3( 0.6139, 0.4297, 0.6618);   // normalize(0.60,0.42,0.647)
const vec3 WARMCOL= vec3(1.00,0.58,0.24)*6.00;

/* ------------------------------------------------- board placement / tear */
const vec3  BPOS = vec3(0.0, 0.0, 0.0);
#define BRY (-0.56)
#define BRZ ( 0.330)
#define BRX ( 0.155)

#define XF    0.03      /* fracture centre, board x */
#define JAGK  2.50      /* lipschitz correction for the warped cut */
#define GAPC (-0.061)   /* gap centre offset after the two halves move */

float jag(float z){
  float t1 = abs(fract(z*2.60      ) - 0.5)*4.0 - 1.0;   /* sharp zig-zag */
  float t2 = abs(fract(z*6.30 + 0.37) - 0.5)*4.0 - 1.0;
  return 0.085*sin(z*4.10+0.70) + 0.045*sin(z*9.30+2.30)
       + 0.030*t1 + 0.016*t2 + 0.010*sin(z*39.0+1.00);
}

vec3 toBoard(vec3 p){
  p -= BPOS;
  p = rotY(p, -float(BRY));
  p = rotZ(p, -float(BRZ));
  p = rotX(p, -float(BRX));
  return p;
}
vec3 fromBoard(vec3 p){
  p = rotX(p, float(BRX));
  p = rotZ(p, float(BRZ));
  p = rotY(p, float(BRY));
  return p + BPOS;
}
vec3 fracWorld(float z){ return fromBoard(vec3(XF + jag(z) + GAPC, 0.015, z)); }

/* the two torn halves: rigid transforms pivoted on the fracture line */
vec3 invHalfA(vec3 p){
  p -= vec3(XF,0.0,0.0);
  p -= vec3(-0.195,-0.125, 0.048);     /* -T */
  p = rotZ(p,  0.150);                  /* R^-1 */
  p = rotX(p, -0.105);
  p = rotY(p,  0.070);
  p += vec3(XF,0.0,0.0);
  return p;
}
vec3 invHalfB(vec3 p){
  p -= vec3(XF,0.0,0.0);
  p -= vec3( 0.074, 0.020,-0.022);
  p = rotZ(p, -0.034);
  p = rotX(p,  0.022);
  p += vec3(XF,0.0,0.0);
  return p;
}

/* ===================================================== the board assembly
   built once in board-local space, then cut and displaced twice         */
vec2 boardParts(vec3 p){
  /* conservative hull: everything below lives inside this box */
  float hull = sdBox(p - vec3(0.0,0.14,0.0), vec3(1.545,0.21,1.005), 0.0);
  if(hull > 0.22) return vec2(hull, M_PCB);
  vec2 r = vec2(1e5, 0.0);

  /* PCB slab, bevelled edge */
  float pcb = sdBox(p, vec3(1.52, 0.050, 0.98), 0.010);
  float cham = (abs(p.y) + max(abs(p.x) - 1.505, abs(p.z) - 0.965))*0.7071 - 0.0370;
  pcb = smax(pcb, cham, 0.008);
  r = mn(r, vec2(pcb, M_PCB));

  /* --- processor package: substrate, metal lid, retention screws --- */
  vec3 dp = p - vec3(0.07, 0.050, 0.02);
  r = mn(r, vec2(sdBox(dp - vec3(0.0,0.020,0.0), vec3(0.480,0.020,0.410), 0.008), M_DARK));
  r = mn(r, vec2(sdBox(dp - vec3(0.0,0.082,0.0), vec3(0.415,0.042,0.345), 0.018), M_LID));
  vec3 sc = dp - vec3(0.0,0.046,0.0);
  sc.x = abs(sc.x) - 0.452; sc.z = abs(sc.z) - 0.372;
  r = mn(r, vec2(sdCylY(sc, 0.018, 0.032), M_STEEL));

  /* HBM-style stacks flanking the lid */
  vec3 hb = dp - vec3(0.0, 0.034, 0.0);
  hb.z = abs(hb.z) - 0.362;
  repClamp(hb.x, 0.200, 1.0);
  r = mn(r, vec2(sdBox(hb, vec3(0.082,0.018,0.034), 0.006), M_DARK));

  /* --- VRM inductors along the near long edge --- */
  vec3 vp = p - vec3(-0.18, 0.050, 0.755);
  repClamp(vp.x, 0.236, 4.0);
  r = mn(r, vec2(sdBox(vp - vec3(0.0,0.044,0.0), vec3(0.084,0.044,0.084), 0.014), M_DARK));
  r = mn(r, vec2(sdBox(vp - vec3(0.0,0.090,0.0), vec3(0.070,0.008,0.070), 0.006), M_STEEL));

  /* --- electrolytic caps along the far edge --- */
  vec3 cp = p - vec3(-0.60, 0.050, -0.700);
  repClamp(cp.x, 0.212, 2.0);
  r = mn(r, vec2(sdCylY(cp - vec3(0.0,0.088,0.0), 0.088, 0.054), M_STEEL));

  /* --- gold edge connectors, wrapping the near edge --- */
  vec3 gp = p - vec3(0.0, 0.0, 0.952);
  repClamp(gp.x, 0.0585, 19.0);
  float fing = sdBox(gp - vec3(0.0, 0.0480, 0.0),  vec3(0.0215,0.0045,0.050), 0.0025);
  fing = min(fing, sdBox(gp - vec3(0.0, 0.004, 0.0425), vec3(0.0205,0.046,0.0075), 0.003));
  r = mn(r, vec2(fing, M_GOLD));

  /* --- heat-sink fin stack on the far right --- */
  vec3 fp = p - vec3(1.045, 0.050, -0.300);
  repClamp(fp.x, 0.0960, 4.0);
  r = mn(r, vec2(sdBox(fp - vec3(0.0,0.185,0.0), vec3(0.0145,0.160,0.440), 0.008), M_ALU));
  r = mn(r, vec2(sdBox(p - vec3(1.045,0.072,-0.300), vec3(0.470,0.026,0.462), 0.012), M_ALU));

  /* --- dark plastic shroud bar on the far edge --- */
  r = mn(r, vec2(sdBox(p - vec3(-0.30, 0.088,-0.925), vec3(1.18,0.040,0.050), 0.022), M_PLASTIC));

  /* --- a few flat SMD packages --- */
  r = mn(r, vec2(sdBox(p - vec3(-1.165,0.062, 0.360), vec3(0.170,0.014,0.128), 0.006), M_DARK));
  r = mn(r, vec2(sdBox(p - vec3(-1.215,0.064,-0.060), vec3(0.118,0.016,0.200), 0.006), M_DARK));
  r = mn(r, vec2(sdBox(p - vec3( 0.740,0.062, 0.470), vec3(0.140,0.013,0.108), 0.005), M_DARK));
  r = mn(r, vec2(sdBox(p - vec3(-0.760,0.062,-0.330), vec3(0.096,0.013,0.150), 0.005), M_DARK));
  return r;
}

float cutPlane(vec3 q){
  return (q.x - XF - jag(q.z) - 0.016*sin(q.y*42.0))/JAGK;
}
vec2 boardHalfA(vec3 p, float best){
  vec3 q = invHalfA(p);
  float c = cutPlane(q);
  if(c >= best) return vec2(c, M_PCB);
  vec2 r = boardParts(q);
  r.x = max(r.x, c);
  return r;
}
vec2 boardHalfB(vec3 p, float best){
  vec3 q = invHalfB(p);
  float c = -cutPlane(q);
  if(c >= best) return vec2(c, M_PCB);
  vec2 r = boardParts(q);
  r.x = max(r.x, c);
  return r;
}

/* the hot core filling the tear */
vec2 coreMap(vec3 p){
  vec3 q = p;
  q.x -= XF + GAPC + jag(q.z);
  float hy = 0.060 + 0.016*sin(q.z*15.0) + 0.011*sin(q.z*33.0+2.0) + 0.008*sin(q.z*61.0+0.7);
  float w  = 0.048 + 0.014*sin(q.z*11.0+1.3);
  float d  = sdBox(q, vec3(w, hy, 0.965), 0.014);
  float dd = sdBox(q - vec3(0.0,0.082,0.02), vec3(w*0.90, 0.046, 0.375), 0.012);
  return vec2(min(d,dd)/JAGK, M_CORE);
}

/* broken shards drifting out of the tear */
const vec4 SH[7] = vec4[7](
  vec4(-0.030, 0.300, 0.455, 0.078),
  vec4( 0.125, 0.470, 0.090, 0.056),
  vec4(-0.145, 0.235,-0.430, 0.066),
  vec4( 0.070, 0.625,-0.175, 0.044),
  vec4(-0.055, 0.845, 0.305, 0.037),
  vec4( 0.205, 0.390, 0.730, 0.050),
  vec4(-0.100, 1.040,-0.050, 0.029)
);
const vec3 SH_C = vec3(0.04, 0.62, 0.08);
const vec3 SH_E = vec3(0.50, 0.78, 0.95);

/* small embers thrown out of the crack; they exist mainly to bloom */
const vec4 EM[10] = vec4[10](
  vec4(-0.020, 0.175, 0.620, 0.016), vec4( 0.060, 0.330, 0.270, 0.013),
  vec4(-0.080, 0.255,-0.600, 0.014), vec4( 0.015, 0.520, 0.470, 0.011),
  vec4(-0.040, 0.430,-0.230, 0.010), vec4( 0.090, 0.690, 0.060, 0.009),
  vec4(-0.015, 0.760, 0.400, 0.008), vec4( 0.045, 0.930,-0.320, 0.007),
  vec4(-0.070, 1.080, 0.150, 0.007), vec4( 0.020, 0.150,-0.810, 0.012)
);

vec2 shardsMap(vec3 p){
  vec2 r = vec2(1e5, 0.0);
  for(int i=0;i<10;i++){
    vec4 e = EM[i];
    r = mn(r, vec2(sdSph(p - vec3(XF + GAPC,0.0,0.0) - e.xyz, e.w), M_CORE));
  }
  for(int i=0;i<7;i++){
    vec4 s = SH[i];
    float fi = float(i);
    vec3 q = p - vec3(XF,0.0,0.0) - s.xyz;
    q = rotY(q, fi*1.13 + 0.40);
    q = rotZ(q, fi*0.77 + 0.90);
    q = rotX(q, fi*1.57 + 0.20);
    float d = sdBox(q, vec3(s.w*1.95, s.w*0.26, s.w*1.25), s.w*0.13);
    /* a jagged bite out of one corner so they do not read as tiles */
    d = max(d, -sdSph(q - vec3(s.w*1.9, 0.0, s.w*1.2), s.w*1.15));
    r = mn(r, vec2(d, (i==1 || i==4 || i==6) ? M_SHARD : M_PCB));
  }
  return r;
}

/* ================================================= dark server-hall canyon */
vec2 canyonMap(vec3 p){
  /* conservative early-out: nothing in the hall is nearer than this */
  float ax = abs(p.x);
  float cheap = min(33.84 - ax, p.y + 78.0);
  if(cheap > 2.2) return vec2(cheap, M_CONCRETE);

  vec2 r = vec2(1e5, 0.0);
  vec3 q = p; q.x = abs(q.x);

  /* two rack faces far out on either side, capped top and bottom so the
     hall genuinely falls away into a void                               */
  float wall = max(34.0 - q.x, max(p.y - 26.0, -p.y - 60.0));

  vec3 b = q;
  float cy = floor(p.y/3.90 + 0.5), cz = floor(p.z/6.60 + 0.5);
  b.y = p.y - cy*3.90;
  b.z = p.z - cz*6.60;
  float bay = sdBox(b - vec3(35.10, 0.0, 0.0), vec3(1.20, 1.10, 2.00), 0.08);
  r = mn(r, vec2(max(wall, -bay), M_CONCRETE));

  /* rack light bars recessed in each bay, only on the populated floors */
  float live = step(-16.0, p.y)*step(p.y, 7.0);
  float led = sdBox(b - vec3(33.90, 0.62, 0.0), vec3(0.040, 0.030, 1.74), 0.012);
  r = mn(r, vec2(led + (1.0-live)*80.0, M_LED));

  /* a very distant floor so the void has a bottom */
  r = mn(r, vec2(p.y + 78.0, M_CONCRETE));
  return r;
}

/* ---------------------------------------------------------------- the map */
const vec3 ASM_C = vec3(0.0, 0.26, 0.0);
const vec3 ASM_E = vec3(1.72, 0.92, 1.18);

vec2 mapScene(vec3 p){
  vec2 res = canyonMap(p);
  float bb = sdBox(p - ASM_C, ASM_E, 0.0);
  if(bb < 0.30){
    vec3 q = toBoard(p);
    res = mn(res, boardHalfA(q, res.x));
    res = mn(res, boardHalfB(q, res.x));
    res = mn(res, coreMap(q));
    float sb = sdBox(q - SH_C, SH_E, 0.0);
    if(sb < 0.22) res = mn(res, shardsMap(q));
    else          res.x = min(res.x, sb);
  } else {
    res.x = min(res.x, bb);
  }
  return res;
}

/* ============================================================== materials */
Mat matOf(float id, vec3 p, vec3 n){
  vec3 bl = toBoard(p);
  float fx = bl.x - XF - GAPC - jag(bl.z);
  float up = smoothstep(0.25, 0.70, abs(n.y));

  if(id == M_PCB || id == M_SHARD){
    float tr    = smoothstep(0.52, 0.80, fbm2(bl.xz*vec2(7.0,7.0)));
    float lx    = smoothstep(0.86, 0.94, fract(bl.x*21.0));
    float lz    = smoothstep(0.86, 0.94, fract(bl.z*21.0));
    float lines = max(lx, lz)*tr*up;
    float pads  = smoothstep(0.86,0.94, fbm2(bl.xz*vec2(26.0,26.0)))*up;
    vec3 alb = mix(vec3(0.058,0.175,0.082), vec3(0.110,0.285,0.138), tr*0.8);
    alb = mix(alb, vec3(0.48,0.38,0.14), lines*0.70);
    alb = mix(alb, vec3(0.75,0.60,0.24), pads*0.35);
    /* torn edges expose dark laminate with copper plies */
    float inner = (1.0-up)*smoothstep(0.34, 0.12, abs(fx));
    float ply   = smoothstep(0.55, 0.85, fbm2(vec2(bl.x*3.0, bl.y*90.0)));
    alb = mix(alb, mix(vec3(0.085,0.070,0.046), vec3(0.32,0.17,0.075), ply), inner*0.92);
    float rough = mix(0.46, 0.26, max(lines,pads));
    rough = mix(rough, 0.72, inner);
    float metal = max(lines,pads)*0.85;
    /* heat bleeding out of the fracture, plus glowing hairline cracks */
    float vein  = exp(-max(abs(fx)-0.130, 0.0)*22.0);
    float crack = smoothstep(0.52, 0.92, fbm2(bl.xz*vec2(1.7,13.0)));
    vec3 em = vec3(0.44,1.15,0.58)*vein*(0.10 + 0.85*crack)*up;
    /* the torn faces themselves run hot */
    float face = exp(-pow((abs(fx)-0.135)/0.040, 2.0));
    em += vec3(0.70,1.70,0.88)*face*(1.0-up)*0.95;
    if(id == M_SHARD) em += vec3(0.55,1.45,0.70)*0.55;
    return mkMat(alb, rough, metal, em, 1.0);
  }
  if(id == M_LID){
    /* brushed along the board x axis */
    float br = fbm2(vec2(bl.x*300.0, bl.z*5.0));
    return mkMat(vec3(0.86,0.885,0.930), 0.195 + 0.105*br, 1.0, vec3(0.0), 1.0);
  }
  if(id == M_GOLD){
    /* gold plating over nickel: a little diffuse keeps it warm in the dark */
    return mkMat(vec3(1.00,0.600,0.155), 0.280, 0.60, vec3(0.075,0.040,0.010), 1.0);
  }
  if(id == M_ALU){
    float br = fbm2(vec2(bl.z*220.0, bl.y*6.0));
    return mkMat(vec3(0.500,0.522,0.560), 0.520 + 0.17*br, 1.0, vec3(0.0), 1.0);
  }
  if(id == M_STEEL){
    return mkMat(vec3(0.430,0.450,0.480), 0.330, 1.0, vec3(0.0), 1.0);
  }
  if(id == M_DARK){
    float g = fbm2(bl.xz*55.0);
    return mkMat(vec3(0.026,0.028,0.032)*(0.7+0.6*g), 0.44, 0.08, vec3(0.0), 1.0);
  }
  if(id == M_PLASTIC){
    return mkMat(vec3(0.018,0.019,0.022), 0.265, 0.0, vec3(0.0), 1.0);
  }
  if(id == M_CORE){
    float hot  = smoothstep(0.090, 0.004, abs(fx));
    float band = 0.68 + 0.60*fbm2(vec2(bl.z*9.0, bl.y*14.0));
    /* white-hot only down inside the slot; the exposed lip stays green */
    float depth = smoothstep(0.055, -0.045, bl.y);
    vec3 em = mix(vec3(0.26,1.30,0.40), vec3(1.00,1.85,1.12), depth*hot);
    em *= (1.35 + 3.9*hot)*band*(0.60 + 1.00*depth);
    return mkMat(vec3(0.02,0.05,0.03), 0.50, 0.0, em, 1.0);
  }
  if(id == M_LED){
    vec2 cell = floor(vec2(p.y/3.90 + 0.5, p.z/6.60 + 0.5));
    float h = hash12(cell*7.13 + 3.1*step(p.x, 0.0));
    vec3 c = mix(vec3(0.30,0.52,1.05), vec3(0.34,1.05,0.58), step(0.74, h));
    /* the left wall is kept dim: that third of the frame is reserved */
    float side = (p.x < 0.0) ? 0.78 : 1.0;
    return mkMat(vec3(0.02), 0.4, 0.0, c*(0.42 + 1.55*h)*side, 0.0);
  }
  /* concrete / structure */
  float gg = fbm2(p.yz*2.2);
  float dim = (p.x < 0.0) ? 0.62 : 1.0;
  return mkMat(vec3(0.0032,0.0038,0.0052)*(0.55+0.9*gg)*dim, 0.94, 0.01, vec3(0.0), 0.0);
}

/* ============================================================ environment */
vec3 skyCol(vec3 d){
  float y = d.y;
  vec3 up = vec3(0.0150,0.0225,0.0410);
  vec3 hz = vec3(0.0052,0.0080,0.0155);
  vec3 dn = vec3(0.0007,0.0009,0.0016);
  vec3 c = (y > 0.0) ? mix(hz, up, pow(y, 0.62)) : mix(hz, dn, pow(-y, 0.45));
  /* faint green bounce coming back up out of the canyon */
  c += vec3(0.022,0.062,0.030)*max(-d.y, 0.0)*0.40;
  return c;
}
vec3 env(vec3 d, float rough){
  vec3 s = skyCol(d)*2.4;
  float a = max(dot(d, LKEY), 0.0);
  vec3 blob = vec3(0.62,0.78,1.00)*pow(a, mix(600.0, 2.0, rough))*mix(16.0, 2.4, rough);
  float b = max(dot(d, LRIM), 0.0);
  blob += vec3(0.70,0.86,1.00)*pow(b, mix(900.0, 5.0, rough))*mix(9.0, 1.1, rough);
  blob += vec3(0.52,0.64,0.95)*pow(max(d.y,0.0), 2.2)*mix(2.8, 0.9, rough);
  float c2 = max(dot(d, LWARM), 0.0);
  blob += vec3(1.00,0.60,0.24)*pow(c2, mix(140.0, 1.5, rough))*mix(3.4, 0.9, rough);
  vec3 avg = vec3(0.0075,0.0098,0.0160);
  return mix(s, avg, rough*0.70) + blob;
}
vec3 background(vec3 rd){
  /* no visible light source in the plate: the badge corner must stay clean */
  return skyCol(rd);
}

/* ================================================================ shading */
vec3 shadePoint(vec3 p, vec3 n, vec3 rd, Mat m, float t){
  vec3 v = -rd;
  float ao = calcAO(p, n);
  vec3 col = m.emis;

  /* cool key from the upper left, soft penumbra */
  float sh1 = softShadow(p + n*0.004, LKEY, 0.020, 11.0, 7.0, 26);
  col += brdfA(n, v, LKEY, m, KEYCOL, 0.26) * sh1;

  /* tight rim from behind */
  float sh2 = softShadow(p + n*0.004, LRIM, 0.020, 8.0, 26.0, 16);
  col += brdfA(n, v, LRIM, m, RIMCOL, 0.24) * sh2;

  /* the fracture itself, as a line of point lights */
  for(int i=0;i<5;i++){
    float z = -0.84 + 0.42*float(i);
    vec3 lp = fracWorld(z);
    vec3 dv = lp - p;
    float dd = length(dv);
    vec3 L = dv/max(dd, 1e-4);
    float att = 1.0/(1.0 + 30.0*dd*dd);
    float occ = (i == 2) ? lightOcc(p + n*0.004, L, min(dd, 2.2), 13) : 1.0;
    col += brdfA(n, v, L, m, CORECOL*att, 0.07) * occ;
  }

  /* warm bounce off the hall, unshadowed fill */
  col += brdfA(n, v, LWARM, m, WARMCOL, 0.30) * (0.25 + 0.75*ao);

  /* environment: specular IBL + hemispherical diffuse */
  vec3 f0 = mix(vec3(0.045), m.alb, m.metal);
  float NoV = max(dot(n, v), 1e-4);
  vec3 F = F_Schlick(f0, NoV);
  col += env(reflect(rd, n), m.rough) * F * (1.0 - 0.95*m.rough) * mix(1.0, ao, 0.65);
  vec3 irr = mix(vec3(0.0070,0.0150,0.0098), vec3(0.0340,0.0470,0.0740), n.y*0.5 + 0.5);
  col += m.alb*(1.0 - m.metal)*irr*ao;

  /* fresnel rim accent so silhouettes separate from the dark */
  float fr = pow(1.0 - NoV, 5.0);
  col += vec3(0.30,0.50,0.88)*fr*0.26*ao*(1.0 - m.rough)*(1.0 - m.rough);

  /* depth haze */
  float hz = 1.0 - exp(-max(t - 3.4, 0.0)*0.030);
  col = mix(col, vec3(0.0040,0.0058,0.0105), hz*0.80);
  return col;
}
`
};
