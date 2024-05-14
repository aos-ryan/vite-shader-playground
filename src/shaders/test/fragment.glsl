varying vec2 vUv;

// book of shaders pseudo-random value functiion 
float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main()
{
    // dashed lines
    // float strength = step(0.5, mod(vUv.x * 10.0, 1.0));
    // strength *= step(0.8, mod(vUv.y * 10.0, 1.0));

    // float barX = step(0.4, mod(vUv.x * 10.0, 1.0)) * step(0.8, mod(vUv.y * 10.0, 1.0));
    // float barY = step(0.8, mod(vUv.x * 10.0, 1.0)) * step(0.4, mod(vUv.y * 10.0, 1.0));
    // float strength = barX + barY;

    // offset x by 0.5  so it goes from -0.5 to 0.5 instead of 0.0 to 1.0, abs makes the value always pos
    // float strength = abs(vUv.x - 0.5);

    // float strength = min(abs(vUv.x - 0.5), abs(vUv.y - 0.5));

    // vec2 gridUv = vec2(floor(vUv.x * 20.0) / 10.0, floor(vUv.y * 20.0) / 10.0);
    // float strength = random(gridUv);

    // float strength = distance(vUv, vec2(0.5));
    // or using offset
    float strength = length(vUv - 0.5);


    gl_FragColor = vec4(vec3(strength), 1.0);
}