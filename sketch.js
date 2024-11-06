let blockSize = 80;
let clusters = [];
let colorPicker, blockSizeSlider, densitySlider;
let chosenColor = '#c896ff';
let density = 0.9;
let growSpeed = 5;
let isAnimating = false;
let capturer; // For exporting animation as PNG sequence
let recording = false;

function setup() {
  let canvas = createCanvas(1080, 1080);
  canvas.parent('canvasContainer'); // Place the canvas inside the #canvasContainer

  colorPicker = select('#colorPicker');
  blockSizeSlider = select('#blockSizeSlider');
  densitySlider = select('#densitySlider');

  colorPicker.input(updateColor);
  blockSizeSlider.input(updateBlockSize);
  densitySlider.input(updateDensity);

  // Button to change canvas size to 1080x1080
  select('#setFormat1080x1080').mousePressed(() => setCanvasSize(1080, 1080));

  // Button to change canvas size to 1080x1920
  select('#setFormat1080x1920').mousePressed(() => setCanvasSize(1080, 1920));

  background(255, 0);
  noLoop(); // Start without animation
}

// Function to set canvas size based on the selected button
function setCanvasSize(width, height) {
  resizeCanvas(width, height);
  restart();
}

// Restarts by clearing the canvas and resetting clusters
function restart() {
  clear();
  background(255, 0);
  clusters = [];
  isAnimating = false;
  noLoop();
  select('#animateAndExportButton').attribute('disabled', 'true'); // Disable Animate and Export button
  if (recording) {
    capturer.stop();
    capturer = null;
    recording = false;
  }
}

// Handles mouse clicks to select points on the canvas
function mousePressed() {
  let controlHeight = select('.controls').size().height + 20;

  if (mouseY < controlHeight) {
    return;
  }

  if (isAnimating) return;

  let newCluster = {
    x: mouseX,
    y: mouseY,
    currentRadius: 0,
    blocks: []
  };
  
  clusters.push(newCluster);

  fill(chosenColor);
  noStroke();
  rect(mouseX, mouseY, blockSize, blockSize);

  if (clusters.length > 0) {
    select('#animateAndExportButton').removeAttribute('disabled');
  }
}

// Generates blocks in a grid pattern around each selected point
function generateCluster(cluster) {
  let maxBlocks = 100;
  let blockCount = 0;

  for (let y = -blockSize * 5; y <= blockSize * 5; y += blockSize) {
    for (let x = -blockSize * 5; x <= blockSize * 5; x += blockSize) {
      if (blockCount >= maxBlocks) break;
      let distToCenter = dist(x, y, 0, 0);
      if (distToCenter < blockSize * 5 && random(1) < density) {
        let blockWidth = blockSize * random(0.5, 1.5);
        let blockHeight = blockSize;

        cluster.blocks.push({
          x: cluster.x + x,
          y: cluster.y + y,
          width: blockWidth,
          height: blockHeight,
          distanceFromCenter: dist(x, y, 0, 0)
        });
        blockCount++;
      }
    }
  }
}

// Starts the animation and export process when Animate and Export button is clicked
function startAnimationAndExport() {
  if (clusters.length > 0) {
    isAnimating = true;
    select('#animateAndExportButton').attribute('disabled', 'true');
    startRecording();
    loop();
  }
}

// Initializes the capturer and begins recording
function startRecording() {
  if (!capturer) {
    capturer = new CCapture({
      format: 'png', // Export as PNG sequence
      framerate: 60,
      quality: 100,
    });
    recording = true;
    capturer.start();
  }
}

function draw() {
  if (!isAnimating) return;

  clear();
  fill(chosenColor);
  noStroke();

  for (let cluster of clusters) {
    if (cluster.blocks.length === 0) {
      generateCluster(cluster);
    }

    cluster.currentRadius += growSpeed;

    for (let block of cluster.blocks) {
      if (block.distanceFromCenter <= cluster.currentRadius) {
        rect(block.x, block.y, block.width, block.height);
      }
    }
  }

  if (clusters.every(cluster => cluster.currentRadius >= blockSize * 5)) {
    isAnimating = false;
    noLoop();
    if (recording) {
      capturer.stop();
      capturer.save(); // Save the PNG sequence after the animation ends
      capturer = null;
      recording = false;
    }
  }

  if (recording) {
    capturer.capture(document.getElementById('defaultCanvas0'));
  }
}

// Updates the chosen color based on the color picker input
function updateColor() {
  chosenColor = colorPicker.value();
}

// Updates the block size based on the slider input
function updateBlockSize() {
  blockSize = parseInt(blockSizeSlider.value(), 10);
}

// Updates the cluster density based on the slider input
function updateDensity() {
  density = parseFloat(densitySlider.value());
}

// Handles window resizing to maintain canvas aspect ratio
function windowResized() {
  resizeCanvas(windowWidth, windowHeight * (height / width));
  restart();
}

