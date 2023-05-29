const app = require("./api");

const PORT = process.env.PORT || 3000;

// Start the server
const server = app.listen(PORT, () => {
  console.log("Server is running on port ", PORT);
});

// Upgrade HTTP server to WebSocket server
server.on("upgrade", (request, socket, head) => {
  app.wss.handleUpgrade(request, socket, head, (ws) => {
    app.wss.emit("connection", ws, request);
  });
});

module.exports = app;
