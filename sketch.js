let blockSize = 80; // Default size of each block
let clusters = []; // Array to store clusters created from click points
let colorPicker, blockSizeSlider, densitySlider;
let chosenColor = '#c896ff';
let density = 0.7;
let growSpeed = 5; // Speed of inward growth in pixels per frame
let isAnimating = false; // Track whether animation has started

function setup() {
  let canvas = createCanvas(1080, 1080); // Default canvas size set to 1:1
  canvas.parent(document.body);

  colorPicker = select('#colorPicker');
  blockSizeSlider = select('#blockSizeSlider');
  densitySlider = select('#densitySlider');

  colorPicker.input(updateColor);
  blockSizeSlider.input(updateBlockSize);
  densitySlider.input(updateDensity);

  background(255); // Initial background
  noLoop(); // Start without animation
}

// Function to set canvas size based on the selected button
function setCanvasSize(width, height) {
  resizeCanvas(width, height);
  restart(); // Restart to clear any current clusters and animation
}

// Restarts by clearing the canvas and resetting clusters
function restart() {
  background(255); // Clear the canvas
  clusters = []; // Reset clusters array
  isAnimating = false; // Reset animation state
  noLoop(); // Stop the animation loop if it was running
  select('#animateButton').attribute('disabled', ''); // Disable Animate button
}

// Handles mouse clicks to select points on the canvas
function mousePressed() {
  if (isAnimating || clusters.length >= 3) return; // No more points if animating or already 3 points selected

  // Add a new cluster with feedback point shown
  let newCluster = {
    x: mouseX,
    y: mouseY,
    currentRadius: 0, // Start growing from the center
    blocks: [] // Blocks that will appear within this cluster
  };
  
  clusters.push(newCluster);
  
  // Draw feedback square at clicked location
  fill(chosenColor);
  noStroke();
  rect(mouseX, mouseY, blockSize, blockSize);

  // Enable Animate button if 3 points are selected
  if (clusters.length === 3) {
    select('#animateButton').removeAttribute('disabled');
  }
}

// Generates blocks in a grid pattern around each selected point with randomness
function generateCluster(cluster) {
  let maxBlocks = 100; // Total number of blocks we want in each cluster
  let blockCount = 0;

  // Start generating blocks in a grid with some randomness to create the fragmented look
  for (let y = -blockSize * 5; y <= blockSize * 5; y += blockSize) {
    for (let x = -blockSize * 5; x <= blockSize * 5; x += blockSize) {
      if (blockCount >= maxBlocks) break;
      let distToCenter = dist(x, y, 0, 0);
      if (distToCenter < blockSize * 5 && random(1) < density) {
        // Push block with slightly random position and size for fragmented structure
        cluster.blocks.push({
          x: cluster.x + x,
          y: cluster.y + y,
          size: blockSize * random(0.8, 1.2), // Randomize size slightly for organic look
          distanceFromCenter: dist(x, y, 0, 0) // Distance for sequential appearance
        });
        blockCount++;
      }
    }
  }
}

// Begins the outward growth animation when Animate is clicked and 3 points are selected
function startAnimation() {
  if (clusters.length === 3) {
    isAnimating = true;
    select('#animateButton').attribute('disabled', ''); // Disable Animate button during animation
    loop(); // Start the animation loop
  }
}

function draw() {
  if (!isAnimating) return; // Exit draw if not animating

  clear(); // Clear with transparency
  fill(chosenColor);
  noStroke();

  // Expand each cluster outward
  for (let cluster of clusters) {
    // Generate blocks for each cluster if not already done
    if (cluster.blocks.length === 0) {
      generateCluster(cluster);
    }

    // Expand the "wave" outward
    cluster.currentRadius += growSpeed;

    // Draw blocks within the current radius
    for (let block of cluster.blocks) {
      if (block.distanceFromCenter <= cluster.currentRadius) {
        rect(block.x, block.y, block.size, block.size); // Use randomized size
      }
    }
  }

  // Stop the loop and display full clusters when animation completes
  if (clusters.every(cluster => cluster.currentRadius >= blockSize * 5)) {
    isAnimating = false;
    noLoop();
    
    // Display the final clusters in full at the clicked points
    drawFullClusters();
  }
}

// Function to draw complete clusters at the clicked points
function drawFullClusters() {
  fill(chosenColor);
  noStroke();
  
  for (let cluster of clusters) {
    for (let block of cluster.blocks) {
      rect(block.x, block.y, block.size, block.size);
    }
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
