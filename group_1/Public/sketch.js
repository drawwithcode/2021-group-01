// create a global variable for socket
// let clientSocket;

// create a global variable which will contain the color sent by the server
// we initialize it as white so the sketch can run even if the welcome message is
// not arrived yet
// let myColor = get_color();
// get_color();

// make an object with all the mouses
let allHands = {};

// let gif;
// let vid;
// let playing = true;

// initialise the socket in preload function
// so it won't be loaded before the setup
function preload() {
  // Create a new connection using socket.io (imported in index.html)
  clientSocket = io();

  // define all the callbacks functions for each incoming message
  clientSocket.on("connect", connectFunction);
  // clientSocket.on("welcome", welcomeFunction);
  // clientSocket.on("mouseBroadcast", mouseBroadcastFunction);
  clientSocket.on("handsBroadcast", newBroadcast);
  clientSocket.on("newUser", newUserFunction);

  // gif = loadImage("assets/interfaccia.gif");

  song = loadSound("assets/iDont.mp3");
}

// function run at the firs connection
function connectFunction() {
  console.log("your id:", clientSocket.id);
}

// function run when a welcome message is received from the server
// function welcomeFunction(data) {
//   myColor = data;
//   fill(myColor);
//   textAlign(CENTER);
//   text("Welcome " + clientSocket.id, width / 2, height / 2);
// }

// when a broadcast message come containing data
// about the pointer of another user, draw a circle in that position
function newBroadcast(dataReceived) {
  allHands[dataReceived.id] = dataReceived;
  // console.log(allHands);
  // console.log(dataReceived.handPos);
  // fill(dataReceived.color);
  //circle(dataReceived.x, dataReceived.y, 20);
}

// when a new user connects, print a welcome text
function newUserFunction(data) {
  console.log(data.color);
  console.log("New user: " + data.id);
}

var handposeModel = null; // this will be loaded with the handpose model
// WARNING: do NOT call it 'model', because p5 already has something called 'model'

var videoDataLoaded = false; // is webcam capture ready?

var statusText = "Loading handpose model...";

var myHands = []; // hands detected by mediapipe
// currently handpose only supports single hand, so this will be either empty or singleton

var capture; // webcam capture, managed by p5.js

// Load the MediaPipe handpose model assets.
handpose.load().then(function (_model) {
  console.log("model initialized.");
  statusText = "Model loaded.";
  handposeModel = _model;
});

let song;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  capture = createCapture(VIDEO);

  // this is to make sure the capture is loaded before asking handpose to take a look
  // otherwise handpose will be very unhappy
  capture.elt.onloadeddata = function () {
    console.log("video initialized");
    clientSocket.emit("ready");
    videoDataLoaded = true;
  };

  capture.hide();
  song.play();

  // vid = createVideo("assets/interfaccia.mp4");
  // vid.volume(0);
  // vid.hide();
  // vid.loop();
}

// draw a hand object returned by handpose
function drawHands(hands, noKeypoints) {
  // Each hand object contains a `landmarks` property,
  // which is an array of 21 3-D landmarks.

  for (var i = 0; i < hands.length; i++) {
    var landmarks = hands[i].landmarks;

    var palms = [0, 1, 2, 5, 9, 13, 17]; //landmark indices that represent the palm

    for (var j = 0; j < landmarks.length; j++) {
      var [x, y, z] = landmarks[j]; // coordinate in 3D space

      // draw the keypoint and number
      if (!noKeypoints) {
        rect(x - 2, y - 2, 4, 4);
        text(j, x, y);
      }

      // draw the skeleton
      var isPalm = palms.indexOf(j); // is it a palm landmark or finger landmark?
      var next; // who to connect with?
      if (isPalm == -1) {
        // connect with previous finger landmark if it's a finger landmark
        next = landmarks[j - 1];
      } else {
        // connect with next palm landmark if it's a palm landmark
        next = landmarks[palms[(isPalm + 1) % palms.length]];
      }
      line(x, y, next[0], next[1]);
    }
  }
}

const red = 255;
const green = 255;
const blue = 255;

function draw() {
  // var counter = 0;

  // // if (counter == 10) {
  // //   counter = 0;
  // //   // myColor = "#fffff";
  // // } else {
  // //   counter++;
  // //   // myColor = "#00000";
  // // }
  // // console.log(counter);

  //   if (counter == 0) {
  //     myColor = "#00ff00";
  //     // console.log("magenta");
  //     counter = counter + 200;

  //   } else if (counter == 200){
  //     myColor = "#fffff";
  //     // console.log("black");
  //     counter = counter - 200;
  //   }
  //   // console.log("Count: " + i);
  // }
  frameRate(15);
  clear();
  if (handposeModel && videoDataLoaded) {
    // model and video both loaded,

    handposeModel.estimateHands(capture.elt).then(function (_hands) {
      // we're handling an async promise
      // best to avoid drawing something here! it might produce weird results due to racing

      myHands = _hands; // update the global myHands object with the detected hands
      if (!myHands.length) {
        // haven't found any hands
        statusText = "Show some hands!";
      } else {
        // display the confidence, to 3 decimal places
        statusText =
          "Confidence: " +
          Math.round(myHands[0].handInViewConfidence * 1000) / 1000;
      }
    });
  }

  // background(200);
  // image(gif, 0, 0, windowWidth, windowHeight);
  // playGif();
  // gif = vid.get();
  // image(gif, 0, 0, windowWidth, windowHeight); // redraws the video frame by frame in

  push();
  for (const singleID in allHands) {
    let otherHand = allHands[singleID];

    scale(1.5);
    strokeWeight(2);
    stroke(otherHand.color);
    drawHands(otherHand.handPos, true);
  }
  pop();

  // first draw the debug video and annotations
  push();
  scale(0.5); // downscale the webcam capture before drawing, so it doesn't take up too much screen sapce
  image(capture, 0, 0, capture.width, capture.height);
  stroke(255, 0, 0);
  drawHands(myHands); // draw my hand skeleton
  pop();

  // draw the hands nice and large
  push();
  scale(1.5);
  // strokeWeight(5);
  // stroke(myColor);

  strokeWeight(4);
  stroke(red, green, blue);
  drawHands(myHands, true);
  // drawHands2(data, true);
  // console.log(myHands);
  // clientSocket.emit("hands", myHands);
  pop();

  push();
  // fill(255, 0, 0);
  text(statusText, 2, 60);
  pop();

  // create an object containing the mouse position
  let message = {
    id: clientSocket.id,
    handPos: myHands,
    color: "WHITE",
  };

  // send the object to server,
  // tag it as "mouse" event
  clientSocket.emit("hands", message);
}

function mousePressed() {
  if (song.isPlaying()) {
    // .isPlaying() returns a boolean
    song.pause();
  } else {
    song.play();
  }
}

// function playGif() {
//   // image(gif, 0, 0, windowWidth, windowHeight);
//   // console.log("playing now");
// }
