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
  });
}

function bindActions() {
  const moveThanos = document.getElementById("move-thanos");
  moveThanos.addEventListener("click", () => {
    overlayManager.openPopup("move-thanos");
  });
}

function fillStonesContent(stonesData) {
  const stonesContent = document.getElementById("content-stones-popup");

  stonesData.forEach((stone) => {
    const stoneElement = document.createElement("div");
    stoneElement.classList.add(
      "flex",
      "p-3",
      "rounded-md",
      "items-center",
      "cursor-pointer",
      "hover:scale-110",
      "bg-slate-200",
      "space-x-5",
      "transition-all"
    );
    stoneElement.innerHTML = `
      <img src="${stone.image}" class="-m-3 rounded-l-md w-20 aspect-square object-cover" alt="${stone.name}" />
      <div class="grow">
        <div class="flex items-center justify-between gap-2">
          <p class="text-base">${stone.name}</p>
          <p class="text-xs p-1 bg-gray-900 text-gray-100 w-fit -mr-3 -mt-9 rounded-none rounded-tr-md">${stone.owner}</p>
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
    const avengerElement = document.createElement("div");
    avengerElement.classList.add(
      "rounded-md",
      "items-center",
      "cursor-pointer",
      "hover:scale-110",
      "bg-gray-900",
      "space-y-1",
      "transition-all",
      "w-[200px]"
    );
    avengerElement.innerHTML = `
      <img src="${avenger.thumbnail}" class="rounded-t-md m-auto aspect-square object-cover" alt="${avenger.name}" />
      <p class="text-base p-1 text-center text-white">${avenger.name}</p>
    `;
    avengersContent.appendChild(avengerElement);

    avengerElement.addEventListener("click", () => {
      myCharacter = avenger.name;
      updateMarkerClass(myCharacter);
      zoomToCharacter(myCharacter);
      overlayManager.closePopup();
    });
  });
}

loadData();
bindActions();

// open avengers popup
overlayManager.openPopup("choose-avenger");
