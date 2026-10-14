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
