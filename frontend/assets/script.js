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

const overlayManager = {
  currentlyOpenOverlay: null,
  overlays: {
    "move-thanos": {
      close: () => {
        const overlay = document.getElementById("stones-popup");
        overlay.classList.add("hidden");
      },
      open: () => {
        const overlay = document.getElementById("stones-popup");
        overlay.classList.remove("hidden");
      },
      closeBtnId: "close-stones-popup",
    },
  },
  closePopup() {
    // close #overlay
    const overlay = document.getElementById("overlay");
    overlay.classList.add("hidden");

    // close currently open overlay
    if (this.currentlyOpenOverlay) {
      this.overlays[this.currentlyOpenOverlay].close();
    }

    this.currentlyOpenOverlay = null;
  },
  openPopup(id) {
    // open #overlay
    const overlay = document.getElementById("overlay");
    overlay.addEventListener("click", () => {
      this.closePopup();
    });

    overlay.classList.remove("hidden");

    this.currentlyOpenOverlay = id;

    // open currently open overlay
    if (this.currentlyOpenOverlay) {
      this.overlays[this.currentlyOpenOverlay].open();
    }

    // find close button and bind click event
    const closeButton = document.getElementById(this.overlays[id].closeBtnId);
    closeButton.addEventListener("click", () => {
      this.closePopup();
    });
  },
};

loadData();
bindActions();
