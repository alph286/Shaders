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
