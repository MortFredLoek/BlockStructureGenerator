let blockSize = 80; // Default size of each block
let clusters = []; // Array to store clusters created from click points
let colorPicker, blockSizeSlider, densitySlider;
let chosenColor = '#c896ff';
let density = 0.9; // Higher density for more blocks
let growSpeed = 5; // Speed of outward growth in pixels per frame
let isAnimating = false; // Track whether animation has started
let capturer; // For exporting animation as video
let recording = false; // Track if we are recording a video

function setup() {
  let canvas = createCanvas(1080, 1080); // Default canvas size set to 1:1
  canvas.parent(document.body);

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

  // Button to export video
  select('#exportVideo').mousePressed(startRecording);

  background(255, 0); // Initial background (transparent)
  noLoop(); // Start without animation
}

// Function to set canvas size based on the selected button
function setCanvasSize(width, height) {
  resizeCanvas(width, height);
  restart(); // Restart to clear any current clusters and animation
}

// Restarts by clearing the canvas and resetting clusters
function restart() {
  background(255, 0); // Clear the canvas and set transparency
  clusters = []; // Reset clusters array
  isAnimating = false; // Reset animation state
  noLoop(); // Stop the animation loop if it was running
  select('#animateButton').removeAttribute('disabled'); // Enable Animate button
}

// Handles mouse clicks to select points on the canvas
function mousePressed() {
  if (isAnimating) return; // No more points if animating 

  // Add a new cluster with feedback point shown
  let newCluster = {
    x: mouseX,
    y: mouseY,
    currentRadius: 0, // Start growing from the center outward
    blocks: [] // Blocks that will appear within this cluster
  };
  
  clusters.push(newCluster);
  
  // Draw feedback square at clicked location
  fill(chosenColor);
  noStroke();
  rect(mouseX, mouseY, blockSize, blockSize);
  
  startAnimation(); // Immediately start the animation after adding a new point
}

// Generates more noisy and fragmented blocks in a grid pattern around each selected point
function generateCluster(cluster) {
  let maxBlocks = 100; // Set a reasonable number of blocks to avoid overloading
  let blockCount = 0;

  // Start generating blocks in a more random, fragmented grid
  for (let y = -blockSize * 5; y <= blockSize * 5; y += blockSize) {
    for (let x = -blockSize * 5; x <= blockSize * 5; x += blockSize) {
      if (blockCount >= maxBlocks) break;
      let distToCenter = dist(x, y, 0, 0);
      if (distToCenter < blockSize * 5 && random(1) < density) {
        // Add more randomness to block position and size for a fragmented look
        let blockWidth = blockSize * random(0.3, 1.8); // More fragmented width variation
        let blockHeight = blockSize * random(0.3, 1.8); // More fragmented height variation
        let offsetX = random(-blockSize * 0.3, blockSize * 0.3); // Random offset for x position
        let offsetY = random(-blockSize * 0.3, blockSize * 0.3); // Random offset for y position

        // Push block with variable size and random offset
        cluster.blocks.push({
          x: cluster.x + x + offsetX,
          y: cluster.y + y + offsetY,
          width: blockWidth,
          height: blockHeight,
          distanceFromCenter: dist(x, y, 0, 0) // Distance for sequential growing outward
        });
        blockCount++;
      }
    }
  }
}

// Begins the outward growth animation when Animate is clicked
function startAnimation() {
  isAnimating = true;
  loop(); // Start the animation loop
}

function draw() {
  if (!isAnimating) return; // Exit draw if not animating

  clear(); // Clear with transparency
  fill(chosenColor);
  noStroke();

  // Grow each cluster outward
  for (let cluster of clusters) {
    // Generate blocks for each cluster if not already done
    if (cluster.blocks.length === 0) {
      generateCluster(cluster);
    }

    // Grow the "wave" outward
    cluster.currentRadius += growSpeed;

    // Draw blocks within the current growing radius
    for (let block of cluster.blocks) {
      if (block.distanceFromCenter <= cluster.currentRadius) {
        rect(block.x, block.y, block.width, block.height); // Draw with varied size and offset
      }
    }
  }

  // Stop the loop when all clusters have fully grown
  if (clusters.every(cluster => cluster.currentRadius >= blockSize * 5)) {
    isAnimating = false;
    noLoop();
    if (recording) {
      capturer.stop();
      capturer.save(); // Save the video after the animation ends
      recording = false;
    }
  }

  if (recording) {
    capturer.capture(document.getElementById('defaultCanvas0')); // Capture each frame
  }
}

// Updates the chosen color based on the color picker input
function updateColor() {
  chosenColor = colorPicker.value();
}

// Updates the block size based on the slider input
function updateBlockSize() {
  blockSize = parseInt(blockSizeSlider.value(), 10); // Parse slider value as integer
}

// Updates the cluster density based on the slider input
function updateDensity() {
  density = parseFloat(densitySlider.value()); // Parse slider value as float
}

// Handles window resizing to maintain canvas aspect ratio
function windowResized() {
  resizeCanvas(windowWidth, windowHeight * (height / width));
  restart();
}

// Start recording the animation
function startRecording() {
  capturer = new CCapture({
    format: 'webm',
    framerate: 60,
    transparent: true, // Enable transparency
    quality: 100,
  });
  recording = true;
  capturer.start();
  startAnimation(); // Begin the animation and capture
}
