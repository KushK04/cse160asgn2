class Sphere{
    constructor(r=0.12, s=20){
        this.radius = r;
        this.segments = s;
        this.color = [255/255,160/255,14/255,255/255];
        this.matrix = new Matrix4();
    }   

    polarToCart(rad, angle, phi){
        let one = rad * Math.sin(angle) * Math.cos(phi);
        let two = rad * Math.cos(angle);
        let three = rad * Math.sin(angle) * Math.sin(phi);

        return [one, two, three];
    }

    drawSphere(){
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        for(let x = 0; x < this.segments; x++){
            let ang1 = (x / this.segments) * Math.PI;
            let ang2 = ((x+1) / this.segments) * Math.PI;

            for (let y = 0; y < this.segments; y++){
                let p1 = (y / this.segments) * 2 * Math.PI;
                let p2 = ((y + 1) / this.segments) * 2 * Math.PI;

                let uno = this.polarToCart(this.radius, ang1, p1);
                let dos = this.polarToCart(this.radius, ang2, p1);
                let tres = this.polarToCart(this.radius, ang1, p2);
                let qua = this.polarToCart(this.radius, ang2, p2);

                drawTriangle3D([...uno, ...dos, ...tres]);
                drawTriangle3D([...dos, ...qua, ...tres]);
            }
        }
    }
}