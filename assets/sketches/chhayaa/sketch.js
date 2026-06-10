/*
 * 👋 Hello! This is an ml5.js example made and shared with ❤️.
 * Learn more about the ml5.js project: https://ml5js.org/
 * ml5.js license and Code of Conduct: https://github.com/ml5js/ml5-next-gen/blob/main/LICENSE.md
 *
 * This example demonstrates segmenting a person by body parts with ml5.bodySegmentation
 * and visualizing it with Three.js cubes.
 */

let bodySegmentation;
let video;
let segmentation;

// Three.js variables
let scene, camera, renderer;
let cubes = [];
let gridSize = 50; // Number of cubes per row/column
let cubeSpacing = 2.1;

// Tone.js audio engine – TABLA samples
const TABLA_SAMPLES = [
  "TABLA/Tabla_Flare_1.wav", "TABLA/Tabla_Flare_2.wav", "TABLA/Tabla_Flare_3.wav",
  "TABLA/Tabla_Flare_4.wav", "TABLA/Tabla_Flare_5.wav", "TABLA/Tabla_Flare_6.wav",
  "TABLA/Tabla_Gliss_1.wav", "TABLA/Tabla_Gliss_2.wav", "TABLA/Tabla_Gliss_3.wav",
  "TABLA/Tabla_Gliss_4.wav", "TABLA/Tabla_Gliss_5.wav", "TABLA/Tabla_Gliss_6.wav",
  "TABLA/Tabla_Gliss_7.wav", "TABLA/Tabla_Gliss_8.wav",
  "TABLA/Tabla_Hi_Ring_1.wav", "TABLA/Tabla_Hi_Ring_2.wav",
  "TABLA/Tabla_Hi_Slap_1.wav", "TABLA/Tabla_Hi_Slap_2.wav", "TABLA/Tabla_Hi_Slap_3.wav", "TABLA/Tabla_Hi_Slap_4.wav",
  "TABLA/Tabla_Hit_High_1.wav", "TABLA/Tabla_Hit_High_2.wav", "TABLA/Tabla_Hit_High_3.wav", "TABLA/Tabla_Hit_High_4.wav",
  "TABLA/Tabla_Low_1.wav", "TABLA/Tabla_Low_2.wav", "TABLA/Tabla_Low_3.wav", "TABLA/Tabla_Low_4.wav",
  "TABLA/Tabla_Low_5.wav", "TABLA/Tabla_Low_6.wav", "TABLA/Tabla_Low_7.wav",
  "TABLA/Tabla_Mid_1.wav", "TABLA/Tabla_Mid_2.wav", "TABLA/Tabla_Mid_3.wav", "TABLA/Tabla_Mid_4.wav", "TABLA/Tabla_Mid_5.wav",
  "TABLA/Tabla_Mid_Slap_1.wav", "TABLA/Tabla_Mid_Slap_2.wav", "TABLA/Tabla_Mid_Slap_3.wav", "TABLA/Tabla_Mid_Slap_4.wav",
  "TABLA/Tabla_Ring_1.wav", "TABLA/Tabla_Ring_2.wav", "TABLA/Tabla_Ring_3.wav", "TABLA/Tabla_Ring_4.wav",
  "TABLA/Tabla_Ring_5.wav", "TABLA/Tabla_Ring_6.wav", "TABLA/Tabla_Ring_7.wav",
  "TABLA/Tabla_Slap_1.wav", "TABLA/Tabla_Slap_2.wav", "TABLA/Tabla_Slap_3.wav", "TABLA/Tabla_Slap_4.wav",
  "TABLA/Tabla_Slap_5.wav", "TABLA/Tabla_Slap_6.wav", "TABLA/Tabla_Slap_7.wav", "TABLA/Tabla_Slap_8.wav",
  "TABLA/Tabla_Slap_9.wav", "TABLA/Tabla_Slap_10.wav", "TABLA/Tabla_Slap_11.wav",
  "TABLA/Table_Top_1.wav", "TABLA/Table_Top_2.wav", "TABLA/Table_Top_3.wav",
];
let tablaPlayers;
let audioReady = false;
let interactionTriggerCount = 0;  // debug: how many times we triggered from cube flip

let options = {
  maskType: "parts",
};

function preload() {
  bodySegmentation = ml5.bodySegmentation("BodyPix", options);
}

