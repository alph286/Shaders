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
