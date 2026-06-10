// VJ System - p5.js version
// Audio-reactive 3D visuals with boids, grids, and sine waves

let mic, fft;
let audioData = [];
let audioRange = 11;
let audioMax = 100;
let audioAmp = 40.0;
let audioIndex = 0.2;
let audioIndexAmp = audioIndex;
let audioIndexStep = 0.35;

// Color system - Royal and Navy Blue, White, Black scheme
// Original Red scheme (commented):
let clr1 = [
  [255, 0, 0],      // Bright Red
  [139, 0, 0],      // Dark Red (Maroon)
  [220, 20, 60],    // Crimson
  [178, 34, 34],    // Fire Brick

  // [65, 65, 65],   // Royal Blue
  // [0, 0, 0],      // Navy Blue
  // [30, 30, 30],   // Dodger Blue
  // [25, 25, 25],    // Midnight Blue

  
  [64, 64, 64],     // Dark Gray
  [0, 0, 0]         // Black
];




let clr1Len = 6;
let clr1Num = 160;
let clr1Cnt = -1;
let clr1Blk = Math.floor(clr1Num / clr1Len);
let clr2Num = 160;
let clr2Cnt = -1;
let clr2Blk = Math.floor(clr2Num / clr1Len);
let clr1A = [];
let clr1B = [];

// Visual elements
let boids = [];
let boidCh;
let whiteBoids = []; // Small white spheres
let grid;
let gridCh;
let sine;
let sineCh;

// Control variables
let sw = 1;
let bgcol, fgcol;
let str = false;
let hasBoidsRun = false;
let hasGridRun = false;
let hasSineRun = false;
let rx, ry, rz;
let rotCray = false;

// Global variables
let avx = 0.0;
let s = 10;
let WIDTH, HEIGHT, DIM, M;
let ds = 1.0; // Dynamic size multiplier based on audio

// Audio filtering simulation
let filteredSignal = [];
let filterBuffer = [];

// Debug variables
let showDebug = false;
let micLevel = 0;
let spectrumSum = 0;

function preload() {
  // No preload needed for this version
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  WIDTH = width;
  HEIGHT = height;
  DIM = Math.min(WIDTH, HEIGHT);
  M = DIM / 1000.0;
  
  // Setup audio
  mic = new p5.AudioIn();
  fft = new p5.FFT(0.8, 512);
  fft.setInput(mic);
  
  // Initialize audio data arrays
  for (let i = 0; i < audioRange; i++) {
    audioData[i] = 0;
    filteredSignal[i] = 0;
    filterBuffer[i] = [];
  }
  
  // Initialize color tables
  setColourTables();
  
  bgcol = color(0, 0, 0);
  fgcol = color(255, 255, 255);
  
  // Initialize visual elements
  initializeBoids();
  initializeGrid();
  initializeSine();

  console.log("Setup complete. Press 'd' to toggle debug info.");
}

function draw() {
  WIDTH = width;
  HEIGHT = height;
  DIM = Math.min(WIDTH, HEIGHT);
  M = DIM / 1000.0;
  rectMode(CENTER);
  
  // Audio analysis
  updateAudioData();
  updateFilteredSignal();
  
  // Map audio signal to dynamic size
  ds = map(filteredSignal[3], 0, 20, 0.5, 3.0);
  ds = constrain(ds, 0.3, 4.0); // Prevent elements from getting too small or large
  
  avx += filteredSignal[3] / 100.0;
  
  if (frameCount % 120 == 0) {
    s = 1 + abs(noise(frameCount * 10) * 10);
  }
  
  // Auto-switch modes based on audio
  if (filteredSignal[3] > 1 && frameCount % 300 == 0) {
    switchIt();
  }
  
  // Render scene
  scene(this);

  // Show debug info if enabled
  if (showDebug) {
    drawDebugInfo();
  }
}

// Scene function
function scene(pg) {
  // No background - transparent
  
  // Lighting
  pg.ambientLight(100);
  pg.directionalLight(255, 255, 255, 0.5, 0.5, -1);
  
  // Apply global rotation if enabled
  if (rotCray) {
    // pg.rotateY(avx / 30.0);
    let scl = 1 + noise(frameCount / 100.0) * 1.0;
    // pg.scale(scl);
  }
  
  // Render based on current mode
  renderCurrentMode(pg);
}

