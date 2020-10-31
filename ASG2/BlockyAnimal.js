
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

let g_globalAngleX = 0;
let g_globalAngleY = 0;
let g_globalAngleZ = 0;
let g_headAngle = 0;
let g_tailAngle = 0;
let g_earAngle = 0;
let g_legAngle = 0;

let doAnimation = false;

let g_ShapesList = [];


function main() {

    // Create canvas and setup WebGL
    setUpCanvas();

    // Initialize Shaders for WEBGL
    initAllShaders();

    // Register function (event handler) to be called on a mouse press
    setUpAllEvents();

    setupCubes();
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

    document.getElementById('XangleSlide').addEventListener('mousemove', function (ev) { if (ev.buttons) { g_globalAngleX = this.value; renderAllShapes(); } });

    document.getElementById('YangleSlide').addEventListener('mousemove', function (ev) { if (ev.buttons) { g_globalAngleY = this.value; renderAllShapes(); } });

    document.getElementById('ZangleSlide').addEventListener('mousemove', function (ev) { if (ev.buttons) { g_globalAngleZ = this.value; renderAllShapes(); } });

    document.getElementById('headSlide').addEventListener('mousemove', function (ev) { if (ev.buttons) { g_headAngle = this.value; renderAllShapes(); } });

    document.getElementById('tailSide').addEventListener('mousemove', function (ev) { if (ev.buttons) { g_tailAngle = this.value; renderAllShapes(); } });

    document.getElementById('earSlide').addEventListener('mousemove', function (ev) { if (ev.buttons) { g_earAngle = this.value; renderAllShapes(); } });

    document.getElementById('animateYellowButtonON').onclick = function () { doAnimation = true; tick(); };

    document.getElementById('animateYellowButtonOFF').onclick = function () { doAnimation = false; };

    document.getElementById('resetCam').onclick = resetCam;
}

function resetCam() {
    g_globalAngleX = 0;
    g_globalAngleY = 0;
    g_globalAngleZ = 0;

    document.getElementById('XangleSlide').value = 0;

    document.getElementById('YangleSlide').value = 0;

    document.getElementById('ZangleSlide').value = 0;

    renderAllShapes();
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
        g_legAngle = (12 * Math.sin(g_seconds)) + 2;
    }
}


