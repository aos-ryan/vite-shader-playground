in vec2 uvInterpolator;
uniform float uTime;
uniform sampler2D uTexture;

float random(float inputValue, float seed) {
  return fract(sin(inputValue + 365.365) * seed);
}

float random2(vec2 inputValue, float seed) {
  return fract(sin(dot(inputValue, vec2(123.456, 68.91))) * seed);
}

vec2 drops(vec2 uv, float seed) {
  float shiftY = random(0.5, seed);
  uv.y += shiftY;

  float cellsRes = 10.0;
  uv *= cellsRes;

  float rowIndex = floor(uv.y);
  float shiftX = random(rowIndex, seed);

  uv.x += shiftX;

  vec2 cellIndex = floor(uv);
  vec2 cellUv = fract(uv);
  
  vec2 cellCenter = vec2(0.5);
  float distanceFromCenter = distance(cellUv, cellCenter);
  float isInsideDrop = 1.0 - step(0.1, distanceFromCenter);

  float isDropShown = step(0.8, random2(cellIndex, seed + 12345.678 ));

  float dropIntensity = 1.0 - fract(uTime * 0.1 + random2(cellIndex, seed + 13245.876) * 2.0) * 2.0;
  dropIntensity = sign(dropIntensity) * abs(dropIntensity * dropIntensity * dropIntensity * dropIntensity);
  dropIntensity = clamp(dropIntensity, 0.0, 1.0);

  vec2 vecToCenter = normalize(cellCenter - cellUv);

  vec2 dropValue = vecToCenter * distanceFromCenter * distanceFromCenter * 40.0;
  vec2 drop = dropValue * isDropShown * dropIntensity * isInsideDrop;

  return drop;
}
void main()
{
  vec2 uv = uvInterpolator;

  vec2 genDrops = vec2(0.0);
  for (int i = 0; i < 9; i++) {
    genDrops += drops(uv, 45627.68 + float(i) * 16574.657);
  }
  // uv += genDrops;
  // vec4 color = texture2D(uTexture, uv);

  gl_FragColor = vec4(genDrops, 0.0, 1.0);
  // gl_FragColor = color;
}