function initTablaAudio() {
  const urls = {};
  TABLA_SAMPLES.forEach((path, i) => { urls[String(i)] = path; });
  // Only set audioReady when all buffers have loaded (onload callback)
  tablaPlayers = new Tone.Players(urls, () => {
    audioReady = true;
    console.log("Tabla samples loaded, audio ready.");
    const hint = document.getElementById("audioHint");
    if (hint) hint.style.display = "none";
    // One short test sound so you know the context is working
    const key = String(0);
    const p = tablaPlayers.player(key);
    if (p && p.loaded) p.start(Tone.now());
  }).toDestination();
  tablaPlayers.volume.value = -9;  // reduce sample volume (dB)
}

function playRandomTabla() {
  if (!audioReady || !tablaPlayers) return;
  const ctx = Tone.getContext();
  if (ctx.rawContext && ctx.rawContext.state === "suspended") ctx.rawContext.resume();
  const key = String(floor(random(TABLA_SAMPLES.length)));
  const player = tablaPlayers.player(key);
  if (player && player.loaded) {
    player.stop(Tone.now());
    player.start(Tone.now());
  }
}

function playCubeSample(cube) {
  if (!audioReady || !tablaPlayers) return;
  const ctx = Tone.getContext();
  if (ctx.rawContext && ctx.rawContext.state === "suspended") ctx.rawContext.resume();
  const key = String(cube.userData.sampleIndex);
  const player = tablaPlayers.player(key);
  if (player && player.loaded) {
    player.stop(Tone.now());
    player.start(Tone.now());
  }
}

function setup() {
  // Create p5 canvas for video processing
  let canvas = createCanvas(640, 480);
  canvas.parent('p5Canvas');
  
  // Create the video
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // Start detection: use detect/segment chain so each result triggers next (fresh data every time)
  const startFn = bodySegmentation.detect || bodySegmentation.segment;
  if (startFn) {
    startFn.call(bodySegmentation, video, gotResults);
  } else {
    bodySegmentation.detectStart(video, gotResults);
  }
  
  // Initialize Three.js
  initThree();

  // Start Tone.js on first user interaction (browser policy)
  const startAudio = async () => {
    try {
      await Tone.start();
      console.log("Tone.js AudioContext started.");
      initTablaAudio();
    } catch (e) {
      console.error("Tone start failed:", e);
    }
    document.removeEventListener("click", startAudio);
    document.removeEventListener("keydown", startAudio);
  };
  document.addEventListener("click", startAudio, { once: true });
  document.addEventListener("keydown", startAudio, { once: true });

  // Press SPACE to test: play a random tabla (confirms playback works outside first click)
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && audioReady) {
      e.preventDefault();
      playRandomTabla();
    }
  });
}

function initThree() {
  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0a);
  
  // Create camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 100;
  camera.lookAt(0, 0, 0);
  
  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);
  
  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight1.position.set(10, 10, 10);
  directionalLight1.castShadow = true;
  directionalLight1.shadow.mapSize.width = 2048;
  directionalLight1.shadow.mapSize.height = 2048;
  directionalLight1.shadow.camera.near = 0.5;
  directionalLight1.shadow.camera.far = 500;
  directionalLight1.shadow.camera.left = -100;
  directionalLight1.shadow.camera.right = 100;
  directionalLight1.shadow.camera.top = 100;
  directionalLight1.shadow.camera.bottom = -100;
  scene.add(directionalLight1);
  
  const directionalLight2 = new THREE.DirectionalLight(0x4466ff, 0.5);
  directionalLight2.position.set(-10, -10, -5);
  directionalLight2.castShadow = true;
  directionalLight2.shadow.mapSize.width = 1024;
  directionalLight2.shadow.mapSize.height = 1024;
  scene.add(directionalLight2);
  
  const pointLight = new THREE.PointLight(0xff00ff, 1, 100);
  pointLight.position.set(0, 20, 20);
  pointLight.castShadow = true;
  pointLight.shadow.mapSize.width = 1024;
  pointLight.shadow.mapSize.height = 1024;
  scene.add(pointLight);
  
  // Create grid of cubes
  const geometry = new THREE.BoxGeometry(1.4, 1.4, 1.4);
  
  const halfGrid = (gridSize * cubeSpacing) / 2;
  
  for (let x = 0; x < gridSize; x++) {
    cubes[x] = [];
    for (let y = 0; y < gridSize; y++) {
      const material = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        metalness: 0.5,
        roughness: 0.2,
      });
      
      const cube = new THREE.Mesh(geometry, material);
      cube.position.x = x * cubeSpacing - halfGrid;
      cube.position.y = -(y * cubeSpacing - halfGrid);
      cube.position.z = 0;
      cube.castShadow = true;
      cube.receiveShadow = true;
      
      // One sample per cube, assigned once at init
      const sampleIndex = floor(random(TABLA_SAMPLES.length));
      cube.userData = {
        baseRotationX: 0,
        baseRotationY: 0,
        targetRotationX: 0,
        targetRotationY: 0,
        wasActive: false,
        prevScale: 1,  // start "big" so we don't trigger on first frame
        sampleIndex,
      };
      
      scene.add(cube);
      cubes[x][y] = cube;
    }
  }
  
  // Handle window resize
  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function draw() {
  background(0);
  
  // Update Three.js scene
  updateCubes();
  
  // Keep camera straight facing the cubes
  camera.lookAt(0, 0, 0);
  
  renderer.render(scene, camera);

  // Debug: always show flip-trigger count so we can see it update
  const flipEl = document.getElementById("flipDebug");
  if (flipEl) {
    flipEl.style.display = "block";
    //flipEl.textContent = "flip triggers: " + interactionTriggerCount;
  }
}

