
class Point {
    constructor() {
        this.type = 'point';
        this.pos = [0.0, 0.0, 0.0];
        this.color = [1.0, 0, 0, 1.0];
        this.size = 10.0;
    }

    render() {
        var xy = this.pos;
        var size = this.size;
        var rgba = this.color;

        // Pass the position of a point to a_Position variable

        gl.disableVertexAttribArray(a_Position);
        gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);

        // Pass the size to GLSL
        gl.uniform1f(u_PointSize, size);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // Draw
        gl.drawArrays(gl.POINTS, 0, 1);
    }
};