function drawDebugInfo() {
  // Reset transformations for 2D debug overlay
  camera();
  // hint(DISABLE_DEPTH_TEST);
  
  // Debug background
  fill(0, 0, 0, 150);
  noStroke();
  rect(-width/2 + 10, -height/2 + 10, 300, 200);
  
  // Debug text
  fill(255);
  textSize(12);
  textAlign(LEFT);
  
  let yPos = -height/2 + 30;
  text("DEBUG INFO:", -width/2 + 20, yPos);
  yPos += 20;
  
  text("Mic Level: " + micLevel.toFixed(3), -width/2 + 20, yPos);
  yPos += 15;
  
  text("Spectrum Sum: " + spectrumSum.toFixed(1), -width/2 + 20, yPos);
  yPos += 15;
  
  text("Filtered[3]: " + filteredSignal[3].toFixed(3), -width/2 + 20, yPos);
  yPos += 15;
  
  text("AVX: " + avx.toFixed(3), -width/2 + 20, yPos);
  yPos += 15;
  
  text("Dynamic Size: " + ds.toFixed(2), -width/2 + 20, yPos);
  yPos += 15;
  
  text("Mode: " + sw, -width/2 + 20, yPos);
  yPos += 15;
  
  text("Boids: " + boids.length, -width/2 + 20, yPos);
  yPos += 15;
  
  text("White Boids: " + whiteBoids.length, -width/2 + 20, yPos);
  yPos += 15;
  
  text("Mic Started: " + (mic && mic.enabled), -width/2 + 20, yPos);
  
  // Audio bars
  for (let i = 0; i < audioRange && i < 10; i++) {
    let barHeight = map(filteredSignal[i], 0, 50, 0, 100);
    fill(255, 100, 100);
    rect(-width/2 + 20 + i * 25, -height/2 + 180, 20, -barHeight);
  }
  
  // hint(ENABLE_DEPTH_TEST);
}

function renderCurrentMode(pg) {
  switch(sw) {
    case 0:
      renderMode0(pg);
      break;
    case 1:
      renderMode1(pg);
      break;
    case 2:
      renderMode2(pg);
      break;
  }
}

function renderMode0(pg) {
  if (!hasBoidsRun) {
    initializeBoids();
    initializeGrid();
    hasBoidsRun = true;
  }
  
  updateAndDisplayBoids(pg);
  grid.update();
  grid.display(pg);
}

function renderMode1(pg) {
  if (!hasBoidsRun) {
    initializeBoids(30, height / 2);
    hasBoidsRun = true;
  }
  
  if (!hasSineRun) {
    initializeSine();
    hasSineRun = true;
  }
  
  sine.update();
  sine.display(pg);
  updateAndDisplayBoids(pg);
}

function renderMode2(pg) {
  if (!hasBoidsRun) {
    initializeBoids(30, height / 2);
    initializeGrid();
    hasBoidsRun = true;
  }
  
  if (!hasSineRun) {
    initializeSine();
    hasSineRun = true;
  }
  
  sine.update();
  sine.display(pg);
  grid.update();
  grid.display(pg);
  updateAndDisplayBoids(pg);
}

function updateAndDisplayBoids(pg) {
  // Update and display regular boids
  for (let boid of boids) {
    boid.applyBehaviors(boids);
    boid.update();
    boid.display(pg);
    boid.edges();
  }
  
  // Update and display white boids
  for (let whiteBoid of whiteBoids) {
    whiteBoid.applyBehaviors(whiteBoids);
    whiteBoid.update();
    whiteBoid.display(pg);
    whiteBoid.edges();
  }
}

function initializeBoids(count = null, yPos = null) {
  boids = [];
  boidCh = Math.floor(random(0, 3));
  let boidCount = count || Math.floor(random(100, 300));
  rx = random() < 0.5;
  ry = random() < 0.5;
  rz = random() < 0.5;
  
  for (let i = 0; i < boidCount; i++) {
    let x = random(-width/2, width/2);
    let y = yPos !== null ? yPos - height/2 : random(-height/2, height/2);
    let z = random(-1000, 1000);
    boids.push(new Boid(x, y, z));
  }
  
  // Initialize white sphere boids
  whiteBoids = [];
  let whiteBoidCount = Math.floor(random(10, 50)); // Fewer white boids
  for (let i = 0; i < whiteBoidCount; i++) {
    let x = random(-width/2, width/2);
    // let y = yPos !== null ? yPos - height/8 : random(-height/2, height/2);
    let y = random(-height/2, height/2);
    let z = random(-1000, 1000);
    whiteBoids.push(new WhiteBoid(x, y, z));
  }
}

function initializeGrid() {
  gridCh = Math.floor(random(0, 3));
  grid = new Grid();
}

function initializeSine() {
  sineCh = Math.floor(random(0, 3));
  sine = new Sine();
}

