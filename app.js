const express = require("express");

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

app.listen(9000, "127.0.0.1", () => {
  console.log("Server is running on port 9000");
});
