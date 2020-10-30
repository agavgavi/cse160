
var VSHADER_SOURCE = `
attribute vec4 a_Position;
attribute vec4 a_Color;

varying vec4 v_Color;

uniform mat4 u_ModelMatrix;
uniform mat4 u_GlobalRotateMatrix;
void main() {
    v_Color = a_Color;
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
}`;

// Fragment shader program
var FSHADER_SOURCE = `
precision mediump float;
varying vec4 v_Color;
void main() {
    gl_FragColor = v_Color;
}`;

// All Global Variables Here
let canvas;         // The canvas where things are being drawn
let gl;             // The WebGL variable used to control the page
let a_Position;     // A GLSL variable used to store the location of the point drawn
let a_Color;
let u_ModelMatrix;    // A GLSL uniform shader variable that allows the size to change.
let u_GlobalRotateMatrix;

let g_globalAngle = 0;
let g_YellowAngle = 0;
let g_magentaAngle = 0;

let doAnimation = false;


function main() {

    // Create canvas and setup WebGL
    setUpCanvas();

    // Initialize Shaders for WEBGL
    initAllShaders();

    // Register function (event handler) to be called on a mouse press
    setUpAllEvents();


    // Specify the color for clearing <canvas>
    gl.clearColor(0, 0, 0, 1);

    // // Clear <canvas>
    // renderAllShapes();

    requestAnimationFrame(tick);
}

// Initialize Canvas/WebGl to start
function setUpCanvas() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl" || "experimental-webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    gl.enable(gl.DEPTH_TEST);
}

// Initialize shaders and all variables for GLSL
function initAllShaders() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of a_Color
    a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (!a_Color) {
        console.log('Failed to get the storage location of a_Color');
        return;
    }

    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    // Get the storage location of u_GlobalRotateMatrix
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// All UI actions will be connected here.
function setUpAllEvents() {
    // Set up all canvas attributes

    document.getElementById('angleSlide').addEventListener('mousemove', function (ev) { if (ev.buttons) { g_globalAngle = this.value; renderAllShapes(); } });
    document.getElementById('yellowSlide').addEventListener('mousemove', function (ev) { if (ev.buttons) { g_YellowAngle = this.value; renderAllShapes(); } });
    document.getElementById('boxSlide').addEventListener('mousemove', function (ev) { if (ev.buttons) { g_magentaAngle = this.value; renderAllShapes(); } });
    document.getElementById('animateYellowButtonON').onclick = function () { doAnimation = true; tick(); };

    document.getElementById('animateYellowButtonOFF').onclick = function () { doAnimation = false; };
}



// These helper functions to convert RGB to and from hex come from:
// https://stackoverflow.com/a/5624139
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function HexToRGB(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}


// On a mouse click it will convert the cords to WebGl version
// Add a new object to the list depending on type
// And render all shapes
function click(ev) {
    let point = coordsToWebGL(ev);



    renderAllShapes();
}

// Get Point in WebGL form, not normal canvas
function coordsToWebGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    return [x, y];
}
function updateAnimationAngles() {
    if (doAnimation) {
        g_YellowAngle = (45 * Math.sin(g_seconds));
    }
}

// Goes through the global lists and renders all points on the page
function renderAllShapes() {
    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var body = new Cube();
    body.color = [1, 0, 0, 1];
    body.matrix.translate(-.25, -.75, 0);
    body.matrix.rotate(-5, 1, 0, 0);
    body.matrix.scale(0.5, .3, .5);
    body.render();

    var leftArm = new Cube();
    leftArm.color = [1, 1, 0, 1];
    leftArm.matrix.setTranslate(0, -.5, 0);
    leftArm.matrix.rotate(-5, 1, 0, 0);
    leftArm.matrix.rotate(-g_YellowAngle, 0, 0, 1);
    var yellowCoordsMat = new Matrix4(leftArm.matrix);
    leftArm.matrix.scale(0.25, .7, .5);
    leftArm.matrix.translate(-.5, 0, 0);
    leftArm.render();

    var testBox = new Cube();
    testBox.color = [1, 0, 1, 1];
    testBox.matrix = yellowCoordsMat;
    testBox.matrix.translate(0, 0.65, 0);
    testBox.matrix.rotate(g_magentaAngle, 0, 0, 1);
    testBox.matrix.scale(.3, .3, .3);
    testBox.matrix.translate(-.5, 0, -0.001);
    testBox.render();


}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;
function tick() {
    g_seconds = performance.now() / 1000.0 - g_startTime;
    console.log(g_seconds);

    updateAnimationAngles();
    renderAllShapes();

    if (doAnimation) {
        requestAnimationFrame(tick);
    }
}