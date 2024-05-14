varying vec2 vUv;
uniform float uTime;
#define PI 3.1415926535897932384626433832795

// book of shaders pseudo-random value functiion 
float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// perlin noise 
//	Classic Perlin 2D Noise 
//	by Stefan Gustavson
//
vec2 fade(vec2 t)
{
    return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// permute function
vec4 permute(vec4 x)
{
    return mod(((x*34.0)+1.0)*x, 289.0);
}

float cnoise(vec2 P)
{
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
    vec4 ix = Pi.xzxz;
    vec4 iy = Pi.yyww;
    vec4 fx = Pf.xzxz;
    vec4 fy = Pf.yyww;
    vec4 i = permute(permute(ix) + iy);
    vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
    vec4 gy = abs(gx) - 0.5;
    vec4 tx = floor(gx + 0.5);
    gx = gx - tx;
    vec2 g00 = vec2(gx.x,gy.x);
    vec2 g10 = vec2(gx.y,gy.y);
    vec2 g01 = vec2(gx.z,gy.z);
    vec2 g11 = vec2(gx.w,gy.w);
    vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
    g00 *= norm.x;
    g01 *= norm.y;
    g10 *= norm.z;
    g11 *= norm.w;
    float n00 = dot(g00, vec2(fx.x, fy.x));
    float n10 = dot(g10, vec2(fx.y, fy.y));
    float n01 = dot(g01, vec2(fx.z, fy.z));
    float n11 = dot(g11, vec2(fx.w, fy.w));
    vec2 fade_xy = fade(Pf.xy);
    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
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
    // float strength = length(vUv - 0.5);

    // light lens effect, divide by previously calc distance, center is 0.5
    // float strength = 0.015 / (distance(vUv, vec2(0.5)));

    // same as previous but break out the x and y of uv to manipulate the values
    // vec2 lightUv = vec2(
    //     vUv.x * 0.1 + 0.45,
    //     vUv.y * 0.5 + 0.25
    // );
    // float strength = 0.015 / (distance(lightUv, vec2(0.5)));

    // CIRCLE step between 0.5 and the distance of the uv to 0.5 
    // can control radius by first value or by adding offset at the end
    // float strength = step(0.1, distance(vUv, vec2(0.5)));

    // CIRCLE but use ABS to get an absolute (i.e. positive in this case) value
    // float strength = step(0.02, abs(distance(vUv, vec2(0.5)) - 0.25));

    // CIRCLE but inverted
    // float strength = 1.0 - step(0.02, abs(distance(vUv, vec2(0.5)) - 0.25));

    // CIRCLE but use sin for distortion
    // vec2 waveUv = vec2(
    //     vUv.x,
    //     vUv.y + sin(vUv.x * 30.0) * 0.1
    // );
    // float strength = 1.0 - step(0.02, abs(distance(waveUv, vec2(0.5)) - 0.25));

    // What happens if you apply the same to the y?
    // vec2 waveUv = vec2(
    //     vUv.x + sin(vUv.y * 30.0) * 0.1,
    //     vUv.y + sin(vUv.x * 30.0) * 0.1
    // );
    // float strength = 1.0 - step(0.02, abs(distance(waveUv, vec2(0.5)) - 0.25));

    // now animate it over time
    // vec2 waveUv = vec2(
    //     vUv.x + sin(vUv.y * uTime / 1000.0) * 0.1,
    //     vUv.y + sin(vUv.x * uTime / 1000.0) * 0.1
    // );
    // float strength = 1.0 - step(0.02, abs(distance(waveUv, vec2(0.5)) - 0.25));

    // ATAN angles from 2D coords
    // float angle = atan(vUv.x, vUv.y);
    // float strength = angle;

    // ATAN same as above but start at center (add offset)
    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
    // float strength = angle;

    // ATAN now use PI
    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
    // angle /= PI * 2.0;
    // angle += 0.5;
    // float strength = angle;

    // ATAN combine with modulo to go from 0 to 1
    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5) / (PI * 2.0) + 0.5;
    // float strength = mod(angle * 50.0, 1.0);
    
    // ATAN same but with sin
    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5) / (PI * 2.0) + 0.5;
    // float strength = sin(angle * 100.0);

    // use the angle value to calculate radius of a circle
    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5) / (PI * 2.0) + 0.5;
    // float radius = 0.25 + sin(angle * 100.0) * 0.02;
    // float strength = 1.0 - step(0.02, abs(distance(vUv, vec2(0.5)) - radius));

    // PERLIN NOISE
    // float strength = cnoise(vUv * 10.0);

    // PERLIN NOISE w/ step
    float strength = step(0.0, cnoise(vUv * 10.0));

    gl_FragColor = vec4(vec3(strength), 1.0);
}