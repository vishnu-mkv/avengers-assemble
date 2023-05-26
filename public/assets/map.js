var map = L.map("map").setView([51.505, -0.09], 2);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

map.zoomControl.remove();

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

  L.DomUtil.addClass(marker._icon, "custom-marker");

  let className = "";
  if (name === "Thanos") className = "thanos";
  if (name === myCharacter) className = "my-character";
  if (name.toLowerCase().includes("stone")) className = "stone";
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

function sendMissile(name) {
  // from the current location of the character
  const characterLocation = markers[name].getLatLng();

  const thanosLocation = getThanosLocation();
  // calculate the angle between the two points
  const angle = (bearing(characterLocation, thanosLocation) + 270) % 360;

  // show the missile as a marker
  const missile = L.marker(characterLocation, {
    rotationAngle: angle,
    icon: new LeafIcon({ iconUrl: "assets/images/missile.png" }),
  }).addTo(map);

  var fx = new L.PosAnimation();

  // move the missile
  const newPos = map.latLngToLayerPoint(thanosLocation);

  fx.run(missile._icon, newPos, 3);

  fx.on("step", function (e) {
    missile._icon.style.transform =
      missile._icon.style.transform + `rotateZ(${angle}deg)`;
  });

  fx.once("end", function () {
    // remove the missile
    missile.remove();

    // show the explosion
    const explosion = L.marker(thanosLocation, {
      icon: new LeafIcon({ iconUrl: "assets/images/explosion.png" }),
      zIndexOffset: 2000,
    }).addTo(map);

    // remove the explosion after 1 second
    setTimeout(() => {
      explosion.remove();
    }, 5000);
  });
}

function bearing(latlng1, latlng2) {
  var rad = Math.PI / 180,
    lat1 = latlng1.lat * rad,
    lat2 = latlng2.lat * rad,
    lon1 = latlng1.lng * rad,
    lon2 = latlng2.lng * rad,
    y = Math.sin(lon2 - lon1) * Math.cos(lat2),
    x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
  var bearing = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  return bearing >= 180 ? bearing - 360 : bearing;
}
