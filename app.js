require("dotenv").config();

const router = require("./api");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.static("public"));

app.use(cors({ origin: "*" }));

app.use("/api", router);

const PORT = process.env.PORT || 3000;

// Start the server
const server = app.listen(PORT, () => {
  console.log("Server is running on port ", PORT);
});

// Upgrade HTTP server to WebSocket server
server.on("upgrade", (request, socket, head) => {
  router.wss.handleUpgrade(request, socket, head, (ws) => {
    router.wss.emit("connection", ws, request);
  });
});

module.exports = app;
