
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
let g_globalAngleY = 45;
let g_globalAngleZ = 0;
let g_headAngle = 0;
let g_tailAngle = 0;
let g_earAngle = 0;
let g_legAngle = 0;

let doAnimation = false;
let isAngry = false;

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
    if (a_Color < 0) {
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

    document.getElementById('setAnger').onclick = function () { isAngry = !isAngry; this.classList.toggle('is-danger'); renderAllShapes(); };

    document.getElementById('resetCam').onclick = resetCam;

    document.getElementById('resetAnim').onclick = resetAnimation;
}

function resetCam() {
    g_globalAngleX = 0;
    g_globalAngleY = 45;
    g_globalAngleZ = 0;

    document.getElementById('XangleSlide').value = 0;

    document.getElementById('YangleSlide').value = 45;

    document.getElementById('ZangleSlide').value = 0;

    renderAllShapes();
}

function resetAnimation() {
    g_headAngle = 0;
    g_tailAngle = 0;
    g_earAngle = 0;
    g_legAngle = 0;

    document.getElementById('headSlide').value = 0;

    document.getElementById('tailSide').value = 0;

    document.getElementById('earSlide').value = 0;

    g_ShapesList.length = 0;
    setupCubes();
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
        g_tailAngle = (10 * Math.sin(g_seconds * 3));
        g_earAngle = (7 * Math.cos(g_seconds));
        g_legAngle = (12 * Math.sin(g_seconds)) + 2;
    }
}


