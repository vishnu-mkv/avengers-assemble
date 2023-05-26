const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:3001/socket.io/"); // Replace with your WebSocket server URL

// Connection opened event
ws.on("open", () => {
  console.log("WebSocket connection established");

  // Send a message to request initial character locations
  ws.send("Requesting character locations...");
});

// Message received event
ws.on("message", (message) => {
  const characterLocations = JSON.parse(message);
  console.log("Received character locations:", characterLocations);
});

// Connection closed event
ws.on("close", () => {
  console.log("WebSocket connection closed");
});

// Error event
ws.on("error", (error) => {
  console.error("WebSocket error:", error);
});
