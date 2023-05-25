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
    "choose-avenger": {
      close: () => {
        const overlay = document.getElementById("avengers-popup");
        overlay.classList.add("hidden");
      },
      open: () => {
        const overlay = document.getElementById("avengers-popup");
        overlay.classList.remove("hidden");
      },
      closeBtnId: "close-avengers-popup",
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