function updateAudioData() {
  // Get microphone level
  micLevel = mic ? mic.getLevel() : 0;
  
  // Get spectrum analysis
  let spectrum = fft.analyze();
  spectrumSum = 0;
  
  // Calculate spectrum sum for debugging
  for (let i = 0; i < spectrum.length; i++) {
    spectrumSum += spectrum[i];
  }
  
  audioIndexAmp = audioIndex;
  
  // Process audio bands
  for (let i = 0; i < audioRange && i < spectrum.length; i++) {
    // Use different frequency ranges for each band
    let startBin = Math.floor(i * spectrum.length / audioRange);
    let endBin = Math.floor((i + 1) * spectrum.length / audioRange);
    
    // Average the spectrum values in this range
    let sum = 0;
    for (let j = startBin; j < endBin; j++) {
      sum += spectrum[j];
    }
    let avgSpectrum = sum / (endBin - startBin);
    
    // Apply scaling
    let tempIndexAvg = (avgSpectrum / 255.0 * audioAmp) * audioIndexAmp;
    let tempIndexCon = constrain(tempIndexAvg, 0, audioMax);
    audioData[i] = tempIndexCon;
    audioIndexAmp += audioIndexStep;
  }
  
  // Boost the signal if it's too quiet
  for (let i = 0; i < audioRange; i++) {
    audioData[i] *= 2.0; // Increase sensitivity
  }
}

function updateFilteredSignal() {
  // Simple moving average filter simulation
  for (let i = 0; i < audioRange; i++) {
    if (!filterBuffer[i]) filterBuffer[i] = [];
    filterBuffer[i].push(audioData[i]);
    if (filterBuffer[i].length > 5) { // Shorter buffer for more responsiveness
      filterBuffer[i].shift();
    }
    
    let sum = filterBuffer[i].reduce((a, b) => a + b, 0);
    filteredSignal[i] = sum / filterBuffer[i].length;
  }
}

function switchIt() {
  strobe();
  hasBoidsRun = false;
  hasGridRun = false;
  hasSineRun = false;
  sw = Math.floor(random(0, 3));
}

function strobe() {
  str = !str;
  if (str) {
    bgcol = color(0);
    fgcol = color(255);
  } else {
    bgcol = color(255);
    fgcol = color(0);
  }
}

function setColourTables() {
  clr1A = [];
  clr1B = [];
  
  for (let i = 0; i < clr1Num; i++) {
    if (i % clr1Blk == 0) clr1Cnt = (clr1Cnt + 1) % clr1Len;
    let c1 = color(clr1[clr1Cnt][0], clr1[clr1Cnt][1], clr1[clr1Cnt][2]);
    let c2 = color(clr1[(clr1Cnt + 1) % clr1Len][0], clr1[(clr1Cnt + 1) % clr1Len][1], clr1[(clr1Cnt + 1) % clr1Len][2]);
    clr1A[i] = lerpColor(c1, c2, map(i, clr1Cnt * clr1Blk, (clr1Cnt + 1) * clr1Blk, 0.0, 1.0));
  }
  
  for (let i = 0; i < clr2Num; i++) {
    if (i % clr2Blk == 0) clr2Cnt = (clr2Cnt + 1) % clr1Len;
    let c1 = color(clr1[clr2Cnt][0], clr1[clr2Cnt][1], clr1[clr2Cnt][2]);
    let c2 = color(clr1[(clr2Cnt + 1) % clr1Len][0], clr1[(clr2Cnt + 1) % clr1Len][1], clr1[(clr2Cnt + 1) % clr1Len][2]);
    clr1B[i] = lerpColor(c1, c2, map(i, clr2Cnt * clr2Blk, (clr2Cnt + 1) * clr2Blk, 0.0, 1.0));
  }
}

function getRandomChoice(choices) {
  if (choices.length > 0) {
    let randomIndex = Math.floor(random(choices.length));
    return choices[randomIndex];
  }
  return 0.0;
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    strobe();
  }
  if (key === 'a') {
    switchIt();
  }
  if (key === 'r') {
    rotCray = !rotCray;
  }
  if (key === 'd') {
    showDebug = !showDebug;
    console.log("Debug mode:", showDebug ? "ON" : "OFF");
    
    // Toggle HTML info boxes visibility
    let controlsDiv = document.getElementById('controls');
    let infoDiv = document.getElementById('info');
    if (controlsDiv && infoDiv) {
      if (showDebug) {
        controlsDiv.style.display = 'block';
        infoDiv.style.display = 'block';
      } else {
        controlsDiv.style.display = 'none';
        infoDiv.style.display = 'none';
      }
    }
  }
  if (key === 'm') {
    // Manual start microphone
    if (mic && !mic.enabled) {
      mic.start();
      console.log("Microphone started manually");
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
} 