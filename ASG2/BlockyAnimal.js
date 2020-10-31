
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
let g_headAngle = 0;
let g_tailAngle = 0;
let g_earAngle = 0;

let doAnimation = false;


function main() {

    // Create canvas and setup WebGL
    setUpCanvas();

    // Initialize Shaders for WEBGL
    initAllShaders();

    // Register function (event handler) to be called on a mouse press
    setUpAllEvents();


    // Specify the color for clearing <canvas>
    gl.clearColor(94 / 255, 129 / 255, 172 / 255, 1);

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
    gl.enable(gl.BLEND)
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA);
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
    document.getElementById('headSlide').addEventListener('mousemove', function (ev) { if (ev.buttons) { g_headAngle = this.value; renderAllShapes(); } });
    document.getElementById('tailSide').addEventListener('mousemove', function (ev) { if (ev.buttons) { g_tailAngle = this.value; renderAllShapes(); } });
    document.getElementById('earSlide').addEventListener('mousemove', function (ev) { if (ev.buttons) { g_earAngle = this.value; renderAllShapes(); } });
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
        g_headAngle = (12 * Math.sin(g_seconds));
        g_tailAngle = (7 * Math.sin(g_seconds));
        g_earAngle = (7 * Math.cos(g_seconds));
    }
}

// Goes through the global lists and renders all points on the page
function renderAllShapes() {
    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var body = new Cube();
    body.color = [216 / 255, 222 / 255, 233 / 255, 1];
    body.matrix.translate(0, 0, 0);
    var bodyC = new Matrix4(body.matrix);
    body.matrix.scale(.4, .4, .8);
    body.render();

    var tail = new Cube();
    tail.color = [200 / 255, 200 / 255, 200 / 255, 1];
    tail.matrix.set(bodyC);
    tail.matrix.rotate(10, 1, 0, 0);
    tail.matrix.rotate(-g_tailAngle, 0, 1, 0);
    tail.matrix.scale(.125, .125, .5);
    tail.matrix.translate(0, 0, 1.25);
    tail.render();

    var mane = new Cube();
    mane.color = [200 / 255, 200 / 255, 200 / 255, 1];
    mane.matrix.set(body.matrix);
    mane.matrix.scale(1.2, 1.2, .35);
    mane.matrix.translate(0, 0, -1.5);
    mane.matrix.rotate(-g_headAngle, 1, 0, 0);
    mane.render();

    var head = new Cube();
    head.color = [180 / 255, 180 / 255, 180 / 255, 1];
    head.matrix.set(mane.matrix);
    head.matrix.scale(.8, .8, .5);
    head.matrix.translate(0, 0, -1.5);
    head.render();

    var snout = new Cube();
    snout.color = [160 / 255, 160 / 255, 160 / 255, 1];
    snout.matrix.set(head.matrix);
    snout.matrix.scale(.5, .5, 1);
    snout.matrix.translate(0, -0.5, -1);
    snout.render();

    var leftEar = new Cube();
    leftEar.color = [160 / 255, 160 / 255, 160 / 255, 1];
    leftEar.matrix.set(head.matrix);
    leftEar.matrix.rotate(g_earAngle, 0, 0, 1);
    leftEar.matrix.scale(.33, .5, .33);
    leftEar.matrix.translate(-1, 1.125, 1);
    leftEar.render();

    var rightEar = new Cube();
    rightEar.color = [160 / 255, 160 / 255, 160 / 255, 1];
    rightEar.matrix.set(head.matrix);
    rightEar.matrix.rotate(-g_earAngle, 0, 0, 1);
    rightEar.matrix.scale(.33, .5, .33);
    rightEar.matrix.translate(1, 1.125, 1);
    rightEar.render();

    var leftIris = new Cube();
    leftIris.color = [1, 1, 1, 1];
    leftIris.matrix.set(head.matrix);
    leftIris.matrix.scale(.33, .2, .33);
    leftIris.matrix.translate(-1, .5, -1.5);
    leftIris.render();

    var rightIris = new Cube();
    rightIris.color = [1, 1, 1, 1];
    rightIris.matrix.set(head.matrix);
    rightIris.matrix.scale(.33, .2, .33);
    rightIris.matrix.translate(1, 0.5, -1.5);
    rightIris.render();

    var leftPupil = new Cube();
    leftPupil.color = [0, 0, 0, 1];
    leftPupil.matrix.set(leftIris.matrix);
    leftPupil.matrix.scale(.5, 1, .5);
    leftPupil.matrix.translate(.5, 0, -1);
    leftPupil.render();

    var rightPupil = new Cube();
    rightPupil.color = [0, 0, 0, 1];
    rightPupil.matrix.set(rightIris.matrix);
    rightPupil.matrix.scale(.5, 1, .5);
    rightPupil.matrix.translate(-.5, 0, -1);
    rightPupil.render();


}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;
function tick() {
    g_seconds = performance.now() / 1000.0 - g_startTime;

    updateAnimationAngles();
    renderAllShapes();

    if (doAnimation) {
        requestAnimationFrame(tick);
    }
}