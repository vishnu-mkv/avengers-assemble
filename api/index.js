const express = require("express");
const MarvelClient = require("marvel");
const WebSocket = require("ws");

const app = express.Router();

// Stone data from JSON
const stonesData = require("./stones.json");

// Marvel API credentials
const marvelClient = new MarvelClient({
  publicKey: process.env.MARVEL_PUBLIC_KEY,
  privateKey: process.env.MARVEL_PRIVATE_KEY,
});

// Schedule periodic updates for character locations
let clearUpdateInterval = setInterval(updateCharacterLocations, 3000); // Update every 5 seconds
let moveThanos = true;

// Global variable to store character locations
// key is character ID, value is { id, lat, long, name }
const characterLocations = {};

const characterIds = [
  "Iron Man",
  "Captain America",
  "Thanos",
  "Thor",
  "Hulk",
  "Black Widow",
  "Hawkeye",
  "Doctor Strange",
  // "Captain Marvel",
  // "Black Panther",
  // "Scarlet Witch",
  // "Vision",
  // "Falcon",
  // "War Machine",
  // "Spider-Man",
  // "Ant-Man",
  // "Wasp",
];

let characterData = [];

// Helper function to generate random latitude and longitude coordinates
function generateRandomCoordinates() {
  const minLat = -80; // Adjust the latitude range as needed
  const maxLat = 80; // Adjust the latitude range as needed
  const minLng = -180;
  const maxLng = 180;
  const latitude = Math.random() * (maxLat - minLat) + minLat;
  const longitude = Math.random() * (maxLng - minLng) + minLng;
  return { latitude, longitude };
}

// API to get stone data
app.get("/stones", (req, res) => {
  res.json(stonesData);
});

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ noServer: true, path: "/socket.io/" });
wss.on("connection", (ws) => {
  // move thanos to a stone if message from client

  ws.on("message", (message) => {
    const parsedMessage = JSON.parse(message);

    if (parsedMessage.type === "move_thanos") {
      const stoneId = parsedMessage.data;
      const stone = stonesData.find((stone) => stone.name === stoneId);

      if (!moveThanos) {
        return;
      }

      if (!stone) {
        console.error("Stone not found:", stoneId);
        return;
      }

      const stoneLocation = stone.location;
      const nearLocation = getNearbyLocation(
        stoneLocation.latitude,
        stoneLocation.longitude
      );

      // clear interval to stop updating character locations
      // restart interval after 10 seconds

      clearInterval(clearUpdateInterval);
      moveThanos = false;

      // send disable thanos button message to client
      ws.send(
        JSON.stringify({
          type: "disable_thanos_button",
        })
      );

      setTimeout(() => {
        moveThanos = true;
        ws.send(
          JSON.stringify({
            type: "enable_thanos_button",
          })
        );
        const newLocation = generateRandomCoordinates();
        changeThanosLocation(newLocation.latitude, newLocation.longitude);
        clearUpdateInterval = setInterval(updateCharacterLocations, 3000);
      }, 10000);

      changeThanosLocation(nearLocation.latitude, nearLocation.longitude);
    }

    if (parsedMessage.type === "attack_thanos") {
      // send attack to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "attack_thanos",
              data: parsedMessage.data,
            })
          );
        }
      });
    }
  });

  // Handle WebSocket close event
  ws.on("close", () => {
    // Clean up disconnected client
  });
});

function changeThanosLocation(lat, long) {
  characterLocations[1009652].latitude = lat;
  characterLocations[1009652].longitude = long;
  sendCharacterLocations();
}

// API to initiate WebSocket connection and send character IDs and locations
app.get("/avengers", (req, res) => {
  // check if character data has already been fetched

  if (characterData.length > 0) {
    console.log("Character data already fetched");
    res.json(characterData);
    return;
  }

  console.log("Fetching Avengers characters...");

  const promises = characterIds.map((id) => {
    return new Promise((resolve, reject) => {
      marvelClient.characters.name(id).get((err, result) => {
        if (err) {
          reject(err);
          return;
        }

        const character = result[0];

        if (!character) {
          reject(new Error(`Character not found: ${id}`));
          return;
        }

        //   if character has no location, generate random coordinates
        if (characterLocations[character.id] === undefined) {
          const coordinates = generateRandomCoordinates();
          characterLocations[character.id] = {
            name: character.name,
            id: character.id,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          };
        }

        character.location = characterLocations[character.id];
        resolve({
          id: character.id,
          name: character.name,
          location: character.location,
          thumbnail: `${character.thumbnail.path}.${character.thumbnail.extension}`,
        });
      });
    });
  });

  Promise.all(promises)
    .then((characters) => {
      // Store character data in global variable
      console.log("Fetched Avengers characters");
      characterData = characters;
      res.json(characters);
    })
    .catch((error) => {
      console.error("Error fetching Avengers characters:", error);
      res.status(500).json({ error: "Failed to fetch Avengers characters" });
    });
});

// Helper function to send character locations through WebSocket
function sendCharacterLocations() {
  wss.clients.forEach((client) => {
    client.send(
      JSON.stringify({ data: characterLocations, type: "locations" })
    );
  });
}

function getNearbyLocation(latitude, longitude) {
  const minLatitude = -80; // Adjust the latitude range as needed
  const maxLatitude = 80; // Adjust the latitude range as needed
  const randomDirection = Math.random() * 2 * Math.PI;
  const randomDistance = 50;

  // Calculate the new latitude and limit it within the range
  let newLatitude = latitude + randomDistance * Math.cos(randomDirection) * 0.1;
  newLatitude = Math.max(minLatitude, Math.min(maxLatitude, newLatitude));

  const newLongitude =
    longitude + randomDistance * Math.sin(randomDirection) * 0.1;
  return { latitude: newLatitude, longitude: newLongitude };
}

// Helper function to update character locations
function updateCharacterLocations() {
  // Code to update character locations as needed
  // You can modify the logic to update the character locations randomly or based on specific criteria
  // For now, we will just update the locations randomly

  // Loop through each character
  for (const characterId in characterLocations) {
    // Generate random coordinates
    const current = characterLocations[characterId];
    const coordinates = getNearbyLocation(current.latitude, current.longitude);

    // Update character location
    characterLocations[characterId].latitude = coordinates.latitude;
    characterLocations[characterId].longitude = coordinates.longitude;
  }

  sendCharacterLocations();
}

app.get("/", (_, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

module.exports = app;

// export wss
module.exports.wss = wss;
