const SERVER_URL = window.location.origin + "/api";
const WebSocketURL = `wss://${
  window.location.origin.split("//")[1]
}/api/socket.io/`;
const socket = new WebSocket(WebSocketURL);

const getStones = async () => (await axios.get(`${SERVER_URL}/stones`)).data;

// /avengers api
const getAvengers = async () =>
  (await axios.get(`${SERVER_URL}/avengers`)).data;

const establishConnection = (eventCallbacks) => {
  // socket io

  socket.onopen = () => {
    console.log("Connected to server");
  };

  socket.onmessage = (D) => {
    const data = JSON.parse(D.data);

    const callback = eventCallbacks[data.type];

    if (callback) {
      callback(data.data);
      return;
    }

    console.log("Received message from server:", data);
  };
};

const moveThanosToStone = (stone = "Mind Stone") => {
  socket.send(
    JSON.stringify({
      type: "move_thanos",
      data: stone,
    })
  );
};

const attackThanosServer = () => {
  socket.send(
    JSON.stringify({
      type: "attack_thanos",
      data: myCharacter,
    })
  );
};
