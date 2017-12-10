import java.util.Stack;
// File name of currently loaded example (rendered on the bottom of the
// screen for your convenience).
String currentFile;


/*****************************************************
 * Place variables for describing the L-System here. *
 * These might include the final expansion of turtle *
 * commands, the step size d, etc.                   *
 *****************************************************/
String[] spec;
int applications; //how many applications of the rule
float angle_inc; //angle increment
float stepSize; //size of step taken per F
String axiom; //initial axiom
String fRule; //rule for replacing f
String xRule; //rule for replacing x
String yRule; //rule for replacing y
boolean curve; //curves or no curves

public class Turtle{ //class to represent turtle
  float[] pos = new float[2]; //current position of turtle
  float angle = 0.0; //current angle of turtle
  
  Turtle(float xPosition, float yPosition, float tAngle){
    pos[0] = xPosition;  
    pos[1] = yPosition;
    angle = tAngle;
  }
  
  float getX(){return pos[0];} 
  float getY(){return pos[1];}
}

Turtle t = new Turtle(0.0,0.0,0.0); // turtle used to draw
float defaultXPos;// starting position for turtle
float defaultYPos;
float defaultAngle = 0; //default angle of turtle



 
/*
 * This method is automatically called when ever a new L-System is
 * loaded (either by pressing 1 - 6, or 'o' to open a file dialog).
 *
 * The lines array will contain every line from the selected 
 * description file. You can assume it's a valid description file,
 * so it will have a length of 6:
 *
 *   lines[0] = number of production rule applications
 *   lines[1] = angle increment in degrees
 *   lines[2] = initial axiom
 *   lines[3] = production rule for F (or the string 'nil')
 *   lines[4] = production rule for X (or the string 'nil')
 *   lines[5] = production rule for Y (or the string 'nil')
 */
void processLSystem(String[] lines) {
  spec = lines;
  applications = int(lines[0]);
  angle_inc = float(lines[1]);
  axiom = lines[2];
  fRule = lines[3];
  xRule = lines[4];
  yRule = lines[5];
  String newLSystem = ""; //application of rules over axiom
  
  
  
  for(int i = 0; i<applications; i++){
    newLSystem = "";
    for(int j = 0; j<axiom.length(); j++){
      if(axiom.charAt(j) == 'F'){
        newLSystem += fRule;
      }
      else if(axiom.charAt(j) == 'X'){
        newLSystem += xRule;
      }
      else if(axiom.charAt(j) == 'Y'){
        newLSystem += yRule;
      }
      else newLSystem += axiom.charAt(j);
    }
    axiom = newLSystem;
  }
  print(newLSystem);
  
  
  
}

/*
 * This method is called every frame after the background has been
 * cleared to white, but before the current file name is written to
 * the screen.
 *
 * It is not called if there is no loaded file.
 */
void drawLSystem() { 
  for (int i = 0; i < 6; i++) {
    text(spec[i], 10, 20 + 15 * i);
  }
  
  float[] newPos = new float[2]; // increment for the new position of the turtle
  Stack tStack = new Stack(); //stack for turtle states
  
  t.pos[0] = defaultXPos;//set to default for each call 
  t.pos[1] = defaultYPos;
  t.angle = defaultAngle; //set to default
  
  beginShape(); //used for curve 
  

    for(int j = 0; j<axiom.length(); j++){
      if(axiom.charAt(j) == 'F'){
        if(curve == false || applications == 0){
          newPos[0] = stepSize * (float)Math.cos(Math.toRadians(t.angle)); //generate increment for new position
          newPos[1] = stepSize * (float) Math.sin(Math.toRadians(t.angle));
          line(t.pos[0], t.pos[1], t.pos[0] + newPos[0], t.pos[1] + newPos[1]); //draw line between current position and new position
          t.pos[0] += newPos[0]; //move turtle to next position
          t.pos[1] += newPos[1];
        }
        else{ //curves
          newPos[0] = stepSize * (float)Math.cos(Math.toRadians(t.angle)); //generate next position
          newPos[1] = stepSize * (float) Math.sin(Math.toRadians(t.angle));
          noFill();
          stroke(0,0,0);
          curveVertex(t.pos[0]+ newPos[0]/3, t.pos[1] + newPos[1]/3); //create vertices along path between vertices to create curve
          curveVertex(t.pos[0]+ newPos[0]*2/3, t.pos[1] + newPos[1]*2/3);
          t.pos[0] += newPos[0]; //move turtle to next position
          t.pos[1] += newPos[1];
          
          
          
        }
      }
      else if (axiom.charAt(j) == '+'){ //rotate turtle in positive direction
        t.angle += angle_inc;
      }
      else if (axiom.charAt(j) == '-'){ //rotate turtle in negative direction
        t.angle -= angle_inc;
      }
      else if (axiom.charAt(j) == '['){ //save turtle state (push)
        tStack.push(new Turtle(t.pos[0], t.pos[1], t.angle));
      }
      else if (axiom.charAt(j) == ']'){ //retrieve turtle state (pop)
        t = (Turtle)tStack.pop();
      }
    }
  
  endShape();
  
}

void setup() {
  size(1000, 1000); //initialize screen
  stroke(0);
  strokeWeight(1);
  stepSize = 5.0; //set turtle step size
  defaultXPos = width/4.0; //define default position for turtle
  defaultYPos = height/4.0;
  t.pos[0] = defaultXPos;
  t.pos[1] = defaultYPos;
  curve = false; //set curve to false initially
  
}

void draw() {
  background(255);

  if (currentFile != null) {
    drawLSystem();
  }

  fill(0);
  stroke(0);
  textSize(15);
  if (currentFile == null) {
    text("Press [1-6] to load an example, or 'o' to open a dialog. \nUse '=' and '-' to change size. Use 'r' to rotate.\nUse 'c' to switch to curved representation.", 5, 495);
  } else {
    text("Current l-system: " + currentFile, 5, 495);
  }
}

void keyReleased() {
  /*********************************************************
   * The examples loaded by pressing 1 - 6 must be placed  *
   * in the data folder within your sketch directory.      *
   * The same goes for any of your own files you'd like to *
   * load with relative paths.                             *
   *********************************************************/
   
  if (key == 'o' || key == 'O') {
    // NOTE: This option will not work if you're running the
    // Processing sketch with JavaScript and your browser.
    selectInput("Select a file to load:", "fileSelected");
  } else if (key == '1') {
    loadLSystem("example1.txt");
  } else if (key == '2') {
    loadLSystem("example2.txt");
  } else if (key == '3') {
    loadLSystem("example3.txt");
  } else if (key == '4') {
    loadLSystem("example4.txt");
  } else if (key == '5') {
    loadLSystem("example5.txt");
  } else if (key == '6') {
    loadLSystem("example6.txt");
  } else if (key == 'd') {
    loadLSystem("dragon.txt"); //load dragon file
  } else if (key == '='){ //increase step size
    stepSize+=1;
  } else if (key == '-'){ //decrease step size
    stepSize-=1;
  } else if (key == 'c'){ //switch to curve representation
    curve = !curve;
  } else if (key == 'r'){ //rotate image
    defaultAngle += 10;
  }
  
  // else modify the above code to include
  // keyboard shortcuts for your own examples
}

import java.io.File;
void fileSelected(File selection) {
  if (selection == null) {
    println("File selection cancelled."); 
  } else {
    loadLSystem(selection.getAbsolutePath()); 
  }
}

void loadLSystem(String filename) {
  String[] contents = loadStrings(filename);
  processLSystem(contents);
  currentFile = filename;
}
