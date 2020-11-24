class OldSphere {
    constructor(size, color_list = [1, 0, 0, 1]) {
        this.type = 'sphere';
        this.color = color_list;
        this.matrix = new Matrix4();
        this.textureNum = -2;
        this.cart_points = this.generatePoints(size);
        this.verticies = this.generateVerticies(this.color, this.cart_points);
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

        gl.drawArrays(gl.TRIANGLES, 0, verticies.length / 9);
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


        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 9 * FLOAT_SIZE, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 9 * FLOAT_SIZE, 3 * FLOAT_SIZE);
        gl.enableVertexAttribArray(a_UV);

        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 9 * FLOAT_SIZE, 5 * FLOAT_SIZE);
        gl.enableVertexAttribArray(a_Color);
    }

    generatePoints(size) {
        let cart_points = new Array(size);
        for (let i = 0; i <= size; ++i) {
            let lat = Math.PI * i / size;
            cart_points[i] = new Array(size);

            for (let j = 0; j <= size; ++j) {
                let long = 2 * Math.PI * j / size;
                cart_points[i][j] = this.sphere2cart(lat, long);
            }
        }
        return cart_points;
    }

    sphere2cart(lat, long) {
        let x = Math.sin(lat) * Math.cos(long);
        let y = Math.sin(lat) * Math.sin(long);
        let z = Math.cos(lat);

        return [x, y, z];
    }

    generateVerticies(color, points) {
        console.log(points);
        let vert = [];
        for (let i = 0; i < points.length - 1; ++i) {
            for (let j = 0; j < points.length - 1; ++j) {
                vert = vert.concat(points[i][j], [0, 0], color);

                vert = vert.concat(points[i][j + 1], [0, 0], color);

                vert = vert.concat(points[i + 1][j], [0, 0], color);

                vert = vert.concat(points[i][j + 1], [0, 0], color);

                vert = vert.concat(points[i + 1][j + 1], [0, 0], color);

                vert = vert.concat(points[i + 1][j], [0, 0], color);
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