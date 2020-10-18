// DrawRectangle.js

var canvas;
var ctx;

function main() {
    // Retrieve <canvas> element <- (1)
    canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }
    // Get the rendering context for 2DCG <- (2)
    ctx = canvas.getContext('2d');
    resetCanvas(); // Clear canvas, set fill color to black, and fill background
}

function drawVector(v, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(200, 200);
    ctx.lineTo(200 + v.elements[0] * 20, 200 - v.elements[1] * 20);
    ctx.stroke();
}

function handleDrawEvent() {
    resetCanvas();

    let x1 = document.getElementById('x1-input').value;
    let y1 = document.getElementById('y1-input').value;
    let v1 = new Vector3([x1, y1, 0]);
    drawVector(v1, "red");

    let x2 = document.getElementById('x2-input').value;
    let y2 = document.getElementById('y2-input').value;
    let v2 = new Vector3([x2, y2, 0]);
    drawVector(v2, "blue");
}

function resetCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // set context to black
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function handleDrawOperationEvent() {
    resetCanvas();

    let x1 = document.getElementById('x1-input').value;
    let y1 = document.getElementById('y1-input').value;
    let v1 = new Vector3([x1, y1, 0]);
    drawVector(v1, "red");

    let x2 = document.getElementById('x2-input').value;
    let y2 = document.getElementById('y2-input').value;
    let v2 = new Vector3([x2, y2, 0]);
    drawVector(v2, "blue");

    let operation = document.getElementById('oper-id').value;
    let scal = document.getElementById('scalar-id').value;

    let v3 = new Vector3();
    let v4 = new Vector3();
    v3.set(v1);
    v4.set(v2);
    switch (operation) {
        case 'add':
            v3.add(v2);
            drawVector(v3, "green");
            break;

        case 'sub':
            v3.sub(v2);
            drawVector(v3, "green");
            break;

        case 'div':
            v3.div(scal);
            v4.div(scal);
            drawVector(v3, "green");
            drawVector(v4, "green");
            break;

        case 'mul':
            v3.mul(scal);
            v4.mul(scal);
            drawVector(v3, "green");
            drawVector(v4, "green");
            break;

        case 'mag':
            let m1 = v1.magnitude();
            let m2 = v2.magnitude();
            console.log("Magnitude v1:", m1);
            console.log("Magnitude v2:", m2);
            break;

        case 'norm':
            v3.normalize();
            v4.normalize();
            drawVector(v3, "green");
            drawVector(v4, "green");
            break;

        case 'ang':
            angleBetween(v1, v2);
            break;

        case 'area':
            areaTriangle(v1, v2);
            break;
        default:
            break;
    }

}

function angleBetween(v1, v2) {
    let d = Vector3.dot(v1, v2);
    let m1 = v1.magnitude();
    let m2 = v2.magnitude();

    let theta = Math.acos(d / (m1 * m2)) / (Math.PI / 180);

    console.log("Angle: ", theta);
}

function areaTriangle(v1, v2) {
    let cross = Vector3.cross(v1, v2);
    let mag = cross.magnitude();

    console.log("Area of the triangle: ", mag / 2);
}