import * as THREE from 'three';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { RGBShiftShader } from 'three/addons/shaders/RGBShiftShader.js';
import { DotScreenShader } from 'three/addons/shaders/DotScreenShader.js';
import { ScreenRain } from './shaders/ScreenRain';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DeviceOrientationControls } from './DeviceControls';

import { RoomEnvironment } from 'https://esm.sh/three/addons/environments/RoomEnvironment.js';
import GUI from 'lil-gui';
import rainVertexShader from './shaders/rain/vertex.glsl';
import rainFragmentShader from './shaders/rain/fragment.glsl';

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

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

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
// const controls = new DeviceOrientationControls(camera, canvas);
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

// ENVIROMENT
const environment = new RoomEnvironment(renderer);
const pmremGenerator = new THREE.PMREMGenerator(renderer);

const roomMap = new THREE.TextureLoader().load(
  'https://i.imgur.com/mxf5VpY.jpeg'
);
roomMap.mapping = THREE.EquirectangularReflectionMapping;
scene.background = roomMap;

// scene.background = new THREE.Color(environmentSettings.color);
// scene.environment = pmremGenerator.fromScene(environment).texture;

// Mesh
const material = new THREE.ShaderMaterial({
  vertexShader: rainVertexShader,
  fragmentShader: rainFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uTexture: { value: roomMap }
  }
});

const geometry = new THREE.PlaneGeometry(10, 10, 1, 1);
const basicMat = new THREE.MeshBasicMaterial({ color: '#ff0000' });

const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);

// POST PROCESSING
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const effect1 = new ShaderPass(DotScreenShader);
effect1.uniforms['scale'].value = 4;
composer.addPass(effect1);

const effect3 = new OutputPass();
composer.addPass(effect3);

//  GUI

const guiParams = {
  enable: true
};

gui
  .add(guiParams, 'enable')
  .name('Enable Shader Pass')
  .onChange((value) => {
    if (!value) {
      composer.removePass(effect1);
    } else {
      composer.addPass(effect1);
    }
  });

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
  // mesh.material.uniforms.uTime.value = now / 1000;
  // effect1.uniforms['uTime'].value = now / 1000;
  effect1.enable = guiParams.enable;
  // Update controls
  controls.update();

  // Render
  composer.render();

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
