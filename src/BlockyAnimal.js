// HelloPoint1.js
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_Size;\n' + 
  'uniform mat4 u_ModelMatrix;' + 
  'uniform mat4 u_GlobalRotateMatrix;' +
  'void main() {\n' +
  '  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
  '  gl_PointSize = u_Size;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

function tohtml(s, hid){
    var elm = document.getElementById(hid);
    if (!elm){
        console.log("Failed to get " + hid + " from HTML");
        return;
    }
    elm.innerHTML = s;
}

function tohtmlval(s, hid){
  var elm = document.getElementById(hid);
  if (!elm){
      console.log("Failed to get " + hid + " from HTML");
      return;
  }
  elm.value = s;
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const STARS = 3;

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_segmentCount = 10;
let g_camAngle = 0;
let g_camAngle2 = 0;
let g_leftArmRotate = 0;
let g_rightArmRotate = 0;
let g_headRotate = 0;
let g_walkLeftTranslate = 0;
let g_walkRightTranslate = 0;
let g_waveLeftAnimation = false;
let g_waveRightAnimation = false;
let g_walkAnimation = false;
let g_wagAnimation = false;
let g_nodAnimation = false;
let g_shiftClick = false;
let g_mouseClick = false;
let g_tail1Rotate = 0;
let g_tail2Rotate = 0;
let g_tail3Rotate = 0;
let g_eyeTranslate = 0.01;
//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = [];
var g_shapesList = [];

let colors = {
  body: [229/255,136/255,58/255,255/255], 
  belly: [237/255,225/255,151/255,255/255],
  arm: [255/255,170/255,88/255,255/255],
  eye: [14/255,68/255,106/255,255/255],
  tongue: [219/255,130/255,157/255,255/255],
  tail: [198/255,88/255,12/255,255/255],
  lid: [249/255,136/255,58/255,255/255],
  nostril: [207/255,77/255,19/255,255/255],
}

function setupWebGL(){
    canvas = document.getElementById('webgl');
   //gl = getWebGLContext(canvas);
   gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    if (!gl){
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
  // Initialize shaders
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

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }     

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }    

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }  

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }  
}

function convertCoordinatesEventToGL(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
  
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    
    return ([x,y]);
}

function updateAnimationAngles(){
  if (g_waveLeftAnimation){
    g_leftArmRotate = (45 * Math.sin(g_seconds*2) - 45);
  }

  if (g_waveRightAnimation){
    g_rightArmRotate = (45 * Math.sin(g_seconds*2) - 45);
  }

  if (g_nodAnimation){
    g_headRotate = (12.5 * Math.sin(g_seconds*2) - 2.5);
  }

  if (g_walkAnimation){
    g_walkLeftTranslate = (0.2 * Math.sin(g_seconds*2) + 0.2);
    g_walkRightTranslate = (-0.2 * Math.sin(g_seconds*2) + 0.2);
  }

  if (g_wagAnimation){
    g_tail1Rotate = (15 * Math.sin(g_seconds*4));
  }

  if (g_shiftClick && g_mouseClick){
    g_eyeTranslate = (0.065 * Math.sin(g_seconds*2) - 0.055);  
  } else {
    g_eyeTranslate = 0.01
  }
}

