const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const { connectToMongoDB } = require("./connect");
const { restrictToLoggedinUserOnly, checkAuth } = require("./middlewares/auth");
const URL = require("./models/url");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");
const userRoute = require("./routes/user");
const app = express();
app.use(cors());
const PORT = process.env.PORT;
const bodyParser = require('body-parser');
require('dotenv').config(); // <--- This line is missing

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

connectToMongoDB(process.env.MONGODB_URI).then(() =>
  console.log("Mongodb connected")
);

app.use(bodyParser.json());
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api", userRoute);
// app.use("/", checkAuth, staticRoute);
let port= PORT || 5000;
server.listen(8001, () => console.log(`Server Started at PORT:${8001}`));
