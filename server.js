console.log("up and running");

let express = require("express");

let app = express();

let port = process.env.PORT || 3000;

let server = app.listen(port);

console.log("Server is running on http://localhost:" + port);

app.use(express.static("public"));

let serverSocket = require("socket.io");

let io = serverSocket(server);

io.on("connection", newConnection);

// // creaet the object that will handle users colors
// let userColors = {};

// // callback function: the paramenter (in this case socket)
// // will contain all the information on the new connection
function newConnection(newSocket) {
  // log the connection in terminal
  console.log("new connection:", newSocket.id);

  // generate a random hex code
  // function taken from https://css-tricks.com/snippets/javascript/random-hex-color/
  // let newColor = get_rand_color();
  // // "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
  // function get_rand_color() {
  //   var color = Math.floor(Math.random() * Math.pow(256, 3)).toString(16);
  //   while (color.length < 6) {
  //     color = "0" + color;
  //   }
  //   return "#" + color;
  // }

  // add the color to the userColor object
  // we will add a property named as the id of the client
  // and give as value the new color
  // userColors[newSocket.id] = newColor;

  // send the color code
  // io.to(newSocket.id).emit("welcome", newColor);

  // tell to all the others that a new user connectd
  // newSocket.broadcast.emit("newUser", { id: newSocket.id, color: newColor });

  // // when a message called "mouse" is received from one of the client,
  // // call the incomingMouseMessage function
  // newSocket.on("mouse", incomingMouseMessage);

  // // callback function run when the "mouse" message is received
  // function incomingMouseMessage(dataReceived) {
  //   // add to the data the colour
  //   dataReceived.color = userColors[dataReceived.id];
  //   // send it to all the clients
  //   newSocket.broadcast.emit("mouseBroadcast", dataReceived);
  // }

  newSocket.on("hands", handsMessage);

  // callback function run when the "mouse" message is received
  function handsMessage(dataReceived) {
    // console.log(dataReceived);

    // add to the data the colour
    // dataReceived.color = userColors[dataReceived.id];
    // send it to all the clients
    newSocket.broadcast.emit("handsBroadcast", dataReceived);
  }

  newSocket.on("whereItIs", startPoint);

  // callback function run when the "mouse" message is received
  function startPoint(whereItWas) {
    newSocket.broadcast.emit("startHere", whereItWas);
  }
}