function setupCubes() {
    var globalRotMat = new Matrix4();
    var body = new Cube([190 / 255, 187 / 255, 187 / 255, 1]);
    var tail = new Cube([199 / 255, 196 / 255, 197 / 255, 1]);
    var mane = new Cube([199 / 255, 196 / 255, 197 / 255, 1]);
    var head = new Cube([218 / 255, 215 / 255, 216 / 255, 1]);
    var snout = new Cube([209 / 255, 178 / 255, 161 / 255, 1]);
    var nose = new Cube([13 / 255, 14 / 255, 16 / 255, 1]);
    var leftEar = new Cube([160 / 255, 158 / 255, 158 / 255, 1]);
    var rightEar = new Cube([160 / 255, 158 / 255, 158 / 255, 1]);
    var leftIris = new Cube([184 / 255, 184 / 255, 184 / 255, 1]);
    var rightIris = new Cube([184 / 255, 184 / 255, 184 / 255, 1]);
    var leftPupil = new Cube([13 / 255, 14 / 255, 16 / 255, 1]);
    var rightPupil = new Cube([13 / 255, 14 / 255, 16 / 255, 1]);
    var flLeg = new Cube([146 / 255, 144 / 255, 145 / 255, 1]);
    var frLeg = new Cube([146 / 255, 144 / 255, 145 / 255, 1]);
    var blLeg = new Cube([146 / 255, 144 / 255, 145 / 255, 1]);
    var brLeg = new Cube([146 / 255, 144 / 255, 145 / 255, 1]);

    g_ShapesList.push(globalRotMat,
        body, tail, mane, head,
        snout, nose, leftEar, rightEar,
        leftIris, rightIris, leftPupil, rightPupil,
        flLeg, frLeg, blLeg, brLeg);
}
// Goes through the global lists and renders all points on the page
function renderAllShapes() {

    // Clear <canvas>
    let globalRotMat = g_ShapesList[0];
    globalRotMat.setIdentity();
    globalRotMat.rotate(g_globalAngleX, 0, 1, 0);
    globalRotMat.rotate(g_globalAngleY, 1, 0, 0);
    globalRotMat.rotate(g_globalAngleZ, 0, 0, 1);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let body = g_ShapesList[1];
    let tail = g_ShapesList[2];
    let mane = g_ShapesList[3];
    let head = g_ShapesList[4];
    let snout = g_ShapesList[5];
    let nose = g_ShapesList[6];
    let leftEar = g_ShapesList[7];
    let rightEar = g_ShapesList[8];
    let leftIris = g_ShapesList[9];
    let rightIris = g_ShapesList[10];
    let leftPupil = g_ShapesList[11];
    let rightPupil = g_ShapesList[12];
    let flLeg = g_ShapesList[13];
    let frLeg = g_ShapesList[14];
    let blLeg = g_ShapesList[15];
    let brLeg = g_ShapesList[16];


    body.matrix.setIdentity();
    body.matrix.scale(.4, .4, .8);
    body.render();

    tail.matrix.setIdentity();
    tail.matrix.rotate(10, 1, 0, 0);
    tail.matrix.rotate(-g_tailAngle, 0, 1, 0);
    tail.matrix.scale(.125, .125, .5);
    tail.matrix.translate(0, 0, 1.25);
    tail.render();

    mane.matrix.setIdentity();
    mane.matrix.set(body.matrix);
    mane.matrix.scale(1.2, 1.2, .35);
    mane.matrix.translate(0, 0, -1.5);
    mane.matrix.rotate(-g_headAngle, 1, 0, 0);
    mane.render();

    head.matrix.setIdentity();
    head.matrix.set(mane.matrix);
    head.matrix.scale(.8, .8, .5);
    head.matrix.translate(0, 0, -1.5);
    head.render();

    snout.matrix.setIdentity();
    snout.matrix.set(head.matrix);
    snout.matrix.scale(.5, .5, 1);
    snout.matrix.translate(0, -0.5, -1);
    snout.render();

    nose.matrix.setIdentity();
    nose.matrix.set(snout.matrix);
    nose.matrix.scale(.5, .5, .5);
    nose.matrix.translate(0, .5, -.65);
    nose.render();


    leftEar.matrix.setIdentity();
    leftEar.matrix.set(head.matrix);
    leftEar.matrix.rotate(g_earAngle, 0, 0, 1);
    leftEar.matrix.scale(.33, .5, .33);
    leftEar.matrix.translate(-1, 1.125, 1);
    leftEar.render();

    rightEar.matrix.setIdentity();
    rightEar.matrix.set(head.matrix);
    rightEar.matrix.rotate(-g_earAngle, 0, 0, 1);
    rightEar.matrix.scale(.33, .5, .33);
    rightEar.matrix.translate(1, 1.125, 1);
    rightEar.render();

    leftIris.matrix.setIdentity();
    leftIris.matrix.set(head.matrix);
    leftIris.matrix.scale(.33, .2, .33);
    leftIris.matrix.translate(-1, .5, -1.5);
    leftIris.render();

    rightIris.matrix.setIdentity();
    rightIris.matrix.set(head.matrix);
    rightIris.matrix.scale(.33, .2, .33);
    rightIris.matrix.translate(1, 0.5, -1.5);
    rightIris.render();

    leftPupil.matrix.setIdentity();
    leftPupil.matrix.set(leftIris.matrix);
    leftPupil.matrix.scale(.5, 1, .5);
    leftPupil.matrix.translate(.5, 0, -1);
    leftPupil.render();

    rightPupil.matrix.setIdentity();
    rightPupil.matrix.set(rightIris.matrix);
    rightPupil.matrix.scale(.5, 1, .5);
    rightPupil.matrix.translate(-.5, 0, -1);
    rightPupil.render();

    flLeg.matrix.setIdentity();
    flLeg.matrix.set(body.matrix);
    flLeg.matrix.rotate(-g_legAngle, 1, 0, 0);
    flLeg.matrix.scale(.33, 1, .15);
    flLeg.matrix.translate(-.8, -.9, -1.5);
    flLeg.render();

    frLeg.matrix.setIdentity();
    frLeg.matrix.set(body.matrix);
    frLeg.matrix.rotate(g_legAngle, 1, 0, 0);
    frLeg.matrix.scale(.33, 1, .15);
    frLeg.matrix.translate(.8, -.9, -1.5);
    frLeg.render();

    blLeg.matrix.setIdentity();
    blLeg.matrix.set(body.matrix);
    blLeg.matrix.rotate(-g_legAngle, 1, 0, 0);
    blLeg.matrix.scale(.33, 1, .15);
    blLeg.matrix.translate(-.8, -.9, 2.5);
    blLeg.render();

    brLeg.matrix.setIdentity();
    brLeg.matrix.set(body.matrix);
    brLeg.matrix.rotate(g_legAngle, 1, 0, 0);
    brLeg.matrix.scale(.33, 1, .15);
    brLeg.matrix.translate(.8, -.9, 2.5);
    brLeg.render();

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