var canvas;
var gl;
var programId;

//Global array for the points in the superquadric
var points = [];

//Transformation matrix for camera
var viewMatrix;
var viewMatrixLoc;

//Translation matrix for camera
var transCamera = mat4(1);

// Binds "on-change" events for the controls on the web page
function initControlEvents() {
	var panSensitivity = 0.05;
	
    document.getElementById("superquadric-constant-n1").onchange = 
        function(e) {
	
            console.log("New n1 value:", getSuperquadricConstants().n1);
            n1 = getSuperquadricConstants().n1;
            updateImage();
            display();
        };

    document.getElementById("superquadric-constant-n2").onchange =
        function (e) {
           
            console.log("New n2 value:", getSuperquadricConstants().n2);
            n2 = getSuperquadricConstants().n2;
            updateImage();
            display();
        };

    document.getElementById("superquadric-constant-a").onchange =
        function (e) {
           
            console.log("New a value:", getSuperquadricConstants().a);
            a = getSuperquadricConstants().a;
            updateImage();
            display();
        };

    document.getElementById("superquadric-constant-b").onchange =
       function (e) {
          
           console.log("New b value:", getSuperquadricConstants().b);
           b = getSuperquadricConstants().b;
           updateImage();
           display();
       };

    document.getElementById("superquadric-constant-c").onchange =
       function (e) {
           
           console.log("New c value:", getSuperquadricConstants().c);
           c = getSuperquadricConstants().c;
           updateImage();
           display();
       };
    
    document.getElementById("foreground-color").onchange =
      function (e) {
          updateImage();
          display();
      };
	canvas.onmousedown = 
	    function(e) {
	        console.log("Mouse clicked:", e.clientX, e.clientY);
	        mouseClickPos = [e.clientX, e.clientY];
	        mouseDown = true;

	        
	    };

	canvas.onmouseup =
        function (e) {
            mouseDown = false;
            theta += (mouseClickPos[0] - e.clientX) * panSensitivity/10 ;
            phi += (mouseClickPos[1] - e.clientY) * panSensitivity/10;
            display();
        }
	
	//If the user presses the left arrow key, shift camera to the left
	window.onkeydown = function (e) {
		var key = String.fromCharCode(e.keyCode); 
  		switch(e.keyCode) {
		//Left arrow keycode: see http://keycode.info
  		    case 37:
  		        transCamera = mult(translate(panSensitivity, 0, 0), transCamera);
			    display();
			    break;
  		//Up arrow key
  		    case 38:
  		        transCamera = mult(translate(0, -panSensitivity, 0), transCamera);
  		        display();
  		        break;
        //Right arrow key
  		    case 39:
  		        transCamera = mult(translate(-panSensitivity, 0, 0), transCamera);
  		        display();
  		        break;
  		//Down arrow key
  		    case 40:
  		        transCamera = mult(translate(0, panSensitivity, 0), transCamera);
  		        display();
  		        break;

  		 //l
  		    case 76:
  		        theta += panSensitivity;
  		        updateImage();
  		        display();
  		        break;

  		//press t to switch from teapot <-> superquadric
  		    case 84:
  		        teapot = !teapot;
  		        phi = Math.PI / 2;
  		        theta = Math.PI / 2;
  		        updateImage();
  		        display();
  		        break;
  		 //u
  		    case 85:
  		        phi += panSensitivity;
  		        updateImage();
  		        display();
  		        break;
  		// < key
  		    case 188:
  		        transCamera = mult(translate(0, 0, -panSensitivity), transCamera);
  		        display();
  		        break;
  	   // > key
  		    case 190:
  		        transCamera = mult(translate(0, 0, panSensitivity), transCamera);
  		        display();
  		        break;
  		}
	}
	
}

// Function for querying the current superquadric constants: a, b, c, d, n1, n2
function getSuperquadricConstants() {
    return {
        n1: parseFloat(document.getElementById("superquadric-constant-n1").value),
        n2: parseFloat(document.getElementById("superquadric-constant-n2").value),
        a: parseFloat(document.getElementById("superquadric-constant-a").value),
        b: parseFloat(document.getElementById("superquadric-constant-b").value),
        c: parseFloat(document.getElementById("superquadric-constant-c").value),

    }
}

