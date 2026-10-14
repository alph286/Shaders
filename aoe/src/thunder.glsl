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
