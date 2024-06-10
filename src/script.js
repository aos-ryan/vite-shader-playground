import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import testVertexShader from './shaders/test/vertex.glsl';
import testFragmentShader from './shaders/test/fragment.glsl';
import particlesVertexShader from './shaders/particles/vertex.glsl';
import particlesFragmentShader from './shaders/particles/fragment.glsl';

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Texture Loader
const textureLoader = new THREE.TextureLoader();

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2)
};

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);

// Test shader material
const material = new THREE.ShaderMaterial({
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
  side: THREE.DoubleSide,
  uniforms: {
    uTime: {
      value: 0
    }
  }
});

// Mesh
const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);

/**
 * Displacement
 */
const displacement = {};
// canvas
displacement.canvas = document.createElement('canvas');
displacement.canvas.classList.add('overlay-canvas');
displacement.canvas.width = 128;
displacement.canvas.height = 128;
document.body.append(displacement.canvas);
// context
displacement.context = displacement.canvas.getContext('2d');
displacement.context.fillRect(
  0,
  0,
  displacement.canvas.width,
  displacement.canvas.height
);
// interactive plane
displacement.interactivePlane = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshBasicMaterial({ color: 'red', side: THREE.DoubleSide })
);
displacement.interactivePlane.visible = false;
scene.add(displacement.interactivePlane);

// glow image
displacement.glowImage = new Image();
displacement.glowImage.src = './glow.png';

// raycaster
displacement.raycaster = new THREE.Raycaster();
// coords
displacement.screenCursor = new THREE.Vector2(9999, 9999);
displacement.canvasCursor = new THREE.Vector2(9999, 9999);
displacement.canvasCursorPrev = new THREE.Vector2(9999, 9999);

window.addEventListener('pointermove', (e) => {
  displacement.screenCursor.x = (event.clientX / sizes.width) * 2 - 1;
  displacement.screenCursor.y = -(event.clientY / sizes.height) * 2 + 1;
});

displacement.texture = new THREE.CanvasTexture(displacement.canvas);

/**
 * Particles Shader
 */
const particlesGeometry = new THREE.PlaneGeometry(10, 10, 128, 128);
particlesGeometry.setIndex(null);
particlesGeometry.deleteAttribute('normal');

const intensitiesArray = new Float32Array(
  particlesGeometry.attributes.position.count
);
const anglesArray = new Float32Array(
  particlesGeometry.attributes.position.count
);

for (let i = 0; i < particlesGeometry.attributes.position.count; i++) {
  intensitiesArray[i] = Math.random();
  anglesArray[i] = Math.random() * Math.PI * 2;
}
particlesGeometry.setAttribute(
  'aIntensity',
  new THREE.BufferAttribute(intensitiesArray, 1)
);
particlesGeometry.setAttribute(
  'aAngle',
  new THREE.BufferAttribute(anglesArray, 1)
);

const particlesMaterial = new THREE.ShaderMaterial({
  // blending: THREE.AdditiveBlending,
  vertexShader: particlesVertexShader,
  fragmentShader: particlesFragmentShader,
  uniforms: {
    uResolution: new THREE.Uniform(
      new THREE.Vector2(
        sizes.width * sizes.pixelRatio,
        sizes.height * sizes.pixelRatio
      )
    ),
    uPictureTexture: new THREE.Uniform(textureLoader.load('./ze.png')),
    uDisplacementTexture: new THREE.Uniform(displacement.texture)
  }
});
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

  // update uniforms
  particlesMaterial.uniforms.uResolution.value.set(
    sizes.width * sizes.pixelRatio,
    sizes.height * sizes.pixelRatio
  );

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 0, 18);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});
renderer.setClearColor('#181818');
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);

/**
 * Animate
 */
const fps = 1000 / 60;
let lastFrame = performance.now();

const tick = () => {
  // time
  const now = performance.now();
  const elapsed = now - lastFrame;
  const frameTime = fps / elapsed;
  lastFrame = now;
  material.uniforms.uTime.value = performance.now();
  // Update controls
  controls.update();

  // Raycaster
  displacement.raycaster.setFromCamera(displacement.screenCursor, camera);
  const intersections = displacement.raycaster.intersectObject(
    displacement.interactivePlane
  );
  if (intersections.length) {
    const uv = intersections[0].uv;
    displacement.canvasCursor.x = uv.x * displacement.canvas.width;
    displacement.canvasCursor.y = (1 - uv.y) * displacement.canvas.height;
  }
  // fade out
  displacement.context.globalCompositeOperation = 'source-over';
  displacement.context.globalAlpha = 0.02;
  displacement.context.fillRect(
    0,
    0,
    displacement.canvas.width,
    displacement.canvas.height
  );

  // Speed alpha
  const cursorDistance = displacement.canvasCursorPrev.distanceTo(
    displacement.canvasCursor
  );
  displacement.canvasCursorPrev.copy(displacement.canvasCursor);
  // clamp to 1 and ensure it doesn't get too "fast"
  const alpha = Math.min(cursorDistance * 0.1, 1);
  // console.log(cursorDistance);

  // draw glow
  const glowSize = displacement.canvas.width * 0.25;
  displacement.context.globalCompositeOperation = 'lighten';
  displacement.context.globalAlpha = alpha;
  displacement.context.drawImage(
    displacement.glowImage,
    displacement.canvasCursor.x - glowSize * 0.5,
    displacement.canvasCursor.y - glowSize * 0.5,
    glowSize,
    glowSize
  );

  // Texture
  displacement.texture.needsUpdate = true;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
