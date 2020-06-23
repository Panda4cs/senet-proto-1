//game related
let nextPlayer = "X"; //min
let changePlayer = (currPlayer) => (currPlayer === "X" ? "O" : "X");
let sendPlayer = () => {
  const currentPlayer = nextPlayer;
  nextPlayer = changePlayer(nextPlayer);
  return currentPlayer;
};
//server related
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const path = require("path");
const shortid = require("shortid");
//What
let rooms = [];
const server = app.listen(PORT, () =>
  console.log(`Eyes on port ${PORT} ` + "http://localhost:3000/")
);
const io = require("socket.io")(server);
app.use(express.static(path.join(__dirname, "./client")));
app.use(express.static(path.join(__dirname, "./client/game")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/index.html"));
});
app.get("/createRoom", (req, res) => {
  //shortid.generate()
  const newRoomId = shortid.generate();
  createRoom(newRoomId);
  rooms.push(newRoomId);
  console.log(rooms);
  res.redirect("/" + newRoomId);
});
app.get("/:roomID", (req, res) => {
  if (rooms.includes(req.params.roomID)) {
    console.log("object");
    res.sendFile(path.join(__dirname, "./client/game/index.html"));
  } else {
    res.sendFile(path.join(__dirname, "./client/index.html"));
  }
});
//Socket Logic
const createRoom = (id) => {
  const nsp = io.of(`/${id}`);
  //   console.log(nsp);
  nsp.on("connection", function (socket) {
    console.log("someone connected", id);
    socket.emit("setPlayer", sendPlayer());
    socket.on("userClick", (data) => {
      nsp.emit("registerClick", data);
    });
    socket.on("setWinner", (winner) => nsp.emit("declareWinner", winner));
  });
};
