/**
 * This is coded so poorly it's honestly embarrassing.\
 * It works thought, or so it seems.
 */

// COEFFICIENTS & LINE
let n = 5;
let x1, x2, y1, y2;

// APPROX
let cf = [], approx = [];
let periodIndex = Infinity;
const MAX_APPROX = 9;

// OPTIONS
let nSlider;
let squaredRoot = true;

// COLORS
let colCheck;
let fgColor = 0, bgColor = 255;
let ht1Color = Math.abs(fgColor - 135);
let ht2Color = Math.abs(fgColor - 155);
const EVEN_COLOR = 'red', ODD_COLOR = 'blue';

function setup() {
  createCanvas(windowWidth, windowHeight);
  centerOrigin();

  calcLine();
  calcApprox();

  setSlider();
  setCheckbox()

  textFont('Georgia');

  noLoop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  centerOrigin();
  redraw();
}

/**
 * Sets default position of the slider.
 */
function setSlider() {
  nSlider = select('#nSlider');
  nSlider.position(85, 22);
}

/**
 * Sets default behaviour of the checkbox for inverting the color scheme.
 */
function setCheckbox() {
  colCheck = createCheckbox(' Inverti colori', false);
  colCheck.style("color: #000000")
  colCheck.position(10, height - 30);
  colCheck.changed(invertColors);
}

/**
 * Inverts the colors used.
 */
function invertColors() {
  bgColor = [fgColor, fgColor = bgColor][0];
  ht1Color = Math.abs(fgColor - 155);
  ht2Color = Math.abs(fgColor - 135);

  let textCol = colCheck.checked() ? "color: #ffffff" : "color: #000000";
  nSlider.style(textCol);
  colCheck.style(textCol);

  redraw();
}

/**
 * Updates the square root and the line equation.
 * @param {Number} value 
 */
function updateEquation(value) {
  n = value > 0 ? value : 1 / Math.abs(value);

  calcLine();
  calcApprox();
  redraw();
}

/**
 * Calculates the endpoints of the line with angular coefficient the square root.
 */
function calcLine() {
  let coeff = Math.sqrt(n);

  x1 = GRID.yMax / coeff;
  x1 = x1 < GRID.xMin ? GRID.xMin : (x1 > GRID.xMax ? GRID.xMax : x1);

  x2 = GRID.yMin / coeff;
  x2 = x2 < GRID.xMin ? GRID.xMin : (x2 > GRID.xMax ? GRID.xMax : x2);

  y1 = coeff * x1;
  y2 = coeff * x2;
}

/**
 * Calculates the continued fraction representation of the square root
 * and the corresponding approximations.
 */
function calcApprox() {
  cf = [];
  approx = [];
  periodIndex = Infinity;
  let prevCalc = [];

  let x = Math.sqrt(n);

  if (!Number.isInteger(x)) {

    for (let m = 0; m < MAX_APPROX; m++) {

      cf.push(Math.trunc(x));
      prevCalc[m] = x;
      x = 1 / (x % 1);

      let y = { num: cf[m], den: 1 };

      for (let k = m - 1; k >= 0; k--) {
        y.den = [y.num, y.num = y.den][0];
        y.num = y.den * cf[k] + y.num;

        if (periodIndex == Infinity && Math.abs(x - prevCalc[k + 1]) < 0.00001) {
          periodIndex = m;
        }
      }
      approx.push(y);
    }

    approx.unshift({ num: 1, den: 0 });
    approx.unshift({ num: 0, den: 1 });

  } else {
    cf[0] = x;
  }

}

/**
 * Draws the line defined with angular coefficient the square root.
 */
function drawLine() {
  stroke(fgColor);
  strokeWeight(2);

  p1 = toScreenCoord(x1, y1);
  p2 = toScreenCoord(x2, y2);
  line(p1.x, p1.y, p2.x, p2.y);
}

/**
 * Draws the approximations with even and odd indexes.
 */
function drawApprox() {
  for (let k = 0; k < approx.length - 2; k++) {
    let c = approx[k];
    let c0 = approx[k + 2];
    let p = toScreenCoord(c.den, c.num);
    let p0 = toScreenCoord(c0.den, c0.num);

    if (p.x > -5 && p.x < width + 5 && p.y >= 5 && p.y < height + 5) {
      let odd = k % 2 == 0 ? true : false;
      fill(fgColor)
        .strokeWeight(0)
        .textSize(16);
      text('(' + c.den + ', ' + c.num + ')',
        p.x + (odd ? 15 : (-50))
        + (!odd) * ((c.den > 9) + (c.num > 9)) * (-9), p.y + 10);

      odd ? stroke(ODD_COLOR) : stroke(EVEN_COLOR);
      strokeWeight(10);
      point(p.x, p.y);

      if (c0.den < GRID.xMax && c0.num < GRID.yMax) {
        strokeWeight(1);
        line(p0.x, p0.y, p.x, p.y);
      }
    }
  }
}

/**
 * Draws the Cartesian axes.
 */
function drawAxis() {
  stroke(ht1Color);
  strokeWeight(1);

  // X AXIS
  let p1 = toScreenCoord(0, GRID.yMax);
  let p2 = toScreenCoord(0, GRID.yMin);
  line(p1.x, p1.y, p2.x, p2.y);

  // Y AXIS
  p1 = toScreenCoord(GRID.xMin, 0);
  p2 = toScreenCoord(GRID.xMax, 0);
  line(p1.x, p1.y, p2.x, p2.y);
}

/**
 * Draws the Cartesian grid as dots.\
 * The amount of dots is determined by the scale (or level of zoom).
 */
function drawGrid() {
  stroke(ht2Color);
  strokeWeight(2);

  for (let i = Math.floor(borders.xMin); i < Math.floor(borders.xMax) + 1; i++) {
    for (let j = Math.floor(borders.yMin); j < Math.floor(borders.yMax) + 1; j++) {
      if (i % gridSkip == 0 && j % gridSkip == 0) {
        let p = toScreenCoord(i, j);
        point(p.x, p.y);
      }
    }
  }
}

/**
 * Draws the square root and the equation of the line
 * in the top-left corner of the canvas.
 * It looks so bad...
 */
function drawFormula() {
  // Square root
  fill(fgColor)
    .strokeWeight(0)
    .textSize(24);
  text('m = √', 20, 45);
  text('__', 85, 23);

  // Continued fraction.
  text(' = [' + cf[0], 120, 45);
  for (let i = 1; i < Math.min(cf.length, periodIndex + 1); i++) {
    text(', ' + cf[i], 150 + 25 * i, 45)
  }
  text(']',
    cf.length == 1 ? 170 : 155 + 25 * Math.min(cf.length, periodIndex + 1)
      + (cf[periodIndex] > 9) * 10, 45);

  // Line equation.
  text('y = m · x', 20, 90);

  // Periodic symbol.
  stroke(fgColor);
  strokeWeight(1);
  if (periodIndex != Infinity) {
    line(184, 26,
      178 + 25 * periodIndex + (cf[periodIndex] > 9) * 10, 26);
  }

  // Approximations.
}

function draw() {
  background(bgColor);
  drawAxis();
  drawGrid();
  drawLine();
  drawApprox();
  drawFormula();
}