function updateCubes() {
  // Use VIDEO (camera) for sound trigger — doesn't depend on segmentation
  if (!video || !video.loadPixels) return;
  try {
    video.loadPixels();
  } catch (e) {
    return;
  }
  if (!video.pixels || video.pixels.length === 0) return;

  // Optional: use segmentation for visuals (rotation, color) when available
  let maskPixels = null;
  if (segmentation && segmentation.mask && segmentation.mask.loadPixels) {
    try {
      segmentation.mask.loadPixels();
      if (segmentation.mask.pixels && segmentation.mask.pixels.length > 0) {
        maskPixels = segmentation.mask.pixels;
      }
    } catch (e) {}
  }

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const videoX = floor(map(x, 0, gridSize, 0, video.width));
      const videoY = floor(map(y, 0, gridSize, 0, video.height));
      const index = (videoY * video.width + videoX) * 4;

      // Active for TRIGGER: raw video brightness (camera sees something there)
      const vr = video.pixels[index];
      const vg = video.pixels[index + 1];
      const vb = video.pixels[index + 2];
      const brightness = (vr + vg + vb) / 3;
      const triggerActive = brightness > 60;

      // Scale value for trigger (crossing check)
      const currentScale = triggerActive ? 1 + (brightness / 255) * 0.5 : 0.8;

      const cube = cubes[x][y];
      const n = noise(x, y);
      const prevScale = cube.userData.prevScale;

      // Play sample when this cell goes from dark to bright (you moved into it) and noise > 0.7
      if (currentScale >= 1.0 && prevScale < 0.95 && n > 0.6) {
        interactionTriggerCount += 1;
        playCubeSample(cube);
      }
      cube.userData.prevScale = currentScale;

      // Visuals: use segmentation if we have it, else fall back to trigger (video)
      let isActive = triggerActive;
      let intensity = brightness / 255;
      if (maskPixels) {
        const r = maskPixels[index];
        const g = maskPixels[index + 1];
        const b = maskPixels[index + 2];
        const a = maskPixels[index + 3];
        intensity = (r + g + b) / (3 * 255);
        isActive = a > 0 && intensity > 0.1;
      }

      const displayScale = isActive ? 1 + intensity * 0.5 : 0.8;
      if (isActive) {
        cube.userData.targetRotationY = intensity * Math.PI * 2;
        const hue = maskPixels
          ? (maskPixels[index] / 255) * 0.3 + (maskPixels[index + 1] / 255) * 0.6 + (maskPixels[index + 2] / 255) * 0.1
          : brightness / 255;
        cube.material.color.setHSL(hue, 0.8, 0.5);
        cube.scale.set(displayScale, displayScale, displayScale);
      } else {
        cube.userData.targetRotationX = 0;
        cube.userData.targetRotationY = 0;
        cube.material.color.setHex(0x333333);
        cube.scale.set(displayScale, displayScale, displayScale);
      }

      cube.userData.wasActive = isActive;
      cube.userData.baseRotationX += (cube.userData.targetRotationX - cube.userData.baseRotationX) * 0.1;
      cube.userData.baseRotationY += (cube.userData.targetRotationY - cube.userData.baseRotationY) * 0.1;
      cube.rotation.x = cube.userData.baseRotationX;
      cube.rotation.y = cube.userData.baseRotationY;
    }
  }
}

// callback function for body segmentation — request next frame so we get fresh data every time
function gotResults(result) {
  segmentation = result;
  const requestNext = bodySegmentation && (bodySegmentation.detect || bodySegmentation.segment);
  if (requestNext) {
    const fn = bodySegmentation.detect || bodySegmentation.segment;
    fn.call(bodySegmentation, video, gotResults);
  }
}