function setupCubes() {
    var globalRotMat = new Matrix4();
    var body = new Cube(rgbaList(190, 187, 187));
    var tail = new Cube(rgbaList(199, 196, 197));
    var mane = new Cube(rgbaList(173, 167, 164));
    var head = new Cube(rgbaList(140, 137, 137));
    var mouth = new Cube(rgbaList(121, 103, 91));
    var snout = new Cube(rgbaList(146, 121, 102));
    var nose = new Cube(rgbaList(13, 14, 16));
    var jaw = new Cube(rgbaList(13, 14, 16));
    var leftEar = new Cube(rgbaList(160, 158, 158));
    var rightEar = new Cube(rgbaList(160, 158, 158));
    var leftIris = new Cube(rgbaList(184, 184, 184));
    var rightIris = new Cube(rgbaList(184, 184, 184));
    var leftPupil = new Cube(rgbaList(13, 14, 16));
    var rightPupil = new Cube(rgbaList(13, 14, 16));
    var flLeg = new Cube(rgbaList(146, 144, 145));
    var frLeg = new Cube(rgbaList(146, 144, 145));
    var blLeg = new Cube(rgbaList(146, 144, 145));
    var brLeg = new Cube(rgbaList(146, 144, 145));
    var boneMid = new Cube(rgbaList(227, 227, 227));
    var boneLT = new Cube(rgbaList(227, 227, 227));
    var boneLB = new Cube(rgbaList(227, 227, 227));
    var boneRT = new Cube(rgbaList(227, 227, 227));
    var boneRB = new Cube(rgbaList(227, 227, 227));
    var earFloofL = new Cube(rgbaList(13, 14, 16));
    var earFloofR = new Cube(rgbaList(13, 14, 16));
    var eyebrowL = new Cube(rgbaList(13, 14, 16));
    var eyebrowR = new Cube(rgbaList(13, 14, 16));

    var flToe1 = new Cube(rgbaList(86, 82, 78));
    var flToe2 = new Cube(rgbaList(199, 196, 193));
    var flToe3 = new Cube(rgbaList(86, 82, 78));
    var frToe1 = new Cube(rgbaList(86, 82, 78));
    var frToe2 = new Cube(rgbaList(199, 196, 193));
    var frToe3 = new Cube(rgbaList(86, 82, 78));
    var blToe1 = new Cube(rgbaList(86, 82, 78));
    var blToe2 = new Cube(rgbaList(199, 196, 193));
    var blToe3 = new Cube(rgbaList(86, 82, 78));
    var brToe1 = new Cube(rgbaList(86, 82, 78));
    var brToe2 = new Cube(rgbaList(199, 196, 193));
    var brToe3 = new Cube(rgbaList(86, 82, 78));

    var flFoot = new Cube(rgbaList(130, 125, 128));
    var frFoot = new Cube(rgbaList(130, 125, 128));
    var blFoot = new Cube(rgbaList(130, 125, 128));
    var brFoot = new Cube(rgbaList(130, 125, 128));

    g_ShapesList.push(globalRotMat,
        body, tail, mane, head, mouth,
        snout, nose, jaw, leftEar, rightEar,
        leftIris, rightIris, leftPupil, rightPupil,
        flLeg, frLeg, blLeg, brLeg, boneMid, boneLT, boneLB, boneRT, boneRB, earFloofL, earFloofR, eyebrowL, eyebrowR, flToe1, flToe2, flToe3, frToe1, frToe2, frToe3, blToe1, blToe2, blToe3, brToe1, brToe2, brToe3, flFoot, frFoot, blFoot, brFoot);
}
// Goes through the global lists and renders all points on the page
function renderAllShapes() {

    // Clear <canvas>
    let globalRotMat = g_ShapesList[0];
    globalRotMat.setIdentity();
    globalRotMat.rotate(g_globalAngleX, 1, 0, 0);
    globalRotMat.rotate(g_globalAngleY, 0, 1, 0);
    globalRotMat.rotate(g_globalAngleZ, 0, 0, 1);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var i = 1;
    let body = g_ShapesList[i++];
    let tail = g_ShapesList[i++];
    let mane = g_ShapesList[i++];
    let head = g_ShapesList[i++];
    let mouth = g_ShapesList[i++];
    let snout = g_ShapesList[i++];
    let nose = g_ShapesList[i++];
    let jaw = g_ShapesList[i++];
    let leftEar = g_ShapesList[i++];
    let rightEar = g_ShapesList[i++];
    let leftIris = g_ShapesList[i++];
    let rightIris = g_ShapesList[i++];
    let leftPupil = g_ShapesList[i++];
    let rightPupil = g_ShapesList[i++];
    let flLeg = g_ShapesList[i++];
    let frLeg = g_ShapesList[i++];
    let blLeg = g_ShapesList[i++];
    let brLeg = g_ShapesList[i++];
    let boneMid = g_ShapesList[i++];
    let boneLT = g_ShapesList[i++];
    let boneLB = g_ShapesList[i++];
    let boneRT = g_ShapesList[i++];
    let boneRB = g_ShapesList[i++];
    let earFloofL = g_ShapesList[i++];
    let earFloofR = g_ShapesList[i++];
    let eyebrowL = g_ShapesList[i++];
    let eyebrowR = g_ShapesList[i++];

    let flToe1 = g_ShapesList[i++];
    let flToe2 = g_ShapesList[i++];
    let flToe3 = g_ShapesList[i++];
    let frToe1 = g_ShapesList[i++];
    let frToe2 = g_ShapesList[i++];
    let frToe3 = g_ShapesList[i++];
    let blToe1 = g_ShapesList[i++];
    let blToe2 = g_ShapesList[i++];
    let blToe3 = g_ShapesList[i++];
    let brToe1 = g_ShapesList[i++];
    let brToe2 = g_ShapesList[i++];
    let brToe3 = g_ShapesList[i++];

    let flFoot = g_ShapesList[i++];
    let frFoot = g_ShapesList[i++];
    let blFoot = g_ShapesList[i++];
    let brFoot = g_ShapesList[i++];


    body.matrix.setIdentity();
    body.matrix.scale(.4, .4, .8);
    body.render();

    tail.matrix.setIdentity();
    tail.matrix.rotate(-10, 1, 0, 0);
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

    mouth.matrix.setIdentity();
    mouth.matrix.set(head.matrix);
    mouth.matrix.scale(1.021, .5001, 1);
    mouth.matrix.translate(0, -.5005, -0.002);
    mouth.render();

    snout.matrix.setIdentity();
    snout.matrix.set(head.matrix);
    snout.matrix.scale(.5001, .5001, 1);
    snout.matrix.translate(0, -0.5005, -1.0002);
    snout.render();

    nose.matrix.setIdentity();
    nose.matrix.set(snout.matrix);
    nose.matrix.scale(.5001, .5001, .5001);
    nose.matrix.translate(0, .52, -.65);
    nose.render();

    jaw.matrix.setIdentity();
    jaw.matrix.set(snout.matrix);
    jaw.matrix.scale(1.003, .3001, 1.003);
    jaw.matrix.translate(0, -1.005, 0);
    jaw.render();


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

    earFloofL.matrix.setIdentity();
    earFloofL.matrix.set(leftEar.matrix);
    earFloofL.matrix.scale(.33, .5, .33);
    earFloofL.matrix.translate(0, 0, -1.5);
    earFloofL.render();

    earFloofR.matrix.setIdentity();
    earFloofR.matrix.set(rightEar.matrix);
    earFloofR.matrix.scale(.33, .5, .33);
    earFloofR.matrix.translate(0, 0, -1.5);
    earFloofR.render();

    toggleAnger(leftPupil, leftIris, rightPupil, rightIris);

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

    eyebrowL.matrix.setIdentity();
    eyebrowL.matrix.set(leftIris.matrix);
    eyebrowL.matrix.translate(0, 1.02, -.5);
    eyebrowL.matrix.rotate(-20, 0, 0, 1);
    eyebrowL.matrix.scale(1, .8, .33);

    eyebrowR.matrix.setIdentity();
    eyebrowR.matrix.set(rightIris.matrix);
    eyebrowR.matrix.translate(0, 1.02, -.5);
    eyebrowR.matrix.rotate(20, 0, 0, 1);
    eyebrowR.matrix.scale(1, .8, .33);

    leftPupil.matrix.setIdentity();
    leftPupil.matrix.set(leftIris.matrix);
    leftPupil.matrix.scale(.503, 1.003, .503);
    leftPupil.matrix.translate(.5, 0, -1);
    leftPupil.render();

    rightPupil.matrix.setIdentity();
    rightPupil.matrix.set(rightIris.matrix);
    rightPupil.matrix.scale(.503, 1.003, .503);
    rightPupil.matrix.translate(-.5, 0, -1);
    rightPupil.render();

    flLeg.matrix.setIdentity();
    flLeg.matrix.set(body.matrix);
    flLeg.matrix.rotate(-g_legAngle, 1, 0, 0);
    flLeg.matrix.scale(.33, 1, .15);
    flLeg.matrix.translate(-.8, -.9, -1.5);
    flLeg.render();

    flFoot.matrix.setIdentity();
    flFoot.matrix.set(flLeg.matrix);
    flFoot.matrix.scale(1.01, .15, 1.4);
    flFoot.matrix.translate(0, -3.25, -0.1);
    flFoot.render();

    flToe1.matrix.setIdentity();
    flToe1.matrix.set(flFoot.matrix);
    flToe1.matrix.scale(.33, .8, .33);
    flToe1.matrix.translate(-1, -0.2, -1.9);
    flToe1.render();

    flToe2.matrix.setIdentity();
    flToe2.matrix.set(flFoot.matrix);
    flToe2.matrix.scale(.33, .8, .33);
    flToe2.matrix.translate(0, -0.2, -1.7);
    flToe2.render();

    flToe3.matrix.setIdentity();
    flToe3.matrix.set(flFoot.matrix);
    flToe3.matrix.scale(.33, .8, .33);
    flToe3.matrix.translate(1, -0.2, -1.9);
    flToe3.render();

    frLeg.matrix.setIdentity();
    frLeg.matrix.set(body.matrix);
    frLeg.matrix.rotate(g_legAngle, 1, 0, 0);
    frLeg.matrix.scale(.33, 1, .15);
    frLeg.matrix.translate(.8, -.9, -1.5);
    frLeg.render();

    frFoot.matrix.setIdentity();
    frFoot.matrix.set(frLeg.matrix);
    frFoot.matrix.scale(1.01, .15, 1.4);
    frFoot.matrix.translate(0, -3.25, -0.1);
    frFoot.render();

    frToe1.matrix.setIdentity();
    frToe1.matrix.set(frFoot.matrix);
    frToe1.matrix.scale(.33, .8, .33);
    frToe1.matrix.translate(-1, -0.2, -1.9);
    frToe1.render();

    frToe2.matrix.setIdentity();
    frToe2.matrix.set(frFoot.matrix);
    frToe2.matrix.scale(.33, .8, .33);
    frToe2.matrix.translate(0, -0.2, -1.7);
    frToe2.render();

    frToe3.matrix.setIdentity();
    frToe3.matrix.set(frFoot.matrix);
    frToe3.matrix.scale(.33, .8, .33);
    frToe3.matrix.translate(1, -0.2, -1.9);
    frToe3.render();

    blLeg.matrix.setIdentity();
    blLeg.matrix.set(body.matrix);
    blLeg.matrix.rotate(-g_legAngle, 1, 0, 0);
    blLeg.matrix.scale(.33, 1, .15);
    blLeg.matrix.translate(-.8, -.9, 2.5);
    blLeg.render();

    blFoot.matrix.setIdentity();
    blFoot.matrix.set(blLeg.matrix);
    blFoot.matrix.scale(1.01, .15, 1.4);
    blFoot.matrix.translate(0, -3.25, -0.1);
    blFoot.render();

    blToe1.matrix.setIdentity();
    blToe1.matrix.set(blFoot.matrix);
    blToe1.matrix.scale(.33, .8, .33);
    blToe1.matrix.translate(-1, -0.2, -1.9);
    blToe1.render();

    blToe2.matrix.setIdentity();
    blToe2.matrix.set(blFoot.matrix);
    blToe2.matrix.scale(.33, .8, .33);
    blToe2.matrix.translate(0, -0.2, -1.7);
    blToe2.render();

    blToe3.matrix.setIdentity();
    blToe3.matrix.set(blFoot.matrix);
    blToe3.matrix.scale(.33, .8, .33);
    blToe3.matrix.translate(1, -0.2, -1.9);
    blToe3.render();

    brLeg.matrix.setIdentity();
    brLeg.matrix.set(body.matrix);
    brLeg.matrix.rotate(g_legAngle, 1, 0, 0);
    brLeg.matrix.scale(.33, 1, .15);
    brLeg.matrix.translate(.8, -.9, 2.5);
    brLeg.render();

    brFoot.matrix.setIdentity();
    brFoot.matrix.set(brLeg.matrix);
    brFoot.matrix.scale(1.01, .15, 1.4);
    brFoot.matrix.translate(0, -3.25, -0.1);
    brFoot.render();

    brToe1.matrix.setIdentity();
    brToe1.matrix.set(brFoot.matrix);
    brToe1.matrix.scale(.33, .8, .33);
    brToe1.matrix.translate(-1, -0.2, -1.9);
    brToe1.render();

    brToe2.matrix.setIdentity();
    brToe2.matrix.set(brFoot.matrix);
    brToe2.matrix.scale(.33, .8, .33);
    brToe2.matrix.translate(0, -0.2, -1.7);
    brToe2.render();

    brToe3.matrix.setIdentity();
    brToe3.matrix.set(brFoot.matrix);
    brToe3.matrix.scale(.33, .8, .33);
    brToe3.matrix.translate(1, -0.2, -1.9);
    brToe3.render();

    boneMid.matrix.setIdentity();
    boneMid.matrix.set(jaw.matrix);
    boneMid.matrix.scale(1.5, .5, .5);
    boneMid.matrix.translate(0, -.1, -.7);


    boneLT.matrix.setIdentity();
    boneLT.matrix.set(boneMid.matrix);
    boneLT.matrix.scale(.25, 1.75, .5);
    boneLT.matrix.translate(-1.75, -.1, -.7);
    boneLT.matrix.rotate(-30, 0, 1, 0);


    boneLB.matrix.setIdentity();
    boneLB.matrix.set(boneMid.matrix);
    boneLB.matrix.scale(.25, 1.75, .5);
    boneLB.matrix.translate(-1.75, -.1, .7);
    boneLB.matrix.rotate(30, 0, 1, 0);


    boneRT.matrix.setIdentity();
    boneRT.matrix.set(boneMid.matrix);
    boneRT.matrix.scale(.25, 1.75, .5);
    boneRT.matrix.translate(1.75, -.1, -.7);
    boneRT.matrix.rotate(30, 0, 1, 0);


    boneRB.matrix.setIdentity();
    boneRB.matrix.set(boneMid.matrix);
    boneRB.matrix.scale(.25, 1.75, .5);
    boneRB.matrix.translate(1.75, -.1, .7);
    boneRB.matrix.rotate(-30, 0, 1, 0);

    if (!isAngry) {
        boneMid.render();
        boneLT.render();
        boneLB.render();
        boneRT.render();
        boneRB.render();
    }
    else {
        eyebrowL.render();
        eyebrowR.render();
    }
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

function toggleAnger(leftPupil, leftIris, rightPupil, rightIris) {
    if (isAngry == false) {
        if (leftPupil.color != rgbaList(13, 14, 16)) {
            leftPupil.color = rgbaList(13, 14, 16);
            leftPupil.colorArray = makeArray(leftPupil.color);
        }
        if (leftIris.color != rgbaList(184, 184, 184)) {
            leftIris.color = rgbaList(184, 184, 184);
            leftIris.colorArray = makeArray(leftIris.color);
        }
        if (rightPupil.color != rgbaList(13, 14, 16)) {
            rightPupil.color = rgbaList(13, 14, 16);
            rightPupil.colorArray = makeArray(rightPupil.color);
        }
        if (rightIris.color != rgbaList(184, 184, 184)) {
            rightIris.color = rgbaList(184, 184, 184);
            rightIris.colorArray = makeArray(rightIris.color);
        }
    } else {
        if (leftPupil.color != rgbaList(228, 46, 46)) {
            leftPupil.color = rgbaList(228, 46, 46);
            leftPupil.colorArray = makeArray(leftPupil.color);
        }
        if (leftIris.color != rgbaList(150, 11, 11)) {
            leftIris.color = rgbaList(150, 11, 11);
            leftIris.colorArray = makeArray(leftIris.color);
        }
        if (rightPupil.color != rgbaList(228, 46, 46)) {
            rightPupil.color = rgbaList(228, 46, 46);
            rightPupil.colorArray = makeArray(rightPupil.color);
        }
        if (rightIris.color != rgbaList(150, 11, 11)) {
            rightIris.color = rgbaList(150, 11, 11);
            rightIris.colorArray = makeArray(rightIris.color);
        }
    }

}

function rgbaList(r, g, b, a = 1) {
    return [r / 255, g / 255, b / 255, a]
}