// Function for computing the parametric points in the superquadric
// and then loading them into a gl buffer
function updateSuperquadric(){
	
    var v;
    var u;
    var x, y, z;
    
    
    points = [];
  
    for (v = -Math.PI/2; v <= Math.PI/2; v += Math.PI / 50) {

        for (u = -Math.PI; u < Math.PI; u += Math.PI / 50) {
            x = a * sign(Math.cos(v)) * Math.pow(Math.abs(Math.cos(v)), 2 / n1) * sign(Math.cos(u)) * Math.pow(Math.abs(Math.cos(u)), 2 / n2);
            y = b * sign(Math.cos(v)) * Math.pow(Math.abs(Math.cos(v)), 2 / n1) * sign(Math.sin(u)) * Math.pow(Math.abs(Math.sin(u)), 2 / n2);
            z = c * sign(Math.sin(v)) * Math.pow(Math.abs(Math.sin(v)), 2 / n1);
          
            points.push([x, y, z, 1.0]);
            v += Math.PI / 50;
            x = a * sign(Math.cos(v)) * Math.pow(Math.abs(Math.cos(v)), 2 / n1) * sign(Math.cos(u)) * Math.pow(Math.abs(Math.cos(u)), 2 / n2);
            y = b * sign(Math.cos(v)) * Math.pow(Math.abs(Math.cos(v)), 2 / n1) * sign(Math.sin(u)) * Math.pow(Math.abs(Math.sin(u)), 2 / n2);
            z = c * sign(Math.sin(v)) * Math.pow(Math.abs(Math.sin(v)), 2 / n1);
            
            points.push([x, y, z, 1.0]);
            u += Math.PI / 50;
            x = a * sign(Math.cos(v)) * Math.pow(Math.abs(Math.cos(v)), 2 / n1) * sign(Math.cos(u)) * Math.pow(Math.abs(Math.cos(u)), 2 / n2);
            y = b * sign(Math.cos(v)) * Math.pow(Math.abs(Math.cos(v)), 2 / n1) * sign(Math.sin(u)) * Math.pow(Math.abs(Math.sin(u)), 2 / n2);
            z = c * sign(Math.sin(v)) * Math.pow(Math.abs(Math.sin(v)), 2 / n1);
            
            points.push([x, y, z, 1.0]);
            v -= Math.PI / 50;
            u -= Math.PI / 50;
        }
    }

	var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( programId, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
}

//function for rendering teapot only by surface corners
function updateTeapotCorners(){
    points = [];
    for(i = 0; i<teapotIndices.length; i++){
        var iMat = teapotIndices[i];
        var pt1 = teapotPoints[iMat[0][0]].map(function (x) { return x * a/10; });
        var pt2 = teapotPoints[iMat[0][3]].map(function (x) { return x * a/10; });;
        var pt3 = teapotPoints[iMat[3][3]].map(function (x) { return x * a/10; });;
        var pt4 = teapotPoints[iMat[3][0]].map(function (x) { return x * a/10; });;
        points.push([pt1[0], pt1[1], pt1[2], 1.0]);
        points.push([pt2[0], pt2[1], pt2[2], 1.0]);
        points.push([pt3[0], pt3[1], pt3[2], 1.0]);
        points.push([pt4[0], pt4[1], pt4[2], 1.0]);
        console.log(pt1);
    }
    

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(programId, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}

//function for rendering teapot using Bezier surface patches (sorry for poor efficiency)
function updateTeapot() {
    points = [];
    var P;
    var Px; 
    var Py;
    var Pz;
    var M = mat4(1, 0, 0, 0,
                -3, 3, 0, 0,
                 3, -6, 3, 0,
                -1, 3, -3, 1);
    for (a = 0; a < teapotIndices.length; a++) { //iterate through all patches
        P = teapotIndices[a]; //indices of current patch
        
        P = flatten(m4Transpose(P));
        
        Px = mat4(teapotPoints[P[0]][0], teapotPoints[P[1]][0], teapotPoints[P[2]][0], teapotPoints[P[3]][0], //Px = x values for this patch
                  teapotPoints[P[4]][0], teapotPoints[P[5]][0], teapotPoints[P[6]][0], teapotPoints[P[7]][0],
                  teapotPoints[P[8]][0], teapotPoints[P[9]][0], teapotPoints[P[10]][0], teapotPoints[P[11]][0],
                  teapotPoints[P[12]][0], teapotPoints[P[13]][0], teapotPoints[P[14]][0], teapotPoints[P[15]][0]);

        Py = mat4(teapotPoints[P[0]][1], teapotPoints[P[1]][1], teapotPoints[P[2]][1], teapotPoints[P[3]][1], //Py = y values for this patch
                  teapotPoints[P[4]][1], teapotPoints[P[5]][1], teapotPoints[P[6]][1], teapotPoints[P[7]][1],
                  teapotPoints[P[8]][1], teapotPoints[P[9]][1], teapotPoints[P[10]][1], teapotPoints[P[11]][1],
                  teapotPoints[P[12]][1], teapotPoints[P[13]][1], teapotPoints[P[14]][1], teapotPoints[P[15]][1]);

        Pz = mat4(teapotPoints[P[0]][2], teapotPoints[P[1]][2], teapotPoints[P[2]][2], teapotPoints[P[3]][2], //Pz = z values for this patch
                      teapotPoints[P[4]][2], teapotPoints[P[5]][2], teapotPoints[P[6]][2], teapotPoints[P[7]][2],
                      teapotPoints[P[8]][2], teapotPoints[P[9]][2], teapotPoints[P[10]][2], teapotPoints[P[11]][2],
                      teapotPoints[P[12]][2], teapotPoints[P[13]][2], teapotPoints[P[14]][2], teapotPoints[P[15]][2]);
       
        //generate and push points in a square to give wireframe a gridded appearance
        for (u = 0; u <= 1; u += .1) {
            var U = vec4(1, u, u * u, u * u * u); //U vector [1, u, u^2, u^3]
            for (v = 0; v <= 1; v += .1) {
                var V = vec4(1, v, v * v, v * v * v); //V vector
                var x = mult(vec4Transpose(U), mult(M, mult(Px, mult(m4Transpose(M), V)))); // x = uT * Mb * Px * Mb * v (parameterized function for x value)
                var y = mult(vec4Transpose(U), mult(M, mult(Py, mult(m4Transpose(M), V)))); // ^ same function for y and z, substituting Py and Pz
                var z = mult(vec4Transpose(U), mult(M, mult(Pz, mult(m4Transpose(M), V))));
               
                x = .25 * (x[0] + x[1] + x[2] + x[3]); //need to sum the elements to get the dot product because mult multiplies the elements of the vectors, but does not sum them
                y = .25 * (y[0] + y[1] + y[2] + y[3]);
                z = .25 * (z[0] + z[1] + z[2] + z[3]);

                points.push([x, y, z, 1]);

                u += .05;
                U = vec4(1, u, u * u, u * u * u);
                x = mult(vec4Transpose(U), mult(M, mult(Px, mult(m4Transpose(M), V)))); // x = uT * Mb * Px * Mb * v
                y = mult(vec4Transpose(U), mult(M, mult(Py, mult(m4Transpose(M), V))));
                z = mult(vec4Transpose(U), mult(M, mult(Pz, mult(m4Transpose(M), V))));

                x = .25 * (x[0] + x[1] + x[2] + x[3]); 
                y = .25 * (y[0] + y[1] + y[2] + y[3]);
                z = .25 * (z[0] + z[1] + z[2] + z[3]);

                points.push([x, y, z, 1]);

                v += .05;
                V = vec4(1, v, v * v, v * v * v);
                x = mult(vec4Transpose(U), mult(M, mult(Px, mult(m4Transpose(M), V)))); // x = uT * Mb * Px * Mb * v
                y = mult(vec4Transpose(U), mult(M, mult(Py, mult(m4Transpose(M), V))));
                z = mult(vec4Transpose(U), mult(M, mult(Pz, mult(m4Transpose(M), V))));

                x = .25 * (x[0] + x[1] + x[2] + x[3]);
                y = .25 * (y[0] + y[1] + y[2] + y[3]);
                z = .25 * (z[0] + z[1] + z[2] + z[3]);

                points.push([x, y, z, 1]);

                v += .05;
                V = vec4(1, v, v * v, v * v * v);
                x = mult(vec4Transpose(U), mult(M, mult(Px, mult(m4Transpose(M), V)))); // x = uT * Mb * Px * Mb * v
                y = mult(vec4Transpose(U), mult(M, mult(Py, mult(m4Transpose(M), V))));
                z = mult(vec4Transpose(U), mult(M, mult(Pz, mult(m4Transpose(M), V))));

                x = .25 * (x[0] + x[1] + x[2] + x[3]);
                y = .25 * (y[0] + y[1] + y[2] + y[3]);
                z = .25 * (z[0] + z[1] + z[2] + z[3]);

                points.push([x, y, z, 1]);

                u += .05;
                U = vec4(1, u, u * u, u * u * u);
                x = mult(vec4Transpose(U), mult(M, mult(Px, mult(m4Transpose(M), V)))); // x = uT * Mb * Px * Mb * v
                y = mult(vec4Transpose(U), mult(M, mult(Py, mult(m4Transpose(M), V))));
                z = mult(vec4Transpose(U), mult(M, mult(Pz, mult(m4Transpose(M), V))));

                x = .25 * (x[0] + x[1] + x[2] + x[3]);
                y = .25 * (y[0] + y[1] + y[2] + y[3]);
                z = .25 * (z[0] + z[1] + z[2] + z[3]);

                points.push([x, y, z, 1]);

                //reset u and v
                u -= .1;
                v -= .1;
            }
        } 
        
    }


    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(programId, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}


// Function for querying the current wireframe color
function getWireframeColor() {
    var hex = document.getElementById("foreground-color").value;
    var red = parseInt(hex.substring(1, 3), 16);
    var green = parseInt(hex.substring(3, 5), 16);
    var blue = parseInt(hex.substring(5, 7), 16);
    return vec4(red / 255.0, green / 255.0, blue / 255.0);
}

window.onload = function() {
    // Find the canvas on the page
    canvas = document.getElementById("gl-canvas");
    
    // Initialize a WebGL context
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { 
        alert("WebGL isn't available"); 
    }
    
	
    // Load shaders
    programId = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(programId);
    
    // Set up events for the HTML controls
    initControlEvents();
	
	//Compute superquadric points and put them in gl Buffers
     updateSuperquadric();
   

    //get color attribute
    color = gl.getUniformLocation(programId, "color");
	
	//Draw the superquadric
	display();

};

//This function updates the view matrix and then draws the superquadric
function display() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var eye = vec3(a * Math.sin(theta) * Math.cos(phi), //used for mouse rotation
                    b * Math.sin(theta) * Math.sin(phi),
                    c * Math.cos(theta));

	viewMatrixLoc = gl.getUniformLocation( programId, "viewMatrix" );
	viewMatrix = mult(transCamera, lookAt(eye, at, up));
	gl.uniformMatrix4fv( viewMatrixLoc, false, flatten(viewMatrix) );
	
	/////////////////////////////////////////////
    // TODO: Draw the superquadric, implement perspective projection
    /////////////////////////////////////////////

	gl.uniform4fv(color, flatten(getWireframeColor()));
	
	gl.drawArrays( gl.LINE_STRIP, 0, points.length);
}

///////////////////////////////////////////////////////////
// TODO: Put other global variables and functions here.
///////////////////////////////////////////////////////////
var n1 = 2;
var n2 = 2;
var a = 1;
var b = 1;
var c = 1;

//Is mouse down?
var mouseDown = false;
var mouseClickPos = [0, 0];

//azimuth and altitude
var theta = Math.PI/2;
var phi = Math.PI/2;

//location and up direction of eye
const at = vec3(0.0, 0.0, 0.0); 
const up = vec3(0.0, 1.0, 0.0);

//superquadric or teapot?
var teapot = false;


function sign(x) { //returns 1 if positive, -1 if negative
    if (x >= 0) { return 1 }
    else return -1
}

//transpose a 4x4 matrix
function m4Transpose(m4) {
    m4 = flatten(m4);
    return mat4(m4[0], m4[1], m4[2], m4[3],
            m4[4], m4[5], m4[6], m4[7],
            m4[8], m4[9], m4[10], m4[11],
            m4[12], m4[13], m4[14], m4[15]);
}

//transpose a 4 element vector
function vec4Transpose(v4) {
    return [[v4[0]], [v4[1]], [v4[2]], [v4[3]]]
}

//switches between teapot and superellipsoid
function updateImage() {
    if (teapot) { updateTeapot(); }
    else { updateSuperquadric();}
}



//teapot data
var teapotPoints = [
vec3(1.4, 0.0, 2.4),
vec3(1.4, -0.784, 2.4),
vec3(0.784, -1.4, 2.4),
vec3(0.0, -1.4, 2.4),
vec3(1.3375, 0.0, 2.53125),
vec3(1.3375, -0.749, 2.53125),
vec3(0.749, -1.3375, 2.53125),
vec3(0.0, -1.3375, 2.53125),
vec3(1.4375, 0.0, 2.53125),
vec3(1.4375, -0.805, 2.53125),
vec3(0.805, -1.4375, 2.53125),
vec3(0.0, -1.4375, 2.53125),
vec3(1.5, 0.0, 2.4),
vec3(1.5, -0.84, 2.4),
vec3(0.84, -1.5, 2.4),
vec3(0.0, -1.5, 2.4),
vec3(-0.784, -1.4, 2.4),
vec3(-1.4, -0.784, 2.4),
vec3(-1.4, 0.0, 2.4),
vec3(-0.749, -1.3375, 2.53125),
vec3(-1.3375, -0.749, 2.53125),
vec3(-1.3375, 0.0, 2.53125),
vec3(-0.805, -1.4375, 2.53125),
vec3(-1.4375, -0.805, 2.53125),
vec3(-1.4375, 0.0, 2.53125),
vec3(-0.84, -1.5, 2.4),
vec3(-1.5, -0.84, 2.4),
vec3(-1.5, 0.0, 2.4),
vec3(-1.4, 0.784, 2.4),
vec3(-0.784, 1.4, 2.4),
vec3(0.0, 1.4, 2.4),
vec3(-1.3375, 0.749, 2.53125),
vec3(-0.749, 1.3375, 2.53125),
vec3(0.0, 1.3375, 2.53125),
vec3(-1.4375, 0.805, 2.53125),
vec3(-0.805, 1.4375, 2.53125),
vec3(0.0, 1.4375, 2.53125),
vec3(-1.5, 0.84, 2.4),
vec3(-0.84, 1.5, 2.4),
vec3(0.0, 1.5, 2.4),
vec3(0.784, 1.4, 2.4),
vec3(1.4, 0.784, 2.4),
vec3(0.749, 1.3375, 2.53125),
vec3(1.3375, 0.749, 2.53125),
vec3(0.805, 1.4375, 2.53125),
vec3(1.4375, 0.805, 2.53125),
vec3(0.84, 1.5, 2.4),
vec3(1.5, 0.84, 2.4),
vec3(1.75, 0.0, 1.875),
vec3(1.75, -0.98, 1.875),
vec3(0.98, -1.75, 1.875),
vec3(0.0, -1.75, 1.875),
vec3(2.0, 0.0, 1.35),
vec3(2.0, -1.12, 1.35),
vec3(1.12, -2.0, 1.35),
vec3(0.0, -2.0, 1.35),
vec3(2.0, 0.0, 0.9),
vec3(2.0, -1.12, 0.9),
vec3(1.12, -2.0, 0.9),
vec3(0.0, -2.0, 0.9),
vec3(-0.98, -1.75, 1.875),
vec3(-1.75, -0.98, 1.875),
vec3(-1.75, 0.0, 1.875),
vec3(-1.12, -2.0, 1.35),
vec3(-2.0, -1.12, 1.35),
vec3(-2.0, 0.0, 1.35),
vec3(-1.12, -2.0, 0.9),
vec3(-2.0, -1.12, 0.9),
vec3(-2.0, 0.0, 0.9),
vec3(-1.75, 0.98, 1.875),
vec3(-0.98, 1.75, 1.875),
vec3(0.0, 1.75, 1.875),
vec3(-2.0, 1.12, 1.35),
vec3(-1.12, 2.0, 1.35),
vec3(0.0, 2.0, 1.35),
vec3(-2.0, 1.12, 0.9),
vec3(-1.12, 2.0, 0.9),
vec3(0.0, 2.0, 0.9),
vec3(0.98, 1.75, 1.875),
vec3(1.75, 0.98, 1.875),
vec3(1.12, 2.0, 1.35),
vec3(2.0, 1.12, 1.35),
vec3(1.12, 2.0, 0.9),
vec3(2.0, 1.12, 0.9),
vec3(2.0, 0.0, 0.45),
vec3(2.0, -1.12, 0.45),
vec3(1.12, -2.0, 0.45),
vec3(0.0, -2.0, 0.45),
vec3(1.5, 0.0, 0.225),
vec3(1.5, -0.84, 0.225),
vec3(0.84, -1.5, 0.225),
vec3(0.0, -1.5, 0.225),
vec3(1.5, 0.0, 0.15),
vec3(1.5, -0.84, 0.15),
vec3(0.84, -1.5, 0.15),
vec3(0.0, -1.5, 0.15),
vec3(-1.12, -2.0, 0.45),
vec3(-2.0, -1.12, 0.45),
vec3(-2.0, 0.0, 0.45),
vec3(-0.84, -1.5, 0.225),
vec3(-1.5, -0.84, 0.225),
vec3(-1.5, 0.0, 0.225),
vec3(-0.84, -1.5, 0.15),
vec3(-1.5, -0.84, 0.15),
vec3(-1.5, 0.0, 0.15),
vec3(-2.0, 1.12, 0.45),
vec3(-1.12, 2.0, 0.45),
vec3(0.0, 2.0, 0.45),
vec3(-1.5, 0.84, 0.225),
vec3(-0.84, 1.5, 0.225),
vec3(0.0, 1.5, 0.225),
vec3(-1.5, 0.84, 0.15),
vec3(-0.84, 1.5, 0.15),
vec3(0.0, 1.5, 0.15),
vec3(1.12, 2.0, 0.45),
vec3(2.0, 1.12, 0.45),
vec3(0.84, 1.5, 0.225),
vec3(1.5, 0.84, 0.225),
vec3(0.84, 1.5, 0.15),
vec3(1.5, 0.84, 0.15),
vec3(-1.6, 0.0, 2.025),
vec3(-1.6, -0.3, 2.025),
vec3(-1.5, -0.3, 2.25),
vec3(-1.5, 0.0, 2.25),
vec3(-2.3, 0.0, 2.025),
vec3(-2.3, -0.3, 2.025),
vec3(-2.5, -0.3, 2.25),
vec3(-2.5, 0.0, 2.25),
vec3(-2.7, 0.0, 2.025),
vec3(-2.7, -0.3, 2.025),
vec3(-3.0, -0.3, 2.25),
vec3(-3.0, 0.0, 2.25),
vec3(-2.7, 0.0, 1.8),
vec3(-2.7, -0.3, 1.8),
vec3(-3.0, -0.3, 1.8),
vec3(-3.0, 0.0, 1.8),
vec3(-1.5, 0.3, 2.25),
vec3(-1.6, 0.3, 2.025),
vec3(-2.5, 0.3, 2.25),
vec3(-2.3, 0.3, 2.025),
vec3(-3.0, 0.3, 2.25),
vec3(-2.7, 0.3, 2.025),
vec3(-3.0, 0.3, 1.8),
vec3(-2.7, 0.3, 1.8),
vec3(-2.7, 0.0, 1.575),
vec3(-2.7, -0.3, 1.575),
vec3(-3.0, -0.3, 1.35),
vec3(-3.0, 0.0, 1.35),
vec3(-2.5, 0.0, 1.125),
vec3(-2.5, -0.3, 1.125),
vec3(-2.65, -0.3, 0.9375),
vec3(-2.65, 0.0, 0.9375),
vec3(-2.0, -0.3, 0.9),
vec3(-1.9, -0.3, 0.6),
vec3(-1.9, 0.0, 0.6),
vec3(-3.0, 0.3, 1.35),
vec3(-2.7, 0.3, 1.575),
vec3(-2.65, 0.3, 0.9375),
vec3(-2.5, 0.3, 1.125),
vec3(-1.9, 0.3, 0.6),
vec3(-2.0, 0.3, 0.9),
vec3(1.7, 0.0, 1.425),
vec3(1.7, -0.66, 1.425),
vec3(1.7, -0.66, 0.6),
vec3(1.7, 0.0, 0.6),
vec3(2.6, 0.0, 1.425),
vec3(2.6, -0.66, 1.425),
vec3(3.1, -0.66, 0.825),
vec3(3.1, 0.0, 0.825),
vec3(2.3, 0.0, 2.1),
vec3(2.3, -0.25, 2.1),
vec3(2.4, -0.25, 2.025),
vec3(2.4, 0.0, 2.025),
vec3(2.7, 0.0, 2.4),
vec3(2.7, -0.25, 2.4),
vec3(3.3, -0.25, 2.4),
vec3(3.3, 0.0, 2.4),
vec3(1.7, 0.66, 0.6),
vec3(1.7, 0.66, 1.425),
vec3(3.1, 0.66, 0.825),
vec3(2.6, 0.66, 1.425),
vec3(2.4, 0.25, 2.025),
vec3(2.3, 0.25, 2.1),
vec3(3.3, 0.25, 2.4),
vec3(2.7, 0.25, 2.4),
vec3(2.8, 0.0, 2.475),
vec3(2.8, -0.25, 2.475),
vec3(3.525, -0.25, 2.49375),
vec3(3.525, 0.0, 2.49375),
vec3(2.9, 0.0, 2.475),
vec3(2.9, -0.15, 2.475),
vec3(3.45, -0.15, 2.5125),
vec3(3.45, 0.0, 2.5125),
vec3(2.8, 0.0, 2.4),
vec3(2.8, -0.15, 2.4),
vec3(3.2, -0.15, 2.4),
vec3(3.2, 0.0, 2.4),
vec3(3.525, 0.25, 2.49375),
vec3(2.8, 0.25, 2.475),
vec3(3.45, 0.15, 2.5125),
vec3(2.9, 0.15, 2.475),
vec3(3.2, 0.15, 2.4),
vec3(2.8, 0.15, 2.4),
vec3(0.0, 0.0, 3.15),
vec3(0.0, -0.002, 3.15),
vec3(0.002, 0.0, 3.15),
vec3(0.8, 0.0, 3.15),
vec3(0.8, -0.45, 3.15),
vec3(0.45, -0.8, 3.15),
vec3(0.0, -0.8, 3.15),
vec3(0.0, 0.0, 2.85),
vec3(0.2, 0.0, 2.7),
vec3(0.2, -0.112, 2.7),
vec3(0.112, -0.2, 2.7),
vec3(0.0, -0.2, 2.7),
vec3(-0.002, 0.0, 3.15),
vec3(-0.45, -0.8, 3.15),
vec3(-0.8, -0.45, 3.15),
vec3(-0.8, 0.0, 3.15),
vec3(-0.112, -0.2, 2.7),
vec3(-0.2, -0.112, 2.7),
vec3(-0.2, 0.0, 2.7),
vec3(0.0, 0.002, 3.15),
vec3(-0.8, 0.45, 3.15),
vec3(-0.45, 0.8, 3.15),
vec3(0.0, 0.8, 3.15),
vec3(-0.2, 0.112, 2.7),
vec3(-0.112, 0.2, 2.7),
vec3(0.0, 0.2, 2.7),
vec3(0.45, 0.8, 3.15),
vec3(0.8, 0.45, 3.15),
vec3(0.112, 0.2, 2.7),
vec3(0.2, 0.112, 2.7),
vec3(0.4, 0.0, 2.55),
vec3(0.4, -0.224, 2.55),
vec3(0.224, -0.4, 2.55),
vec3(0.0, -0.4, 2.55),
vec3(1.3, 0.0, 2.55),
vec3(1.3, -0.728, 2.55),
vec3(0.728, -1.3, 2.55),
vec3(0.0, -1.3, 2.55),
vec3(1.3, 0.0, 2.4),
vec3(1.3, -0.728, 2.4),
vec3(0.728, -1.3, 2.4),
vec3(0.0, -1.3, 2.4),
vec3(-0.224, -0.4, 2.55),
vec3(-0.4, -0.224, 2.55),
vec3(-0.4, 0.0, 2.55),
vec3(-0.728, -1.3, 2.55),
vec3(-1.3, -0.728, 2.55),
vec3(-1.3, 0.0, 2.55),
vec3(-0.728, -1.3, 2.4),
vec3(-1.3, -0.728, 2.4),
vec3(-1.3, 0.0, 2.4),
vec3(-0.4, 0.224, 2.55),
vec3(-0.224, 0.4, 2.55),
vec3(0.0, 0.4, 2.55),
vec3(-1.3, 0.728, 2.55),
vec3(-0.728, 1.3, 2.55),
vec3(0.0, 1.3, 2.55),
vec3(-1.3, 0.728, 2.4),
vec3(-0.728, 1.3, 2.4),
vec3(0.0, 1.3, 2.4),
vec3(0.224, 0.4, 2.55),
vec3(0.4, 0.224, 2.55),
vec3(0.728, 1.3, 2.55),
vec3(1.3, 0.728, 2.55),
vec3(0.728, 1.3, 2.4),
vec3(1.3, 0.728, 2.4),
vec3(0.0, 0.0, 0.0),
vec3(1.5, 0.0, 0.15),
vec3(1.5, 0.84, 0.15),
vec3(0.84, 1.5, 0.15),
vec3(0.0, 1.5, 0.15),
vec3(1.5, 0.0, 0.075),
vec3(1.5, 0.84, 0.075),
vec3(0.84, 1.5, 0.075),
vec3(0.0, 1.5, 0.075),
vec3(1.425, 0.0, 0.0),
vec3(1.425, 0.798, 0.0),
vec3(0.798, 1.425, 0.0),
vec3(0.0, 1.425, 0.0),
vec3(-0.84, 1.5, 0.15),
vec3(-1.5, 0.84, 0.15),
vec3(-1.5, 0.0, 0.15),
vec3(-0.84, 1.5, 0.075),
vec3(-1.5, 0.84, 0.075),
vec3(-1.5, 0.0, 0.075),
vec3(-0.798, 1.425, 0.0),
vec3(-1.425, 0.798, 0.0),
vec3(-1.425, 0.0, 0.0),
vec3(-1.5, -0.84, 0.15),
vec3(-0.84, -1.5, 0.15),
vec3(0.0, -1.5, 0.15),
vec3(-1.5, -0.84, 0.075),
vec3(-0.84, -1.5, 0.075),
vec3(0.0, -1.5, 0.075),
vec3(-1.425, -0.798, 0.0),
vec3(-0.798, -1.425, 0.0),
vec3(0.0, -1.425, 0.0),
vec3(0.84, -1.5, 0.15),
vec3(1.5, -0.84, 0.15),
vec3(0.84, -1.5, 0.075),
vec3(1.5, -0.84, 0.075),
vec3(0.798, -1.425, 0.0),
vec3(1.425, -0.798, 0.0)
];

var teapotIndices = [
mat4(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
mat4(3, 16, 17, 18, 7, 19, 20, 21, 11, 22, 23, 24, 15, 25, 26, 27),
mat4(18, 28, 29, 30, 21, 31, 32, 33, 24, 34, 35, 36, 27, 37, 38, 39),
mat4(30, 40, 41, 0, 33, 42, 43, 4, 36, 44, 45, 8, 39, 46, 47, 12),
mat4(12, 13, 14, 15, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59),
mat4(15, 25, 26, 27, 51, 60, 61, 62, 55, 63, 64, 65, 59, 66, 67, 68),
mat4(27, 37, 38, 39, 62, 69, 70, 71, 65, 72, 73, 74, 68, 75, 76, 77),
mat4(39, 46, 47, 12, 71, 78, 79, 48, 74, 80, 81, 52, 77, 82, 83, 56),
mat4(56, 57, 58, 59, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95),
mat4(59, 66, 67, 68, 87, 96, 97, 98, 91, 99, 100, 101, 95, 102, 103, 104),
mat4(68, 75, 76, 77, 98, 105, 106, 107, 101, 108, 109, 110, 104, 111, 112, 113),
mat4(77, 82, 83, 56, 107, 114, 115, 84, 110, 116, 117, 88, 113, 118, 119, 92),
mat4(120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135),
mat4(123, 136, 137, 120, 127, 138, 139, 124, 131, 140, 141, 128, 135, 142, 143, 132),
mat4(132, 133, 134, 135, 144, 145, 146, 147, 148, 149, 150, 151, 68, 152, 153, 154),
mat4(135, 142, 143, 132, 147, 155, 156, 144, 151, 157, 158, 148, 154, 159, 160, 68),
mat4(161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176),
mat4(164, 177, 178, 161, 168, 179, 180, 165, 172, 181, 182, 169, 176, 183, 184, 173),
mat4(173, 174, 175, 176, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196),
mat4(176, 183, 184, 173, 188, 197, 198, 185, 192, 199, 200, 189, 196, 201, 202, 193),
mat4(203, 203, 203, 203, 206, 207, 208, 209, 210, 210, 210, 210, 211, 212, 213, 214),
mat4(203, 203, 203, 203, 209, 216, 217, 218, 210, 210, 210, 210, 214, 219, 220, 221),
mat4(203, 203, 203, 203, 218, 223, 224, 225, 210, 210, 210, 210, 221, 226, 227, 228),
mat4(203, 203, 203, 203, 225, 229, 230, 206, 210, 210, 210, 210, 228, 231, 232, 211),
mat4(211, 212, 213, 214, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244),
mat4(214, 219, 220, 221, 236, 245, 246, 247, 240, 248, 249, 250, 244, 251, 252, 253),
mat4(221, 226, 227, 228, 247, 254, 255, 256, 250, 257, 258, 259, 253, 260, 261, 262),
mat4(228, 231, 232, 211, 256, 263, 264, 233, 259, 265, 266, 237, 262, 267, 268, 241),
mat4(269, 269, 269, 269, 278, 279, 280, 281, 274, 275, 276, 277, 270, 271, 272, 273),
mat4(269, 269, 269, 269, 281, 288, 289, 290, 277, 285, 286, 287, 273, 282, 283, 284),
mat4(269, 269, 269, 269, 290, 297, 298, 299, 287, 294, 295, 296, 284, 291, 292, 293),
mat4(269, 269, 269, 269, 299, 304, 305, 278, 296, 302, 303, 274, 293, 300, 301, 270)
];
