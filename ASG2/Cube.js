
class Cube {
    constructor() {
        this.type = 'circle';
        // this.pos = [0, 0, 0];
        this.color = [1, 0, 0, 1];
        // this.size = 10;
        // this.segments = segments;
        this.matrix = new Matrix4();
    }

    render() {
        // var xy = this.pos;
        // var size = this.size;
        var rgba = this.color;
        var arr = [0, 0, 0, 1, 1, 0, 1, 0, 0,
            0, 0, 0, 0, 1, 0, 1, 1, 0,
            0, 0, 1, 1, 1, 1, 1, 0, 1,
            0, 0, 1, 0, 1, 1, 1, 1, 1,
            0, 0, 0, 0, 1, 1, 0, 0, 1,
            0, 0, 0, 0, 1, 0, 0, 1, 1,
            1, 0, 0, 1, 1, 1, 1, 0, 1,
            1, 0, 0, 1, 1, 0, 1, 1, 1,
            0, 1, 0, 1, 1, 1, 1, 1, 0,
            0, 1, 0, 0, 1, 1, 1, 1, 1,
            0, 0, 0, 1, 0, 1, 1, 0, 0,
            0, 0, 0, 0, 0, 1, 1, 0, 1,];
        //console.log(arr);
        // Pass the size to GLSL
        // gl.uniform4f(u_PointSize, size);



        // // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // // Draw


        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        // // FRONT -----------------------------------------------------
        drawCube(arr);
        // drawTriangle3D([0, 0, 0, 1, 1, 0, 1, 0, 0]);
        // drawTriangle3D([0, 0, 0, 0, 1, 0, 1, 1, 0]);

        // gl.uniform4f(u_FragColor, rgba[0] * .7, rgba[1] * .7, rgba[2] * .7, rgba[3]);
        // // BACK -----------------------------------------------------
        // drawTriangle3D([0, 0, 1, 1, 1, 1, 1, 0, 1]);
        // drawTriangle3D([0, 0, 1, 0, 1, 1, 1, 1, 1]);

        // gl.uniform4f(u_FragColor, rgba[0] * .8, rgba[1] * .8, rgba[2] * .8, rgba[3]);
        // // LEFT -----------------------------------------------------
        // drawTriangle3D([0, 0, 0, 0, 1, 1, 0, 0, 1]);
        // drawTriangle3D([0, 0, 0, 0, 1, 0, 0, 1, 1]);

        // // RIGHT -----------------------------------------------------
        // drawTriangle3D([1, 0, 0, 1, 1, 1, 1, 0, 1]);
        // drawTriangle3D([1, 0, 0, 1, 1, 0, 1, 1, 1]);

        // gl.uniform4f(u_FragColor, rgba[0] * .9, rgba[1] * .9, rgba[2] * .9, rgba[3]);
        // // UP -----------------------------------------------------
        // drawTriangle3D([0, 1, 0, 1, 1, 1, 1, 1, 0]);
        // drawTriangle3D([0, 1, 0, 0, 1, 1, 1, 1, 1]);

        // // DOWN -----------------------------------------------------
        // drawTriangle3D([0, 0, 0, 1, 0, 1, 1, 0, 0]);
        // drawTriangle3D([0, 0, 0, 0, 0, 1, 1, 0, 1]);
    }
};

function drawCube(vertices) {
    var n = 36; // The number of vertices

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n);
}