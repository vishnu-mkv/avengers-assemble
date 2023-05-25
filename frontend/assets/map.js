var map = L.map("map").setView([51.505, -0.09], 2);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

var LeafIcon = L.Icon.extend({
  options: {
    iconSize: [48, 48],
  },
});

const markers = {};
const circles = [];

function plotMarker(lat, long, src, name) {
  var marker = L.marker([lat, long], {
    icon: new LeafIcon({ iconUrl: src }),
  }).addTo(map);
  marker.bindPopup(name);
  markers[name] = marker;

  let className = "";
  console.log(name, myCharacter);
  if (name === "Thanos") className = "thanos";
  if (name === myCharacter) className = "my-character";
  if (className.length > 0) L.DomUtil.addClass(marker._icon, className);

  showDangerCircles();
}

function updateMarkerClass(name, className = "my-character") {
  const marker = markers[name];
  if (!marker) return;

  L.DomUtil.addClass(marker._icon, className);
}

function zoomToCharacter(name) {
  const marker = markers[name];
  if (!marker) return;

  map.setView(marker.getLatLng(), 3);
}

function updateLocation(lat, long, name) {
  markers[name].setLatLng([lat, long]);
  showDangerCircles();
}

function getThanosLocation() {
  return markers["Thanos"]?.getLatLng();
}

function showDangerCircles() {
  // if thanos is near a stone, show a danger circle around the stone

  // remove all circles
  circles.forEach((circle) => circle.remove());

  Object.values(markers).forEach((marker) => {
    const character = marker.getPopup().getContent()?.toLowerCase();
    // if the marker is thanos, skip it
    if (
      !character ||
      character === "Thanos" ||
      !character.toLowerCase().includes("stone")
    )
      return;

    const stoneLocation = marker.getLatLng();
    const thanoseLoaction = getThanosLocation();

    if (!thanoseLoaction) return;

    const distance = map.distance(stoneLocation, thanoseLoaction);

    if (distance < 1000000) {
      const circle = L.circle(stoneLocation, {
        color: "red",
        fillColor: "#f03",
        fillOpacity: 0.5,
        radius: 1500000,
      }).addTo(map);
      circles.push(circle);

      // move zoom to the stone
      map.setView(stoneLocation, 3);
    }
  });
}
