class Star{
    constructor(){
        this.type="circle";
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
    }

    render(){
        const xy = this.position;
        const rgba = this.color;
        const s = this.size;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniform1f(u_Size, s);

        let starVertices = [];
        starVertices.push(xy[0], xy[1]);

        for (let i = 0; i <= 10; i++) {
            const radius1 = s / 200;
            const radius2 = (s / 200) / 2;
            if (i % 2 == 0){
                starVertices.push(xy[0] + radius1 * Math.cos((i * Math.PI) / 5), xy[1] + radius1 * Math.sin((i * Math.PI) / 5));

            } else {
                starVertices.push(xy[0] + radius2 * Math.cos((i * Math.PI) / 5), xy[1] + radius2 * Math.sin((i * Math.PI) / 5));

            }
        }

        let vertexBuffer = gl.createBuffer();
        if (!vertexBuffer) {
            console.log("Failed to create the buffer object");
            return -1;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(starVertices), gl.DYNAMIC_DRAW);
//   var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
//   if (a_Position < 0){
//       console.log("Failed to get the storage location of a_Position");
//       return -1;
//   }
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, starVertices.length / 2);
    }
}