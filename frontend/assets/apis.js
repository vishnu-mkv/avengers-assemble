const SERVER_URL = "http://localhost:3001";
const WebSocketURL = "ws://localhost:3001/socket.io/";
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
