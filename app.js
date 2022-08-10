const express = require("express");
const WebSocket = require("ws");

const app = express();

app.use(express.static(`${__dirname}/public`));

app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/index.html`, (err) => {
    if (err) {
      console.log(err);
      res.end(err.message);
    }
  });
});

const server = app.listen(9000, "127.0.0.1", () => {
  console.log("\x1b[36m", "Server is running on port 9000");
  console.log("\x1b[1m", "-> Go to http://localhost:9000");
});

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  ws.send("Hi there");
});
