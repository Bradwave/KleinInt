// MAIN ORIGIN
let xOrigin, yOrigin;

// SCALE AND DESCALE FACTORS
let scaleFactor = 200.000000;
let descaleFactor = 1.000000 / scaleFactor;

// ZOOM
const MAX_ZOOM = 200;
let minZoom = 3;

// BORDERS
const GRID = { xMin: 0, xMax: 250, yMin: 0, yMax: 250 };
const TOLERANCE = 100;
let borders;

// GRID
gridSkip = 0;

/**
 * Set the origin of the Cartesian coordinate system according to the canvas size.
 */
function centerOrigin() {
    // Set main origin.
    xOrigin = width * 0.5;
    yOrigin = height * 0.5;

    // Set scale and descale factors.
    calcZoom();
    updateScaling(minZoom * 5, 0, 0, 0);
    prevScale = scaleFactor;

    translateOrigin(20 * scaleFactor, -20 * scaleFactor);

    calcBorders();
}

/**
 * Calculate the minimum level of zoom, based on the width and height of the canvas.
 */
function calcZoom() {
    minZoom = (width > height) * width / (GRID.xMax - GRID.xMin) * 0.4 +
        (width < height) * height / (GRID.yMax - GRID.yMin) * 0.4;
}

/**
 * Updated the scaling and the grid skip parameter.
 */
function updateScaling(newScale, c, mx, my) {
    if (newScale < minZoom) {
        scaleFactor = minZoom;
        calcBorders();
    } else if (newScale > MAX_ZOOM) {
        scaleFactor = MAX_ZOOM;
        calcBorders();
    } else {
        scaleFactor = newScale;
        let tInc = toCartesian(mx, my);
        translateOrigin(tInc.x * c, - tInc.y * c);
    }

    descaleFactor = 1.000000 / scaleFactor;
    gridSkip = Math.min(Math.pow(2, Math.floor(descaleFactor * 20)), 16);
}

/**
 * Scale the system by a given amount, determined by the zoom increment.
 * @param {Number} c Zoom increment
 */
function scaleSystem(c) {
    c /= (-100);
    updateScaling(scaleFactor + c, c, mouseX, mouseY);
}

/**
 * Calculate the canvas borders coordinates in the cartesian system.
 */
function calcBorders() {
    let startPoint = toCartesian(0, 0);
    let endPoint = toCartesian(width, height);
    borders = {
        xMin: Math.max(startPoint.x, GRID.xMin),
        xMax: Math.min(endPoint.x, GRID.xMax),
        yMin: Math.max(endPoint.y, GRID.yMin),
        yMax: Math.min(startPoint.y, GRID.yMax)
    };
}

/**
 * Translate the origin by a given amount, determined by the increment (x,y).
 * @param {Number} x Increment of the x coordinate
 * @param {Number} y Increment of the y coordinate
 */
function translateOrigin(x, y) {
    xOrigin -= x;
    yOrigin -= y;

    calcBorders();
}

/**
 * Converts screen coordinates to cartesian coordinates with origin in the center of the window.
 * @param {Number} x Coordinate x
 * @param {Number} y Coordinate y
 */
function toCartesian(x, y) {
    let cx = (x - xOrigin) * descaleFactor;
    let cy = (yOrigin - y) * descaleFactor;
    return { x: cx, y: cy };
}

/**
* Converts cartesian coordinates to screen coordinates with origin in the top left corner of the window.
* @param {Number} x Coordinate x
* @param {Number} y Coordinate y
*/
function toScreenCoord(x, y) {
    let sx = x * scaleFactor + xOrigin;
    let sy = yOrigin - y * scaleFactor;
    return { x: sx, y: sy };
}

