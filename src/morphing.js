import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import GUI from 'lil-gui';
import gsap from 'gsap';
import particlesVertexShader from './shaders/morphing/vertex.glsl';
import particlesFragmentShader from './shaders/morphing/fragment.glsl';

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 });
const debugObject = {};

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Loaders
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('./draco/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2)
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

  // Materials
  if (particles) {
    particles.material.uniforms.uResolution.value.set(
      sizes.width * sizes.pixelRatio,
      sizes.height * sizes.pixelRatio
    );
  }

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
camera.position.set(0, 0, 8 * 2);
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

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);

debugObject.clearColor = '#160920';
gui.addColor(debugObject, 'clearColor').onChange(() => {
  renderer.setClearColor(debugObject.clearColor);
});
renderer.setClearColor(debugObject.clearColor);

// Models
// we need to load the models pefore we access their geometry
let particles = null;
// set particles outside of load to handle resize event
gltfLoader.load('./models.glb', (gltf) => {
  const particles = {};
  particles.index = 0;

  // Positions
  const positions = gltf.scene.children.map((child) => {
    return child.geometry.attributes.position;
  });

  particles.maxCount = 0;
  for (const position of positions) {
    if (position.count > particles.maxCount) {
      particles.maxCount = position.count;
    }
  }

  // second loop once max count is known
  particles.positions = [];
  for (const position of positions) {
    const ogArray = position.array;
    const newArray = new Float32Array(particles.maxCount * 3);

    for (let i = 0; i < particles.maxCount; i++) {
      const i3 = i * 3;
      if (i3 < ogArray.length) {
        newArray[i3 + 0] = ogArray[i3 + 0];
        newArray[i3 + 1] = ogArray[i3 + 1];
        newArray[i3 + 2] = ogArray[i3 + 2];
      } else {
        const randomIndex = Math.floor(position.count * Math.random()) * 3;
        newArray[i3 + 0] = ogArray[randomIndex + 0];
        newArray[i3 + 1] = ogArray[randomIndex + 1];
        newArray[i3 + 2] = ogArray[randomIndex + 2];
      }
    }
    particles.positions.push(new THREE.Float32BufferAttribute(newArray, 3));
  }
  console.log(particles.positions);

  // Geometry
  particles.geometry = new THREE.BufferGeometry();
  particles.geometry.setAttribute(
    'position',
    particles.positions[particles.index]
  );
  particles.geometry.setAttribute('aPositionTarget', particles.positions[3]);

  // Material
  particles.material = new THREE.ShaderMaterial({
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexShader: particlesVertexShader,
    fragmentShader: particlesFragmentShader,
    uniforms: {
      uSize: new THREE.Uniform(0.2),
      uResolution: new THREE.Uniform(
        new THREE.Vector2(
          sizes.width * sizes.pixelRatio,
          sizes.height * sizes.pixelRatio
        )
      ),
      uProgress: new THREE.Uniform(0)
    }
  });

  // Points
  particles.points = new THREE.Points(particles.geometry, particles.material);
  scene.add(particles.points);

  // Methods
  particles.morph = (index) => {
    // update attributes
    particles.geometry.setAttribute(
      'position',
      particles.positions[particles.index]
    );
    particles.geometry.setAttribute(
      'aPositionTarget',
      particles.positions[index]
    );

    // animate progress
    gsap.fromTo(
      particles.material.uniforms.uProgress,
      { value: 0 },
      // ease is linear because we already have an ease on the progress in the shader
      { value: 1, duration: 3, ease: 'linear' }
    );

    // update index
    particles.index = index;
  };
  // create functions to add to gui
  particles.morph0 = () => {
    particles.morph(0);
  };
  particles.morph1 = () => {
    particles.morph(1);
  };
  particles.morph2 = () => {
    particles.morph(2);
  };
  particles.morph3 = () => {
    particles.morph(3);
  };

  // add to gui
  gui.add(particles, 'morph0');
  gui.add(particles, 'morph1');
  gui.add(particles, 'morph2');
  gui.add(particles, 'morph3');

  // Tweaks
  gui
    .add(particles.material.uniforms.uProgress, 'value')
    .min(0)
    .max(1)
    .step(0.001)
    .name('uProgress')
    .listen();
});

/**
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update();

  // Render normal scene
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
