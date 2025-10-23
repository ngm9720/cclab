
let snakeX, snakeY;
let segLength = 40;
let stepSize = 1.5;
let direction = 1;
let animating = false;
let frameInCycle = 0;
let snakeLength = 70;

let portalActive = false;
let portalPhase = 0;
let entryPortalX, entryPortalY;
let exitPortalX, exitPortalY;
let entryPortalSize = 0;
let exitPortalSize = 0;
let entryPortalOpen = false;
let exitPortalOpen = false;

let turnAngles = [Math.PI / 2, Math.PI / 2, -Math.PI / 2, -Math.PI / 2];
let minTh = 1;
let maxTh = 60;

let ptsX = [];
let ptsY = [];

let appleX, appleY, appleSize, appleDragging;
let hammerX, hammerY, hammerSize, hammerDragging;

let backgroundsave;

function setup() {
  let canvas = createCanvas(800, 500);
  canvas.parent("p5-canvas-container");
  noStroke();

  snakeX = width / 2;
  snakeY = 150;

  for (let i = 0; i < snakeLength; i++) {
    ptsX[i] = -i * stepSize;
    ptsY[i] = 0;
  }

  appleX = 700; 
  appleY = 150; 
  appleSize = 60; 
  appleDragging = false;

  hammerX = 700; 
  hammerY = 280; 
  hammerSize = 60; 
  hammerDragging = false;

  drawGrassBackground();
  backgroundsave = get();
}

function draw() {
  image(backgroundsave, 0, 0);
  
  if (portalActive || entryPortalSize > 0 || exitPortalSize > 0) {
    handlePortalAnimation();
  }
  
  if (exitPortalSize > 0) {
    drawPortal(exitPortalX, exitPortalY, exitPortalSize);
  }
  
  drawSnake();
  
  if (entryPortalSize > 0) {
    drawPortal(entryPortalX, entryPortalY, entryPortalSize);
  }
  
  drawIcons();
  handleDragging();
}

function drawGrassBackground() {
  background(95, 150, 70);
  let base1 = color(95, 150, 70);
  let base2 = color(70, 125, 50);

  for (let y = 0; y < height; y++) {
    let t = y / height;
    stroke(lerpColor(base1, base2, t));
    line(0, y, width, y);
  }

  noStroke();
  randomSeed(1234);
  for (let i = 0; i < 400; i++) {
    let bx = random(width);
    let by = pow(random(), 0.5) * height;
    let depth = by / height;
    let len = lerp(8, 90, depth);
    let w = lerp(1, 3, depth);
    let ang = atan2(0 - by, width / 2 - bx) + random(-0.1, 0.1);
    let tipx = bx + cos(ang) * len;
    let tipy = by + sin(ang) * len;
    fill(lerpColor(color(80, 165, 75), color(60, 140, 50), random(0.2, 0.8)));
    triangle(bx - w, by, bx + w, by, tipx, tipy);
  }

  fill(30, 80, 30, 60);
  rect(0, height * 0.93, width, height * 0.07);
}

function drawSnake() {
  let segFrames = segLength;
  let totalFrames = segLength * 4;

  if (animating) {
    frameInCycle += direction;
    if (frameInCycle >= totalFrames || frameInCycle < 0) {
      animating = false;
      frameInCycle = constrain(frameInCycle, 0, totalFrames - 1);
    }
  }

  let segIndex = floor(frameInCycle / segFrames);
  let baseAngle = 0;
  for (let i = 0; i < segIndex; i++) baseAngle += turnAngles[i] || 0;

  let frac = (frameInCycle % segLength) / segLength;
  let transFrames = 12 / segLength;
  if (frac > 1 - transFrames && segIndex < 4) {
    let prog = (frac - (1 - transFrames)) / transFrames;
    baseAngle += turnAngles[segIndex] * ease(prog);
  }

  if (animating) {
    let headX = ptsX[ptsX.length - 1];
    let headY = ptsY[ptsY.length - 1];
    let wobble = sin(frameCount * 0.08) * 0.15;
    let a = baseAngle + wobble;
    let nx = headX + cos(a) * stepSize * direction;
    let ny = headY + sin(a) * stepSize * direction;

    for (let i = 0; i < ptsX.length - 1; i++) {
      ptsX[i] = ptsX[i + 1];
      ptsY[i] = ptsY[i + 1];
    }
    ptsX[ptsX.length - 1] = nx;
    ptsY[ptsY.length - 1] = ny;
  }

  fill(0);
  for (let i = 0; i < ptsX.length; i += 3) {
    let th = lerp(minTh, maxTh, (ptsY[i] + snakeY) / height);
    ellipse(snakeX + ptsX[i], snakeY + ptsY[i], th);
  }

  let headSize = lerp(minTh, maxTh, (ptsY[ptsY.length - 1] + snakeY) / height);
  fill(255);
  ellipse(snakeX + ptsX[ptsX.length - 1] - headSize * 0.25, snakeY + ptsY[ptsY.length - 1] - headSize * 0.25, headSize * 0.15);
  ellipse(snakeX + ptsX[ptsX.length - 1] + headSize * 0.25, snakeY + ptsY[ptsY.length - 1] - headSize * 0.25, headSize * 0.15);
}

