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
