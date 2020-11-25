class Sphere {
    constructor(color_list = [1, 0, 0, 1]) {
        this.type = 'sphere';
        this.color = color_list;
        this.matrix = new Matrix4();
        this.textureNum = -2;
        this.prevColor = this.textureNum;
        this.verticies = this.generateVerticies(this.color);
    }

    render() {
        this.drawSphere(this.verticies, this.matrix, this.textureNum);
    }

    drawSphere(verticies, matrix, texNum) {

        if (sphereBuffer == null) {
            this.initSphereBuffer();
        }

        gl.bufferData(gl.ARRAY_BUFFER, verticies, gl.STATIC_DRAW);
        gl.uniform1i(u_whichTexture, texNum);
        gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

        gl.drawArrays(gl.TRIANGLES, 0, verticies.length / 12);
    }

    initSphereBuffer() {

        // Create a buffer object
        sphereBuffer = gl.createBuffer();
        if (!sphereBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }

        let FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT;
        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereBuffer);


        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 12 * FLOAT_SIZE, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 12 * FLOAT_SIZE, 3 * FLOAT_SIZE);
        gl.enableVertexAttribArray(a_UV);

        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 12 * FLOAT_SIZE, 5 * FLOAT_SIZE);
        gl.enableVertexAttribArray(a_Color);

        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 12 * FLOAT_SIZE, 9 * FLOAT_SIZE);
        gl.enableVertexAttribArray(a_Normal);
    }

    generateVerticies(color) {
        let vert = [];
        let d = Math.PI / 10;
        let dd = Math.PI / 10;
        for (let i = 0; i < Math.PI; i += d) {
            for (let j = 0; j < 2 * Math.PI; j += d) {
                let p1 = [Math.sin(i) * Math.cos(j), Math.sin(i) * Math.sin(j), Math.cos(i)];
                let p2 = [Math.sin(i + dd) * Math.cos(j), Math.sin(i + dd) * Math.sin(j), Math.cos(i + dd)];
                let p3 = [Math.sin(i) * Math.cos(j + dd), Math.sin(i) * Math.sin(j + dd), Math.cos(i)];
                let p4 = [Math.sin(i + dd) * Math.cos(j + dd), Math.sin(i + dd) * Math.sin(j + dd), Math.cos(i + dd)];
                let uv1 = [(i) / Math.PI, (j) / (2 * Math.PI)];
                let uv2 = [(i + dd) / Math.PI, (j) / (2 * Math.PI)];
                let uv3 = [(i) / Math.PI, (j + dd) / (2 * Math.PI)];
                let uv4 = [(i + dd) / Math.PI, (j + dd) / (2 * Math.PI)];

                vert = vert.concat(p1, uv1, color, p1);
                vert = vert.concat(p2, uv2, color, p2);
                vert = vert.concat(p4, uv4, color, p4);

                vert = vert.concat(p1, uv1, color, p1);
                vert = vert.concat(p4, uv4, color, p4);
                vert = vert.concat(p3, uv3, color, p3);
            }
        }

        // Break down of information per line
        // 0-2: XYZ
        // 3-4: UV
        // 5-8: RGBA
        return new Float32Array(vert);
    }

};
var sphereBuffer = null;