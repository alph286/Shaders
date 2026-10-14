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
