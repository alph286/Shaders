// Cinque nuovi shader ad area per Magnetron (public/shared/shader-effects.js).
// Incollare le voci dentro AOE_SHADER_EFFECTS: ognuna usa aoeEffectFragmentSrc(...)
// esattamente come gold_divine_light/web_area. Non servono texture (rumore procedurale),
// l'output e' alpha premoltiplicato. Sorgenti originali in aoe/src/*.glsl.
const NEW_AOE_SHADER_EFFECTS = {
  lightning: {
    label: 'Fulmine',
    fragmentSrc: aoeEffectFragmentSrc(`
float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
}

float noise(vec2 x) {
    vec2 p = floor(x);
    vec2 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(p);
    float b = hash(p + vec2(1.0, 0.0));
    float c = hash(p + vec2(0.0, 1.0));
    float d = hash(p + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

const mat2 FBM_M = mat2(1.6, 1.2, -1.2, 1.6);
float fbm(vec2 p) {
    float f = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
        f += a * noise(p);
        p = FBM_M * p;
        a *= 0.5;
    }
    return f;
}

// "Raggio" quasi-quadrato: copre bene sia Sfera sia Cubo/Cono/Linea (la
// sagoma vera la ritaglia comunque la maschera poligonale).
float areaRadius(vec2 p) {
    vec2 q = p * p;
    return sqrt(sqrt(q.x * q.x + q.y * q.y));
}

// Fulmine: scariche ramificate e intermittenti che partono dal centro.
float bolt(vec2 p, vec2 dir, float seed, float tick, float len, float width) {
    vec2 perp = vec2(-dir.y, dir.x);
    float s = dot(p, dir);
    float o = dot(p, perp);
    float grow = smoothstep(0.0, 0.3, s);
    float j = (fbm(vec2(s * 4.5 + seed * 17.0, tick * 0.37 + seed)) - 0.5) * 0.7 * grow;
    j += (noise(vec2(s * 20.0 + seed * 5.0, tick)) - 0.5) * 0.09 * grow;
    float d = abs(o - j);
    float core = smoothstep(width, 0.0, d);
    float glow = exp(-d * 16.0) * 0.45;
    float span = smoothstep(-0.02, 0.03, s) * (1.0 - smoothstep(len * 0.78, len, s));
    return (core + glow) * span;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 p = (2.0 * fragCoord - u_resolution.xy) / u_resolution.y;
    float t = u_time;
    float rate = 2.4;
    float epoch = floor(t * rate);
    float ph = fract(t * rate);
    float tick = floor(t * 14.0);

    // colpo principale + ri-colpo, poi un debole crepitio residuo
    float flash = exp(-ph * 5.0) + 0.55 * exp(-abs(ph - 0.28) * 26.0);
    float level = 0.16 + 0.95 * flash;

    float sum = 0.0;
    for (int i = 0; i < 4; i++) {
        float fi = float(i);
        float seed = hash(vec2(fi, epoch));
        float ang = seed * 6.2831 + fi * 1.5707;
        vec2 dir = vec2(cos(ang), sin(ang));
        sum += bolt(p, dir, seed, tick + fi * 3.0, 1.35, 0.012) * level;

        // ramo laterale che si stacca a ~40% del fulmine
        float ba = ang + (seed - 0.5) * 1.6;
        vec2 bdir = vec2(cos(ba), sin(ba));
        vec2 bo = dir * (0.35 + 0.15 * seed);
        sum += bolt(p - bo, bdir, seed + 0.5, tick + fi * 7.0, 0.8, 0.009) * level * 0.7;
    }

    float rad = length(p);
    float haze = (fbm(p * 2.5 + vec2(0.0, -t * 0.4)) * 0.6 + 0.2) * exp(-rad * 1.6);
    sum += haze * (0.25 + 0.5 * flash);
    sum += exp(-rad * 7.0) * (0.3 + 0.9 * flash);

    float mask = 1.0 - smoothstep(0.82, 1.18, areaRadius(p));
    float a = clamp(sum, 0.0, 1.0) * mask;
    vec3 col = mix(vec3(0.35, 0.55, 1.0), vec3(0.92, 0.96, 1.0), clamp(sum * 0.9, 0.0, 1.0));
    col += vec3(0.25, 0.1, 0.5) * haze * 0.4;
    fragColor = vec4(col * a, a);
}
`)
  },
  frost: {
    label: 'Gelo',
    fragmentSrc: aoeEffectFragmentSrc(`
float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
}

float noise(vec2 x) {
    vec2 p = floor(x);
    vec2 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(p);
    float b = hash(p + vec2(1.0, 0.0));
    float c = hash(p + vec2(0.0, 1.0));
    float d = hash(p + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

const mat2 FBM_M = mat2(1.6, 1.2, -1.2, 1.6);
float fbm(vec2 p) {
    float f = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
        f += a * noise(p);
        p = FBM_M * p;
        a *= 0.5;
    }
    return f;
}

// "Raggio" quasi-quadrato: copre bene sia Sfera sia Cubo/Cono/Linea (la
// sagoma vera la ritaglia comunque la maschera poligonale).
float areaRadius(vec2 p) {
    vec2 q = p * p;
    return sqrt(sqrt(q.x * q.x + q.y * q.y));
}

// Gelo: cristalli che crescono dai bordi, crepe luminose e scintillii.
vec3 voronoi(vec2 p) {
    vec2 n = floor(p);
    vec2 f = fract(p);
    float f1 = 8.0, f2 = 8.0, id = 0.0;
    for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
            vec2 g = vec2(float(i), float(j));
            vec2 o = hash22(n + g);
            vec2 r = g + o - f;
            float d = dot(r, r);
            if (d < f1) { f2 = f1; f1 = d; id = hash(n + g); }
            else if (d < f2) { f2 = d; }
        }
    }
    return vec3(sqrt(f1), sqrt(f2), id);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 p = (2.0 * fragCoord - u_resolution.xy) / u_resolution.y;
    float t = u_time;
    float d = areaRadius(p);

    // fronte del ghiaccio: respira lentamente, frastagliato dal rumore
    float front = 0.50 + 0.07 * sin(t * 0.5);
    float edgeNoise = (fbm(p * 3.2 + 4.0) - 0.5) * 0.55;
    float frost = smoothstep(front, front + 0.45, d + edgeNoise);

    // facce dei cristalli (grandi) e crepe (bordi di Voronoi)
    vec3 v = voronoi(p * 4.2);
    float edge = v.y - v.x;
    float cracks = exp(-edge * 16.0);
    float facet = 0.5 + 0.5 * sin(t * 0.6 + v.z * 6.2831);
    vec3 v2 = voronoi(p * 9.5 + 11.0);
    float fine = exp(-(v2.y - v2.x) * 20.0);

    // scintillii
    vec2 sp = p * 26.0;
    vec2 sg = floor(sp);
    float sh = hash(sg);
    vec2 sc = 0.25 + 0.5 * hash22(sg + 5.0);
    float dotShape = smoothstep(0.30, 0.0, length(fract(sp) - sc));
    float twinkle = step(0.90, sh) * dotShape * pow(0.5 + 0.5 * sin(t * 3.0 + sh * 60.0), 4.0);

    float haze = 0.20 + 0.18 * fbm(p * 2.0 + t * 0.05);
    float a = haze + frost * (0.35 + 0.25 * facet) + cracks * (0.25 + 0.5 * frost)
            + fine * 0.18 * frost + twinkle * 0.9;
    float mask = 1.0 - smoothstep(0.80, 1.16, d);
    a = clamp(a, 0.0, 1.0) * mask;

    vec3 deep = vec3(0.22, 0.55, 0.95);
    vec3 pale = vec3(0.82, 0.95, 1.0);
    float bright = clamp(0.25 + frost * 0.5 + cracks * 0.5 + facet * 0.2 + twinkle, 0.0, 1.0);
    vec3 col = mix(deep, pale, bright);
    col = mix(col, vec3(1.0), clamp(twinkle, 0.0, 1.0));
    fragColor = vec4(col * a, a);
}
`)
  },
  acid: {
    label: 'Acido / veleno',
    fragmentSrc: aoeEffectFragmentSrc(`
float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
}

float noise(vec2 x) {
    vec2 p = floor(x);
    vec2 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(p);
    float b = hash(p + vec2(1.0, 0.0));
    float c = hash(p + vec2(0.0, 1.0));
    float d = hash(p + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

const mat2 FBM_M = mat2(1.6, 1.2, -1.2, 1.6);
float fbm(vec2 p) {
    float f = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
        f += a * noise(p);
        p = FBM_M * p;
        a *= 0.5;
    }
    return f;
}

// "Raggio" quasi-quadrato: copre bene sia Sfera sia Cubo/Cono/Linea (la
// sagoma vera la ritaglia comunque la maschera poligonale).
float areaRadius(vec2 p) {
    vec2 q = p * p;
    return sqrt(sqrt(q.x * q.x + q.y * q.y));
}

// Acido / veleno: pozza verde-giallastra con bolle che scoppiano e vapori.
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 p = (2.0 * fragCoord - u_resolution.xy) / u_resolution.y;
    float t = u_time;
    float d = areaRadius(p);

    // liquido: domain warp lento
    vec2 q = p * 2.0;
    vec2 w = vec2(fbm(q + vec2(0.0, t * 0.15)), fbm(q + vec2(3.7, -t * 0.12)));
    float f = fbm(q + (w - 0.5) * 1.6);

    vec3 dark = vec3(0.04, 0.30, 0.05);
    vec3 lime = vec3(0.50, 0.92, 0.08);
    vec3 yel  = vec3(0.92, 1.00, 0.30);
    vec3 col = mix(dark, lime, smoothstep(0.25, 0.7, f));
    col = mix(col, yel, smoothstep(0.62, 0.85, f) * 0.8);

    // bolle: una per cella, crescono e poi scoppiano con un anello
    vec2 bp = p * 3.6;
    vec2 cell = floor(bp);
    vec2 fp = fract(bp);
    float h = hash(cell);
    vec2 c = 0.3 + 0.4 * hash22(cell + 7.0);
    float life = fract(t * 0.32 + h * 3.0);
    float grow = smoothstep(0.0, 0.8, life);
    float r = (0.05 + 0.13 * hash(cell + 3.0)) * (0.3 + 0.7 * grow);
    float bd = length(fp - c);
    float alive = step(0.35, hash(cell + 11.0));
    float rim = exp(-abs(bd - r) * 70.0) * (1.0 - smoothstep(0.82, 0.95, life)) * alive;
    float spot = smoothstep(r * 0.35, 0.0, length(fp - c - vec2(-r, r) * 0.45)) * alive
               * (1.0 - smoothstep(0.82, 0.95, life));
    float pop = smoothstep(0.82, 0.86, life) * (1.0 - smoothstep(0.86, 1.0, life));
    float popRing = exp(-abs(bd - (r + (life - 0.84) * 0.8)) * 55.0) * pop * alive;
    float fill = smoothstep(r, r * 0.4, bd) * 0.18 * alive * (1.0 - pop);

    // vapori che salgono
    float v = fbm(p * vec2(2.2, 1.4) + vec2(0.0, -t * 0.3));
    float vapor = smoothstep(0.52, 0.86, v) * 0.38 * (0.4 + 0.6 * smoothstep(-0.5, 0.8, p.y));

    float mask = 1.0 - smoothstep(0.82, 1.14, d);
    float edge = smoothstep(0.6, 0.92, d) * (0.3 + 0.7 * f);   // bordo della pozza piu' denso
    float a = (0.55 + 0.25 * f + edge * 0.2 + rim * 0.6 + popRing * 0.6 + fill + vapor) * mask;
    col += (vec3(0.5, 0.9, 0.4)) * (rim + popRing) * 0.6 + vec3(0.9, 1.0, 0.8) * (spot + vapor * 0.6);
    a = clamp(a, 0.0, 1.0);
    fragColor = vec4(clamp(col, 0.0, 1.0) * a, a);
}
`)
  },
  necrotic: {
    label: 'Necrotico',
    fragmentSrc: aoeEffectFragmentSrc(`
float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
}

float noise(vec2 x) {
    vec2 p = floor(x);
    vec2 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(p);
    float b = hash(p + vec2(1.0, 0.0));
    float c = hash(p + vec2(0.0, 1.0));
    float d = hash(p + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

const mat2 FBM_M = mat2(1.6, 1.2, -1.2, 1.6);
float fbm(vec2 p) {
    float f = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
        f += a * noise(p);
        p = FBM_M * p;
        a *= 0.5;
    }
    return f;
}

// "Raggio" quasi-quadrato: copre bene sia Sfera sia Cubo/Cono/Linea (la
// sagoma vera la ritaglia comunque la maschera poligonale).
float areaRadius(vec2 p) {
    vec2 q = p * p;
    return sqrt(sqrt(q.x * q.x + q.y * q.y));
}

// Necrotico: oscurita' viola con filamenti d'ombra risucchiati verso il centro.
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 p = (2.0 * fragCoord - u_resolution.xy) / u_resolution.y;
    float t = u_time;
    float d = areaRadius(p);
    float rad = length(p);
    float ang = atan(p.y, p.x);

    float n = fbm(p * 2.2 + vec2(0.0, t * 0.1));
    float n2 = fbm(p * 4.5 - t * 0.12);

    // bande di energia che scorrono verso l'interno
    float band = pow(0.5 + 0.5 * sin(rad * 7.0 + t * 1.5 + n * 4.0), 3.0);
    // filamenti radiali (numero intero di raggi: nessuna cucitura in atan)
    float streak = pow(0.5 + 0.5 * sin(ang * 9.0 + n * 5.0 + rad * 4.0 - t * 0.3), 7.0);
    float fine = pow(0.5 + 0.5 * sin(ang * 21.0 - n2 * 6.0 + rad * 8.0 + t * 0.4), 9.0);
    float tend = (streak + fine * 0.6) * (0.25 + 0.75 * band) * smoothstep(0.1, 0.4, rad);

    // buco nero al centro con bordo luminoso
    float hole = smoothstep(0.22, 0.12, rad);
    float rim = exp(-abs(rad - 0.23 - 0.02 * sin(t * 1.3)) * 22.0);

    float mask = 1.0 - smoothstep(0.82, 1.16, d);
    float shade = 0.50 + 0.18 * n;               // velo scuro su tutta l'area
    float a = clamp(shade + tend * 0.55 + rim * 0.5 + hole, 0.0, 1.0) * mask;

    vec3 void_ = vec3(0.05, 0.0, 0.09);
    vec3 violet = vec3(0.62, 0.14, 0.95);
    vec3 magenta = vec3(0.95, 0.30, 0.85);
    vec3 col = mix(void_, violet, clamp(tend * 1.1 + n2 * 0.15, 0.0, 1.0));
    col = mix(col, magenta, clamp(rim * 0.8 + tend * 0.25, 0.0, 1.0));
    col += vec3(0.08, 0.35, 0.14) * tend * smoothstep(0.5, 1.0, d);   // punte verde malato
    col = mix(col, vec3(0.0), hole);
    fragColor = vec4(col * a, a);
}
`)
  },
  thunder: {
    label: 'Tuono (onda d’urto)',
    fragmentSrc: aoeEffectFragmentSrc(`
float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
}

float noise(vec2 x) {
    vec2 p = floor(x);
    vec2 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(p);
    float b = hash(p + vec2(1.0, 0.0));
    float c = hash(p + vec2(0.0, 1.0));
    float d = hash(p + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

const mat2 FBM_M = mat2(1.6, 1.2, -1.2, 1.6);
float fbm(vec2 p) {
    float f = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
        f += a * noise(p);
        p = FBM_M * p;
        a *= 0.5;
    }
    return f;
}

// "Raggio" quasi-quadrato: copre bene sia Sfera sia Cubo/Cono/Linea (la
// sagoma vera la ritaglia comunque la maschera poligonale).
float areaRadius(vec2 p) {
    vec2 q = p * p;
    return sqrt(sqrt(q.x * q.x + q.y * q.y));
}

// Tuono / onda d'urto: anelli che si espandono a impulsi, con polvere e scintille.
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 p = (2.0 * fragCoord - u_resolution.xy) / u_resolution.y;
    float t = u_time;
    float d = areaRadius(p);
    float rad = length(p);
    float ang = atan(p.y, p.x);

    float sum = 0.0;
    float dust = 0.0;
    float dark = 0.0;
    float sparks = 0.0;
    float centerFlash = 0.0;

    for (int k = 0; k < 3; k++) {
        float fk = float(k);
        float ph = fract(t * 0.42 + fk / 3.0);
        float r = ph * 1.2;
        float life = pow(1.0 - ph, 1.3);

        float front = exp(-pow((rad - r) / 0.045, 2.0));
        float behind = max(r - rad, 0.0);
        float trail = exp(-behind * 5.0) * smoothstep(-0.015, 0.02, r - rad);
        dark += exp(-pow((rad - (r - 0.10)) / 0.035, 2.0)) * life;   // banda scura: l'aria compressa

        float dn = fbm(p * 4.0 + vec2(fk * 5.0, -t * 0.25));
        dust += trail * dn * life * 0.8;

        float spike = pow(0.5 + 0.5 * cos(ang * 26.0 + fk * 2.0 + dn * 3.0), 8.0);
        sparks += spike * front * life;

        sum += front * life;
        centerFlash += exp(-ph * 12.0);
    }

    centerFlash *= exp(-rad * 6.0);
    float mask = 1.0 - smoothstep(0.82, 1.16, d);
    float a = clamp(sum * 0.9 + dust * 0.6 + dark * 0.35 + sparks * 0.7 + centerFlash, 0.0, 1.0) * mask;

    vec3 white = vec3(0.90, 0.94, 1.0);
    vec3 blue = vec3(0.35, 0.55, 1.0);
    vec3 sand = vec3(0.68, 0.60, 0.48);
    vec3 col = mix(blue, white, clamp(sum + sparks + centerFlash, 0.0, 1.0));
    col = mix(col, sand, clamp(dust * 0.9, 0.0, 0.8) * (1.0 - clamp(sum, 0.0, 1.0)));
    col = mix(col, vec3(0.04, 0.05, 0.12), clamp(dark * 0.8, 0.0, 0.7) * (1.0 - clamp(sum, 0.0, 1.0)));
    fragColor = vec4(col * a, a);
}
`)
  },
};
