async function loadData() {
  const stonesData = await getStones();

  stonesData.forEach((stone) => {
    plotMarker(
      stone.location.latitude,
      stone.location.longitude,
      stone.image,
      stone.name
    );
  });

  fillStonesContent(stonesData);

  const avengersData = await getAvengers();

  fillAvengersContent(avengersData);

  fillFocusContent([...avengersData, ...stonesData]);

  avengersData.forEach((avenger) => {
    plotMarker(
      avenger.location.latitude,
      avenger.location.longitude,
      avenger.thumbnail,
      avenger.name
    );
  });

  establishConnection({
    locations: (data) => {
      Object.values(data).forEach((location) => {
        updateLocation(location.latitude, location.longitude, location.name);
      });
    },
    disable_thanos_button: () => {
      const moveThanos = document.getElementById("move-thanos");
      moveThanos.disabled = true;
    },
    enable_thanos_button: () => {
      const moveThanos = document.getElementById("move-thanos");
      moveThanos.disabled = false;
    },
    attack_thanos: (data) => {
      sendMissile(data);
    },
  });
}

function bindActions() {
  const moveThanos = document.getElementById("move-thanos");
  moveThanos.addEventListener("click", () => {
    overlayManager.openPopup("move-thanos");
  });

  // attack thanos
  const attackThanos = document.getElementById("attack-thanos");
  attackThanos.addEventListener("click", () => {
    // disable the button
    attackThanos.disabled = true;
    // send the attack to server
    attackThanosServer();
    // enable the button after 5 seconds
    setTimeout(() => {
      attackThanos.disabled = false;
    }, 3000);
  });

  // locate btn
  const locateBtn = document.getElementById("locate");
  locateBtn.addEventListener("click", () => {
    overlayManager.openPopup("focus");
  });
}

function fillStonesContent(stonesData) {
  const stonesContent = document.getElementById("content-stones-popup");

  stonesData.forEach((stone) => {
    const stoneElement = document.createElement("div");
    stoneElement.classList.add(
      "flex",
      "rounded-md",
      "items-center",
      "cursor-pointer",
      "hover:scale-110",
      "bg-slate-200",
      "space-x-5",
      "transition-all",
      "relative"
    );
    stoneElement.innerHTML = `
      <img src="${stone.image}" class=" rounded-l-md w-20 aspect-square object-cover" alt="${stone.name}" />
      <div class="grow p-3">
        <div class="flex items-center justify-between gap-2">
          <p class="text-base">${stone.name}</p>
          <p class="text-xs p-1 bg-gray-900 text-gray-100 w-fit absolute right-0 top-0 rounded-none rounded-tr-md">${stone.owner}</p>
        </div>
        <p class="text-sm text-slate-600">${stone.power}</p>
      </div>
    `;
    stonesContent.appendChild(stoneElement);

    stoneElement.addEventListener("click", () => {
      overlayManager.closePopup();
      moveThanosToStone(stone.name);
    });
  });
}

function fillAvengersContent(avengersData, skipThanos = true) {
  const avengersContent = document.getElementById("content-avengers-popup");

  avengersData.forEach((avenger) => {
    if (avenger.name === "Thanos" && skipThanos) return;
    let avengerElement = getAvengerBox(avenger);

    avengersContent.appendChild(avengerElement);
    avengerElement.addEventListener("click", () => {
      myCharacter = avenger.name;
      updateMarkerClass(myCharacter);
      zoomToCharacter(myCharacter);
      overlayManager.closePopup();
    });
  });
}

function fillFocusContent(avengersData) {
  const avengersContent = document.getElementById("content-focus-popup");

  avengersData.forEach((avenger) => {
    let avengerElement = getAvengerBox(avenger);

    avengersContent.appendChild(avengerElement);
    avengerElement.addEventListener("click", () => {
      zoomToCharacter(avenger.name);
      overlayManager.closePopup();
    });
  });
}

function getAvengerBox(avenger) {
  const avengerElement = document.createElement("div");
  avengerElement.classList.add(
    "rounded-md",
    "items-center",
    "cursor-pointer",
    "hover:scale-110",
    "bg-gray-900",
    "space-y-1",
    "transition-all",
    "w-[200px]",
    "grow"
  );
  avengerElement.innerHTML = `
      <img src="${
        avenger.thumbnail || avenger.image
      }" class="rounded-t-md m-auto w-32 aspect-square object-cover" alt="${
    avenger.name
  }" />
      <p class="text-base p-1 text-center text-white">${avenger.name}</p>
    `;
  return avengerElement;
}

loadData();
bindActions();

// open avengers popup
overlayManager.openPopup("choose-avenger");