function drawIcons() {
  push();
  translate(appleX, appleY);
  
  fill(180, 0, 0);
  ellipse(-2, 2, appleSize);
  fill(220, 20, 20);
  ellipse(0, 0, appleSize);
  fill(255, 60, 60);
  ellipse(appleSize * 0.15, -appleSize * 0.15, appleSize * 0.4);
  
  fill(80, 60, 30);
  rect(-2, -appleSize / 2, 4, 8);
  fill(50, 120, 40);
  ellipse(0, -appleSize / 2 - 6, 12, 8);
  pop();

  push();
  translate(hammerX, hammerY);
  
  fill(100);
  rect(-hammerSize * 0.25 + 2, -hammerSize * 0.12 + 2, hammerSize * 0.5, hammerSize * 0.24);
  fill(180);
  rect(-hammerSize * 0.25, -hammerSize * 0.12, hammerSize * 0.5, hammerSize * 0.24);
  fill(220);
  rect(-hammerSize * 0.2, -hammerSize * 0.08, hammerSize * 0.15, hammerSize * 0.12);
  
  fill(70, 50, 25);
  rect(-hammerSize * 0.05 + 1, 1, hammerSize * 0.1, hammerSize);
  fill(120, 85, 50);
  rect(-hammerSize * 0.05, 0, hammerSize * 0.1, hammerSize);
  fill(140, 100, 60);
  rect(-hammerSize * 0.04, hammerSize * 0.1, hammerSize * 0.08, hammerSize * 0.3);
  pop();
}

function mousePressed() {
  if (dist(mouseX, mouseY, appleX, appleY) < appleSize / 2) appleDragging = true;
  if (dist(mouseX, mouseY, hammerX, hammerY) < hammerSize / 2) hammerDragging = true;
}

function mouseReleased() {
  if (appleDragging) {
    appleDragging = false;
    if (isOverSnake(mouseX, mouseY)) triggerSnakeMove(1);
    appleX = 700;
    appleY = 150;
  }
  if (hammerDragging) {
    hammerDragging = false;
    if (isOverSnake(mouseX, mouseY)) triggerPortalAnimation();
    hammerX = 700;
    hammerY = 280;
  }
}

function handleDragging() {
  if (appleDragging) {
    appleX = mouseX;
    appleY = mouseY;
  }
  if (hammerDragging) {
    hammerX = mouseX;
    hammerY = mouseY;
  }
}

function isOverSnake(x, y) {
  let hx = snakeX + ptsX[ptsX.length - 1];
  let hy = snakeY + ptsY[ptsY.length - 1];
  return dist(x, y, hx, hy) < 100;
}

function triggerSnakeMove(dir) {
  direction = dir;
  animating = true;
  if (dir === 1) frameInCycle = 0;
  else frameInCycle = segLength * 4 - 1;
}

function ease(t) {
  return 0.5 - 0.5 * cos(PI * t);
}

function triggerPortalAnimation() {
  let headX = snakeX + ptsX[ptsX.length - 1];
  let headY = snakeY + ptsY[ptsY.length - 1];
  entryPortalX = headX;
  entryPortalY = headY + 50;
  
  exitPortalX = 200;
  exitPortalY = 80;
  
  portalActive = true;
  portalPhase = 0;
  animating = false;
  
  entryPortalOpen = true;
  entryPortalSize = 0;
  exitPortalSize = 0;
}

function handlePortalAnimation() {
  let entryMaxSize = lerp(20, 120, entryPortalY / height);
  let exitMaxSize = lerp(20, 120, exitPortalY / height);
  
  if (entryPortalOpen && entryPortalSize < entryMaxSize) {
    entryPortalSize += 3;
  }
  
  if (!entryPortalOpen && entryPortalSize > 0) {
    entryPortalSize -= 3;
  }
  
  if (exitPortalOpen && exitPortalSize < exitMaxSize) {
    exitPortalSize += 3;
  }
  
  if (!exitPortalOpen && exitPortalSize > 0) {
    exitPortalSize -= 3;
  }
  
  if (portalPhase === 0) {
    if (ptsX.length > 0) {
      let headX = ptsX[ptsX.length - 1];
      let headY = ptsY[ptsY.length - 1];
      
      let dx = entryPortalX - (snakeX + headX);
      let dy = entryPortalY - (snakeY + headY);
      let distance = sqrt(dx * dx + dy * dy);
      
      if (distance > 5) {
        let angle = atan2(dy, dx);
        let nx = headX + cos(angle) * 2;
        let ny = headY + sin(angle) * 2;
        
        for (let i = 0; i < ptsX.length - 1; i++) {
          ptsX[i] = ptsX[i + 1];
          ptsY[i] = ptsY[i + 1];
        }
        ptsX[ptsX.length - 1] = nx;
        ptsY[ptsY.length - 1] = ny;
      } else {
        ptsX.shift();
        ptsY.shift();
      }
    }
    
    if (ptsX.length === 0) {
      entryPortalOpen = false;
      portalPhase = 1;
      snakeX = exitPortalX;
      snakeY = exitPortalY;
      exitPortalOpen = true;
    }
  } 
  else {
    if (ptsX.length < snakeLength) {
      ptsX.unshift(0);
      ptsY.unshift(0);
    }
    
    for (let i = 0; i < ptsX.length; i++) {
      ptsX[i] += stepSize;
    }
    
    if (ptsX.length >= snakeLength && ptsX[ptsX.length - 1] > 100) {
      exitPortalOpen = false;
      portalActive = false;
      portalPhase = 0;
    }
  }
}

function drawPortal(x, y, size) {
  let colorShift = sin(frameCount * 0.1) * 30;
  
  for (let i = size; i > 0; i -= size / 10) {
    let t = i / size;
    let r = 60 + colorShift + t * 140;
    let g = 20 + t * 130;
    let b = 80 + t * 175;
    fill(r, g, b);
    ellipse(x, y, i);
  }
}