function renderScene(){
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    let ST = performance.now();

    //var len = g_points.length;
    //var len = g_shapesList.length;

    //for(var i = 0; i < len; i++) {
    //    g_shapesList[i].render();
    //}


    //changeColor([0.4,0.4,0.4]);
    //drawTriangle3D([-1.0, 0.0, 0.0, -0.5, -1.0, 0.0, 0.0, 0.0, 0.0]);

    var globalRotMat = new Matrix4().rotate(g_camAngle, 0, 1, 0);
    globalRotMat.rotate(g_camAngle2, 1, 0, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
//
    //var body = new Cube();
    //body.color = [1.0, 0.0, 0.0, 1.0];
    //body.matrix.translate(0.4, -0.8, 0);
    //body.matrix.rotate(90, 0, 0, 1);
    //body.matrix.scale(0.4, 0.8, 0.5);
    //body.drawCube();
//
    //var leftArm = new Cube();
    //leftArm.color = [1.0, 1.0, 0.0, 1.0];
    //leftArm.matrix.translate(-0.15, -0.6, 0.05);
    //leftArm.matrix.rotate(-g_yellowRotate, 0, 0, 1);
//
    ////if (g_yellowAnimation){
    ////  leftArm.matrix.rotate(45 * Math.sin(g_seconds), 0, 0, 1);
    ////} else {
    ////  leftArm.matrix.rotate(-g_yellowRotate, 0, 0, 1);
    ////}
    //var yellCordMat = new Matrix4(leftArm.matrix);
    //leftArm.matrix.scale(0.25, 0.7, 0.35);
    //leftArm.drawCube();
//
    //var box = new Cube();
    //box.color = [1, 0, 1, 1];
    //box.matrix = yellCordMat;
    //box.matrix.translate(0, 0.7, 0, 1);
    //box.matrix.rotate(g_magentaRotate, 0, 0, 1);
    //box.matrix.scale(0.2, 0.2, 0.2  );
    //box.drawCube();

    var body = new Cube();
    body.color = colors.body;
    body.matrix.translate(-0.25, -0.6, -0.5);
    body.matrix.rotate(0, 0, 0, 1);
    var bodyToBelly = new Matrix4(body.matrix);
    var bodyToHead = new Matrix4(body.matrix);
    var bodytoLArm = new Matrix4(body.matrix);
    var bodytoRArm = new Matrix4(body.matrix);
    var bodytoLLeg = new Matrix4(body.matrix);
    var bodytoRLeg = new Matrix4(body.matrix);
    var bodyToTail1 = new Matrix4(body.matrix);
    body.matrix.scale(0.4, 0.7, 0.4);
    body.drawCube();

    var tail1 = new Cube();
    tail1.color = colors.arm;
    tail1.matrix = bodyToTail1;
    tail1.matrix.translate(0.075, 0.08, 0.2);
    tail1.matrix.rotate(5, 1, 0, 0);
    tail1.matrix.rotate(g_tail1Rotate, 0, 1, 0);
    var tail1ToTail2 = new Matrix4(tail1.matrix);
    tail1.matrix.scale(0.25, 0.2 , 0.4);
    tail1.drawCube();

    var tail2 = new Cube()
    tail2.color = colors.arm;
    tail2.matrix = tail1ToTail2;
    tail2.matrix.translate(0.03,0.033, 0.3);
    tail2.matrix.rotate(g_tail2Rotate, 0, 1, 0);
    var tail2ToTail3 = new Matrix4(tail2.matrix);
    tail2.matrix.scale(0.20, 0.15 , 0.33);
    tail2.drawCube();

    var tail3 = new Cube();
    tail3.color = colors.arm;
    tail3.matrix = tail2ToTail3;
    tail3.matrix.translate(0.03,0.033, 0.2);
    tail3.matrix.rotate(g_tail3Rotate, 0, 1, 0);
    var tail3ToFire = new Matrix4(tail3.matrix);
    tail3.matrix.scale(0.15, 0.10 , 0.33);
    tail3.drawCube();

    var fire = new Sphere();
    fire.matrix = tail3ToFire;
    fire.matrix.translate(0.06, 0.05, 0.38);
    fire.drawSphere();

    var belly = new Cube();
    belly.color = colors.belly;
    belly.matrix = bodyToBelly;
    belly.matrix.translate(0.06 , 0.1, -0.04);
    belly.matrix.scale(0.28, 0.5 , 0.2);
    belly.drawCube();

    var head = new Cube();
    head.color = colors.body;
    head.matrix = bodyToHead;
    head.matrix.translate(0.05, 0.6, 0.05);
    head.matrix.rotate(g_headRotate, 1, 0, 0);
    var headToLEye = new Matrix4(head.matrix);
    var headToREye = new Matrix4(head.matrix);
    var headToSnout = new Matrix4(head.matrix);
    var headToSnout2 = new Matrix4(head.matrix);
    var headToTongue = new Matrix4(head.matrix);
    head.matrix.scale(0.3, 0.4, 0.3);
    head.drawCube();

    var lEye = new Cube();
    lEye.color = colors.eye;
    lEye.matrix = headToLEye;
    lEye.matrix.translate(0.03, 0.25, -0.05);
    var lEyeToLid = new Matrix4(lEye.matrix);
    var lEyeToPupil = new Matrix4(lEye.matrix);
    lEye.matrix.scale(0.08, 0.1, 0.08);
    lEye.drawCube();

    var lPupil = new Cube();
    lPupil.color = [1,1,1,1];
    lPupil.matrix = lEyeToPupil;
    lPupil.matrix.translate(0.04,0.06,-0.01);
    lPupil.matrix.scale(0.04, 0.04, 0.04);
    lPupil.drawCube();

    var rEye = new Cube();
    rEye.color = colors.eye;
    rEye.matrix = headToREye;
    rEye.matrix.translate(0.18, 0.25, -0.05);
    var rEyetoLid = new Matrix4(rEye.matrix);
    var rEyeToPupil = new Matrix4(rEye.matrix);
    rEye.matrix.scale(0.08, 0.1, 0.08);
    rEye.drawCube();    

    var rPupil = new Cube();
    rPupil.color = [1,1,1,1];
    rPupil.matrix = rEyeToPupil;
    rPupil.matrix.translate(0,0.06,-0.01);
    rPupil.matrix.scale(0.04, 0.04, 0.04);
    rPupil.drawCube();

    var rEyeLid = new Cube();
    rEyeLid.color = colors.lid;
    rEyeLid.matrix = rEyetoLid;
    rEyeLid.matrix.translate(-0.01, 0.11, -0.03);
    rEyeLid.matrix.scale(0.1, g_eyeTranslate, 0.14);
    rEyeLid.drawCube();

    var lEyeLid = new Cube();
    lEyeLid.color = colors.lid;
    lEyeLid.matrix = lEyeToLid;
    lEyeLid.matrix.translate(0, 0.11, -0.03);
    lEyeLid.matrix.scale(0.08, 0.01, 0.1);
    lEyeLid.drawCube();

    var snout = new Cube();
    snout.color = colors.arm;
    snout.matrix = headToSnout;
    snout.matrix.translate(0.02, 0.18, -0.04);
    var snouttoNostril1 = new Matrix4(snout.matrix);
    var snouttoNostril2 = new Matrix4(snout.matrix);
    snout.matrix.scale(0.25, 0.04, 0.1);
    snout.drawCube();

    var nostril1 = new Cube();
    nostril1.color = colors.nostril;
    nostril1.matrix = snouttoNostril1;
    nostril1.matrix.translate(0.085,0.015,-0.01);
    nostril1.matrix.scale(0.025,0.025, 0.025);
    nostril1.drawCube();

    var nostril2 = new Cube();
    nostril2.color = colors.nostril;
    nostril2.matrix = snouttoNostril2;
    nostril2.matrix.translate(0.14,0.015,-0.01);
    nostril2.matrix.scale(0.025,0.025, 0.025);
    nostril2.drawCube();

    var snout2 = new Cube();
    snout2.color = colors.arm;
    snout2.matrix = headToSnout2;
    snout2.matrix.translate(0.06, 0.13, -0.04);
    snout2.matrix.scale(0.18, 0.03, 0.1);
    snout2.drawCube();

    var tongue = new Cube();
    tongue.color = colors.tongue;
    tongue.matrix = headToTongue;
    tongue.matrix.translate(0.06, 0.16, -0.04);
    tongue.matrix.scale(0.18, 0.02, 0.1);
    tongue.drawCube();    

    var arm = new Cube();
    arm.color = colors.arm;
    arm.matrix = bodytoLArm;
    arm.matrix.translate(0.1, 0.5, 0.1);
    arm.matrix.rotate(-45, 0, 0, 1);
    arm.matrix.rotate(g_leftArmRotate, 0, 0, 1);
    arm.matrix.scale(-0.1, -0.4, 0.1);
    arm.drawCube();

    var arm2 = new Cube();
    arm2.color = colors.arm;
    arm2.matrix = bodytoRArm;
    arm2.matrix.translate(0.33, 0.6, 0.1);
    arm2.matrix.rotate(45, 0, 0, 1);
    arm2.matrix.rotate(-g_rightArmRotate, 0, 0, 1);
    arm2.matrix.scale(-0.1, -0.45, 0.1);
    arm2.drawCube();    

    var leg = new Cube();
    leg.color = colors.arm;
    leg.matrix = bodytoLLeg;
    leg.matrix.translate(0.035, -0.2, 0.12);
    leg.matrix.scale(0.12, 0.3, 0.15);
    leg.matrix.translate(0, g_walkLeftTranslate, 0);
    leg.drawCube();

    var leg2 = new Cube();
    leg2.color = colors.arm;
    leg2.matrix = bodytoRLeg;
    leg2.matrix.translate(0.235, -0.2, 0.12);
    leg2.matrix.scale(0.12, 0.3, 0.15);
    leg2.matrix.translate(0, g_walkRightTranslate, 0);
    leg2.drawCube();

    //  drawBuffer();

    var dur = performance.now() - ST;
    tohtml("ms: " + Math.floor(dur) + " fps: " + Math.floor(10000/dur)/10, "perf");
}

function changeColor(color){
    gl.uniform4f(u_FragColor, color[0], color[1], color[2], 1);
}

function drawShield(){
    g_shapesList=[]; 
    renderScene();
    changeColor([0.4,0.4,0.4]);
    drawTriangle([0,0.95,-0.8,0.7,0,0.7]);
    drawTriangle([0,0.95,0.8,0.7,0,0.7]);
    drawTriangle([-0.8,0.2,-0.8,0.7,0,0.7]);
    drawTriangle([-0.8,0.2,0,0.2,0,0.7]);
    drawTriangle([0.8,0.2,0.8,0.7,0,0.7]);
    drawTriangle([0.8,0.2,0,0.2,0,0.7]);
    drawTriangle([0.8,0.2,0,0.2,0,0.7]);
    drawTriangle([0,-0.9,0,0.2,-0.8,0.2]);
    drawTriangle([0,-0.9,0,0.2,0.8,0.2]);

    changeColor([0,0,0.8]);
    drawTriangle([0,0.85,-0.7,0.7,0,0.7]);
    drawTriangle([0,0.85,0.7,0.7,0,0.7]);
    drawTriangle([-0.7,0.2,-0.7,0.7,0,0.7]);
    drawTriangle([0.7,0.2,0.7,0.7,0,0.7]);
    drawTriangle([-0.7,0.2,0,0.7,0,0.2]);
    drawTriangle([0.7,0.2,0,0.7,0,0.2]);
    drawTriangle([-0.7,0.2,0,-0.8,0,0.2]);
    drawTriangle([0.7,0.2,0,-0.8,0,0.2]);

    changeColor([0.8,0.5,0.2]);
    drawTriangle([0,-0.6,-0.2,-0.3,0.2,-0.3]);

    changeColor([1,0,0]);
    drawTriangle([0,-0.15,-0.5,0.15,0.5,0.15]);
    drawTriangle([0,-0.15,-0.5,0.15,0.5,0.15]);
    drawTriangle([-0.3,-0.12,-0.35,0.15,0,0]);
    drawTriangle([0.3,-0.12,0.35,0.15,0,0]);

    changeColor([1,1,0]);
    drawTriangle([0,0.7, -0.3,0.3, 0.3, 0.3]);

    changeColor([0,0,1]);
    drawTriangle([0,0.3, -0.15,0.5, 0.15, 0.5]);   
    
    changeColor([0.4,0.4,0.4]);
    drawTriangle([-0.3,0.75, -0.3,0.55, -0.6, 0.35]);  
    drawTriangle([0.3,0.75, 0.3,0.55, 0.6, 0.35]);  
}

function addActionsForHTMLUI(){
    //Issue with green and blue, had to switch g_sel indices for them & change on mouseup to input
    document.getElementById("angleSlider").addEventListener('input', function(){g_camAngle = this.value; renderScene();});
    document.getElementById("angle2Slider").addEventListener('input', function(){g_camAngle2 = this.value; renderScene();});
    document.getElementById("leftArmSlider").addEventListener('input', function(){g_leftArmRotate = this.value; renderScene();});
    document.getElementById("rightArmSlider").addEventListener('input', function(){g_rightArmRotate = this.value; renderScene();});
    document.getElementById("headSlider").addEventListener('input', function(){g_headRotate = this.value; renderScene();});
    document.getElementById("tail1Slider").addEventListener('input', function(){g_tail1Rotate = this.value; renderScene();});
    document.getElementById("tail2Slider").addEventListener('input', function(){g_tail2Rotate = this.value; renderScene();});
    document.getElementById("tail3Slider").addEventListener('input', function(){g_tail3Rotate = this.value; renderScene();});
    document.getElementById("waveLeftOn").onclick = function(){g_waveLeftAnimation = true;};
    document.getElementById("waveLeftOff").onclick = function(){g_waveLeftAnimation = false;};
    document.getElementById("waveRightOn").onclick = function(){g_waveRightAnimation = true;};
    document.getElementById("waveRightOff").onclick = function(){g_waveRightAnimation = false;};
    document.getElementById("nodOn").onclick = function(){g_nodAnimation = true;};
    document.getElementById("nodOff").onclick = function(){g_nodAnimation = false;};
    document.getElementById("walkOn").onclick = function(){g_walkAnimation = true;};
    document.getElementById("walkOff").onclick = function(){g_walkAnimation = false;};
    document.getElementById("wagOn").onclick = function(){g_wagAnimation = true;};
    document.getElementById("wagOff").onclick = function(){g_wagAnimation = false;};
    document.addEventListener("keydown", (event) =>{
      if (event.key === "Shift") g_shiftClick = true;
    });
    document.addEventListener("keyup", (event) =>{
      if (event.key === "Shift") g_shiftClick = false;
    });
    document.addEventListener("mousedown", (event) =>{
      g_mouseClick = true;
    });
    document.addEventListener("mouseup", (event) =>{
      g_mouseClick = false;
    });
}

function main() {

    setupWebGL();

    connectVariablesToGLSL();

    addActionsForHTMLUI();  

    // Register function (event handler) to be called on a mouse press
    canvas.addEventListener("click", function(ev) {click(ev, canvas);});

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    //gl.clear(gl.COLOR_BUFFER_BIT);
    //renderScene(); 
    requestAnimationFrame(tick);
 }

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;


function tick(){
  g_seconds = performance.now() / 1000.0 - g_startTime;
  //console.log(g_seconds);
  updateAnimationAngles();
  renderScene();
  requestAnimationFrame(tick);
 }

function click(ev, canvas) {

    let rect = canvas.getBoundingClientRect();
    let x = ((ev.clientX - rect.left) - canvas.width / 2) / (canvas.width / 2);
    let y = (canvas.height / 2 - (ev.clientY - rect.top)) / (canvas.height / 2);

    g_camAngle = x * -180;
    g_camAngle2 = y * 90;

    tohtmlval(g_camAngle, "angleSlider");
    tohtmlval(g_camAngle2, "angle2Slider");

    //console.log(g_camAngle);
    //console.log(g_camAngle2);

    var globalRotMat = new Matrix4().rotate(g_camAngle, 0, 1, 0);
    globalRotMat.rotate(g_camAngle2, 1, 0, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);    

    renderScene();
}