class Cube{
    constructor(){
        this.type="cube";
        //this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        //this.size = 5.0;
        //this.segments = 10;
        this.matrix = new Matrix4();
        this.lighting = 1;
    }

    changeColor(){
        var rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0]*this.lighting, rgba[1]*this.lighting, rgba[2]*this.lighting, rgba[3]);
    }

    drawCube(){

        this.changeColor();
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        //Front

        drawTriangle3D( [0,0,0,  1,1,0,  1,0,0] );
        
        drawTriangle3D( [0,0,0,  0,1,0,  1,1,0] );


        //Top 

        this.lighting = 0.9;
        this.changeColor();

        drawTriangle3D( [0,1,0,  0,1,1,  1,1,1] );

        drawTriangle3D( [0,1,0,  1,1,1,  1,1,0] );    


        //Left 

        this.lighting = 0.8;
        this.changeColor();

        drawTriangle3D( [0,1,0,  0,0,1,  0,1,1] );
        drawTriangle3D( [0,1,0,  0,0,0,  0,0,1] );

        //Back

        this.lighting = 0.7;
        this.changeColor();         

        drawTriangle3D( [0,0,1,  1,1,1,  1,0,1] );
        
        drawTriangle3D( [0,0,1,  0,1,1,  1,1,1] );        

        //Bottom 

        this.lighting = 0.6;
        this.changeColor();

        drawTriangle3D( [0,0,0,  0,0,1,  1,0,1] );

        drawTriangle3D( [0,0,0,  1,0,1,  1,0,0] );   

        //Right 

        this.lighting = 0.5;
        this.changeColor();

        drawTriangle3D( [1,1,0,  1,0,1,  1,1,1] );
        drawTriangle3D( [1,1,0,  1,0,0,  1,0,1] );
    }
    
}