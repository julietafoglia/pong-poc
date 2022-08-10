const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const device = require("express-device");
app.use(device.capture());

app.use(express.static(`${__dirname}/public`));

app.get("/", (req, res) => {
  if (req.device.type === "phone") {
    res.send("Phone connected");
  } else {
    res.sendFile(`${__dirname}/index.html`, (err) => {
      if (err) {
        console.log(err);
        res.end(err.message);
      }
    });
  }
});

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(9000, "127.0.0.1", () => {
  console.log("\x1b[36m", "Server is running on port 9000");
  console.log("\x1b[1m", "-> Go to http://localhost:9000");
});
