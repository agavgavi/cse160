
class Cube {
    constructor(color_list = [1, 0, 0, 1]) {
        this.type = 'cube';
        this.color = color_list;
        this.matrix = new Matrix4();
        this.verticies = new Float32Array([
            -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5,
            -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5,
            -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5,
            -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
            -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5,
            -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5,
            0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5,
            0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5,
            -0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5,
            -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
            -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5,
            -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5
        ]);
        this.colorArray = makeArray(this.color);
    }

    render() {



        drawCube(this.verticies, this.matrix, this.colorArray);
    }

};

function drawCube(verticies, matrix, color) {

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, verticies, gl.STATIC_DRAW);
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, null);


    // Create a buffer object
    var colorBuffer = gl.createBuffer();
    if (!colorBuffer) {
        console.log('Failed to create the ColorBuffer object');
        return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, color, gl.STATIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);
    gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

    gl.drawArrays(gl.TRIANGLES, 0, verticies.length / 3);
}
function getColorArray(rgba, weight = 1) {
    return [
        rgba[0] * weight, rgba[1] * weight, rgba[2] * weight, rgba[3],
        rgba[0] * weight, rgba[1] * weight, rgba[2] * weight, rgba[3],
        rgba[0] * weight, rgba[1] * weight, rgba[2] * weight, rgba[3],
        rgba[0] * weight, rgba[1] * weight, rgba[2] * weight, rgba[3],
        rgba[0] * weight, rgba[1] * weight, rgba[2] * weight, rgba[3],
        rgba[0] * weight, rgba[1] * weight, rgba[2] * weight, rgba[3],
    ]
}


function makeArray(color) {
    var frontCol = getColorArray(color, 1);
    var backCol = getColorArray(color, 0.8);
    var leftCol = getColorArray(color, 0.9);
    var rightCol = getColorArray(color, 0.7);
    var topCol = getColorArray(color, 0.95);
    var bottomCol = getColorArray(color, 0.5);
    return new Float32Array(frontCol.concat(backCol, leftCol, rightCol, topCol, bottomCol));
}