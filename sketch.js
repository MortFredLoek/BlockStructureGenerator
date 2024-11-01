let blockSize = 40;
let blocks = [];
let colorPicker, blockSizeSlider, densitySlider;
let chosenColor = '#c896ff';
let density = 0.6;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight * 0.7);
  canvas.parent(document.body);

  colorPicker = select('#colorPicker');
  blockSizeSlider = select('#blockSizeSlider');
  densitySlider = select('#densitySlider');

  colorPicker.input(updateColor);
  blockSizeSlider.input(updateBlockSize);
  densitySlider.input(updateDensity);

  noLoop();
}

function generateStructure() {
  background(255);
  blocks = [];
  blockSize = blockSizeSlider.value();
  density = densitySlider.value();
  // ... (rest of the block generation logic)
  redraw();
}

function updateColor() {
  chosenColor = colorPicker.value();
  redraw();
}

function updateBlockSize() {
  blockSize = blockSizeSlider.value();
  redraw();
}

function updateDensity() {
  density = densitySlider.value();
  redraw();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight * 0.7);
  generateStructure();
}
