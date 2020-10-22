
var VSHADER_SOURCE = `
attribute vec4 a_Position;
uniform float u_PointSize;
void main() {
    gl_Position = a_Position;
    gl_PointSize = u_PointSize;
}`;

// Fragment shader program
var FSHADER_SOURCE = `
precision mediump float;
uniform vec4 u_FragColor;
void main() {
    gl_FragColor = u_FragColor;
}`;

let types = {
    POINT: 0,
    TRIANGLE: 1,
    CIRCLE: 2
};
// All Global Variables Here
let canvas;         // The canvas where things are being drawn
let gl;             // The WebGL variable used to control the page
let a_Position;     // A GLSL variable used to store the location of the point drawn
let u_FragColor;    // A GLSL shader variable to store the color of the point being drawn.
let u_PointSize;    // A GLSL uniform shader variable that allows the size to change.

var g_ShapesList = []; // A list of all shapes currently to be displayed

var gl_currentColor = [1.0, 0.0, 0.0, 1.0];
var gl_currentSize = 10;
var gl_currentType = types.POINT;
var gl_currentSegments = 10;

function main() {

    // Create canvas and setup WebGL
    setUpCanvas();

    // Initialize Shaders for WEBGL
    initAllShaders();

    // Register function (event handler) to be called on a mouse press
    setUpAllEvents();

    // Set cursor and type of object to a point
    setType(types.POINT);

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // // Clear <canvas>
    renderAllShapes();
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

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Get the storage location of u_FragColor
    u_PointSize = gl.getUniformLocation(gl.program, 'u_PointSize');
    if (!u_PointSize) {
        console.log('Failed to get the storage location of u_PointSize');
        return;
    }
}

// All UI actions will be connected here.
function setUpAllEvents() {
    // Set up all canvas attributes
    canvas.onmousedown = click;
    canvas.onmousemove = function (ev) { if (ev.buttons == 1) { click(ev); } };

    // Set up all Color slider functions
    document.getElementById('rSlider').addEventListener("mouseup", function () { updateColorPicker(); });
    document.getElementById('gSlider').addEventListener("mouseup", function () { updateColorPicker(); });
    document.getElementById('bSlider').addEventListener("mouseup", function () { updateColorPicker(); });
    document.getElementById('color-picker').addEventListener("change", syncColors, false);


    // Set up the remaining slider functions
    document.getElementById('sizeSlider').addEventListener('mouseup', function () { gl_currentSize = this.value; });
    document.getElementById('segSlider').addEventListener('mouseup', function () { gl_currentSegments = this.value; });

    // Set up all Buttons
    document.getElementById('clearButt').addEventListener('mouseup', function () { g_ShapesList = []; renderAllShapes(); });
    document.getElementById('selPoint').addEventListener('mouseup', function () { setType(types.POINT); });
    document.getElementById('selTriangle').addEventListener('mouseup', function () { setType(types.TRIANGLE); });
    document.getElementById('selCircle').addEventListener('mouseup', function () { setType(types.CIRCLE); });
}

// Syncronize the colors between the input type=color and the sliders when COLOR-PICKER is updated
function syncColors(ev) {
    let color = HexToRGB(ev.target.value);
    document.getElementById('rSlider').value = color.r;
    document.getElementById('gSlider').value = color.g;
    document.getElementById('bSlider').value = color.b;
    gl_currentColor = [color.r / 255, color.g / 255, color.b / 255, 1.0];
}

// Syncronize the colors between the input type=color and the sliders when SLIDERS are updated
function updateColorPicker() {
    let r = document.getElementById('rSlider').valueAsNumber;
    let g = document.getElementById('gSlider').valueAsNumber;
    let b = document.getElementById('bSlider').valueAsNumber;
    color = rgbToHex(r, g, b);
    document.getElementById('color-picker').value = color;
    gl_currentColor = [r / 255, g / 255, b / 255, 1.0];
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

// Sets the current type, updates color of current type button
// Also sets cursor's icon
function setType(type) {
    gl_currentType = type;
    switch (type) {
        case (types.TRIANGLE):
            document.getElementById('selTriangle').classList.add('is-success');
            document.getElementById('selPoint').classList.remove('is-success');
            document.getElementById('selCircle').classList.remove('is-success');
            break;
        case (types.CIRCLE):
            document.getElementById('selCircle').classList.add('is-success');
            document.getElementById('selPoint').classList.remove('is-success');
            document.getElementById('selTriangle').classList.remove('is-success');
            break;
        case (types.POINT):
        default:
            document.getElementById('selPoint').classList.add('is-success');
            document.getElementById('selTriangle').classList.remove('is-success');
            document.getElementById('selCircle').classList.remove('is-success');
            break;
    }

}

// On a mouse click it will convert the cords to WebGl version
// Add a new object to the list depending on type
// And render all shapes
function click(ev) {
    let point = coordsToWebGL(ev);

    let object;
    switch (gl_currentType) {
        case (types.TRIANGLE):
            object = new Triangle();
            object.pos = point;
            object.color = gl_currentColor.slice();
            object.size = gl_currentSize;
            break;
        case (types.CIRCLE):
            object = new Circle(gl_currentSegments);
            object.pos = point;
            object.color = gl_currentColor.slice();
            object.size = gl_currentSize;
            break;
        case (types.POINT):
        default:
            object = new Point();
            object.pos = point;
            object.color = gl_currentColor.slice();
            object.size = gl_currentSize;
            break;
    }
    g_ShapesList.push(object);

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

// Goes through the global lists and renders all points on the page
function renderAllShapes() {
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // var len = g_ShapesList.length;
    // for (var i = 0; i < len; i++) {
    //     g_ShapesList[i].render();
    // }

    var body = new Cube();
    body.color = [1.0,0.0,0.0,1.0];
    body.render();
}