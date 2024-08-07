#include ../includes/simplexNoise4d.glsl

uniform float uTime;
uniform float uDeltaTime;
uniform float uFlowFieldInfluence;

uniform sampler2D uBase;

void main()
{
    float time = uTime * 0.02;

    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 particle = texture(uParticles, uv);
    vec4 base = texture(uBase, uv);

    // particle decay using the alpha chanel
    if (particle.a >= 1.0) {
        // use modulo to not exceed value of 1.0
        particle.a = mod(particle.a, 1.0);
        particle.xyz = base.xyz;
    } else {
    vec3 flowField = vec3(
        simplexNoise4d(vec4(particle.xyz + 0.0, time)),
        simplexNoise4d(vec4(particle.xyz + 1.0, time)),
        simplexNoise4d(vec4(particle.xyz + 2.0, time))
    );
    float strength = simplexNoise4d(vec4(base.xyz * 0.2, time + 1.0));
    // invert the uFlowFieldInfluence, the value goes from 0 to 1 but we want it to go from -1 to 1
    float influence = (uFlowFieldInfluence - 0.5) * (- 2.0);
    strength = smoothstep(influence, 1.0, strength); 
    flowField = normalize(flowField);
    particle.xyz += flowField * uDeltaTime * strength * 0.5;

    // decay
    particle.a += uDeltaTime * 0.3;
    };

    gl_FragColor = particle;
}