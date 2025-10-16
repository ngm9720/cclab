let path = [];
let numPoints = 80;
let step = 1.5;
let snakeX, snakeY;
let turns = [];
let segmentLength = 40;
let minThick = 1;
let maxThick = 60;

let vanishingX, vanishingY;

let animating = false;
let direction = 1;
let frameInCycle = 0;

let apple = { x: 700, y: 150, size: 60, dragging: false };
let hammer = { x: 700, y: 280, size: 60, dragging: false };

function setup() {
  let canvas = createCanvas(800, 500);
  canvas.parent("p5-canvas-container");
  noStroke();
  
  snakeX = width / 2;
  snakeY = 150;
  
  vanishingX = width / 2;
  vanishingY = 0;

  for (let i = 0; i < numPoints; i++) {
    path.push({ x: -i * step, y: 0 });
  }

  turns = [HALF_PI, HALF_PI, -HALF_PI, -HALF_PI];
}

function draw() {
  drawGrassBackground();
  drawSnake();
  drawIcons();
  handleDragging();
}

function drawGrassBackground() {
  background(95, 150, 70);
  
  let baseColor1 = color(95, 150, 70);
  let baseColor2 = color(70, 125, 50);

  for (let y = 0; y < height; y++) {
    let t = map(y, 0, height, 0, 1);
    stroke(lerpColor(baseColor1, baseColor2, t));
    line(0, y, width, y);
  }

  noStroke();
  randomSeed(12345);
  for (let i = 0; i < 500; i++) {
    let bx = random(width);
    let by = pow(random(), 0.5) * height;
    let depth = map(by, 0, height, 0, 1);
    let bladeLen = lerp(6, 80, depth);
    let bladeWidth = lerp(0.6, 3, depth);

    let angle = atan2(vanishingY - by, vanishingX - bx) + random(-0.05, 0.05);
    let tipX = bx + cos(angle) * bladeLen;
    let tipY = by + sin(angle) * bladeLen;

    fill(lerpColor(color(80, 165, 75), color(60, 140, 50), random(0.2, 0.8)));
    triangle(
      bx - bladeWidth / 2, by,
      bx + bladeWidth / 2, by,
      tipX, tipY
    );
  }

  fill(30, 80, 30, 50);
  rect(0, height * 0.92, width, height * 0.08);
}

function drawSnake() {
  let totalFramesPerSegment = segmentLength;
  let cycleFrames = segmentLength * turns.length;

  if (animating) {
    frameInCycle += direction;
    if (frameInCycle >= cycleFrames || frameInCycle < 0) {
      animating = false;
      frameInCycle = constrain(frameInCycle, 0, cycleFrames - 1);
    }
  }

  let segIndex = floor(frameInCycle / totalFramesPerSegment);
  let angle = 0;
  for (let i = 0; i < segIndex; i++) {
    angle += turns[i];
  }

  let t = (frameInCycle % segmentLength) / segmentLength;
  let transitionFrames = 12 / segmentLength;
  if (t > 1 - transitionFrames && segIndex < turns.length) {
    let turnProgress = (t - (1 - transitionFrames)) / transitionFrames;
    angle += turns[segIndex] * ease(turnProgress);
  }

  if (animating) {
    let head = path[path.length - 1];
    let newX = head.x + cos(angle) * step * direction;
    let newY = head.y + sin(angle) * step * direction;
    path.push({ x: newX, y: newY });
    if (path.length > numPoints) path.shift();
  }

  fill(0);
  for (let i = 0; i < path.length; i++) {
    let p = path[i];
    let thickness = lerp(minThick, maxThick, (p.y + snakeY) / height);
    ellipse(snakeX + p.x, snakeY + p.y, thickness);
  }

  let snakeHead = path[path.length - 1];
  let headSize = lerp(minThick, maxThick, (snakeHead.y + snakeY) / height);
  fill(255);
  ellipse(snakeX + snakeHead.x - headSize * 0.25, snakeY + snakeHead.y - headSize * 0.25, headSize * 0.15);
  ellipse(snakeX + snakeHead.x + headSize * 0.25, snakeY + snakeHead.y - headSize * 0.25, headSize * 0.15);
}

function drawIcons() {
  push();
  translate(apple.x, apple.y);
  drawApple(apple.size);
  pop();

  push();
  translate(hammer.x, hammer.y);
  drawHammer(hammer.size);
  pop();
}

function drawApple(size) {
  noStroke();
  let r = size / 2;

  for (let i = 0; i < r; i++) {
    let inter = map(i, 0, r, 0, 1);
    fill(lerpColor(color(220, 0, 0), color(150, 0, 0), inter));
    ellipse(0, 0, r * 2 - i, r * 2 - i);
  }

  // Highlight
  fill(255, 255, 255, 80);
  ellipse(-r / 3, -r / 3, r * 0.6);

  // Stem
  stroke(60, 30, 10);
  strokeWeight(4);
  line(0, -r * 1.1, 0, -r * 1.5);

  // Leaf
  noStroke();
  fill(60, 180, 75);
  ellipse(r * 0.4, -r * 1.3, r * 0.6, r * 0.3);
}

function drawHammer(size) {
  let headW = size * 0.8;
  let headH = size * 0.3;
  let handleH = size * 1.4;
  let handleW = size * 0.15;

  push();
  fill(120, 80, 40);
  rect(-handleW / 2, 10, handleW, handleH, 4);
  stroke(180, 130, 80);
  strokeWeight(1);
  for (let y = 15; y < handleH; y += 8) {
    line(-handleW / 2 + 2, y, handleW / 2 - 2, y);
  }
  pop();

  push();
  noStroke();
  for (let i = 0; i < 10; i++) {
    let inter = map(i, 0, 9, 0, 1);
    fill(lerpColor(color(180), color(100), inter));
    rect(-headW / 2, -headH / 2 - i * 0.5, headW, headH, 5);
  }

  fill(80);
  arc(-headW / 2, -headH * 0.3, headH, headH * 1.3, PI, TWO_PI);

  // Highlight
  fill(255, 255, 255, 60);
  rect(-headW / 2 + 5, -headH / 2 + 2, headW - 10, headH / 3, 5);
  pop();
}

function mousePressed() {
  if (dist(mouseX, mouseY, apple.x, apple.y) < apple.size / 2) apple.dragging = true;
  if (dist(mouseX, mouseY, hammer.x, hammer.y) < hammer.size / 2) hammer.dragging = true;
}

function mouseReleased() {
  if (apple.dragging) {
    apple.dragging = false;
    if (isOverSnake(mouseX, mouseY)) triggerSnakeMove(1);
    apple.x = 700;
    apple.y = 150;
  }
  if (hammer.dragging) {
    hammer.dragging = false;
    if (isOverSnake(mouseX, mouseY)) triggerSnakeMove(-1);
    hammer.x = 700;
    hammer.y = 280;
  }
}

function handleDragging() {
  if (apple.dragging) {
    apple.x = mouseX;
    apple.y = mouseY;
  }
  if (hammer.dragging) {
    hammer.x = mouseX;
    hammer.y = mouseY;
  }
}

function isOverSnake(x, y) {
  let head = path[path.length - 1];
  let hx = snakeX + head.x;
  let hy = snakeY + head.y;
  return dist(x, y, hx, hy) < 100;
}

function triggerSnakeMove(dir) {
  direction = dir;
  animating = true;
  if (dir === 1) frameInCycle = 0;
  else frameInCycle = segmentLength * turns.length - 1;
}

function ease(t) {
  return 0.5 - 0.5 * cos(PI * t);
}
