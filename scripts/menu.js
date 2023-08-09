const CREDIT_MESSAGE = `Hello and welcome to my the new EXPANSION pack to the
greatest game of the early 21st century. Vobbangora Gorad Dortsars: THE DOGS
ARE COMING OUT OF THE WATER. My name is DANY BURTON AND I AM BACK.
Yes I have been hardening my brain in the hottest forges of HELL. BUT I AM BACK.
This game is dedicated to all freaks, degenerates, bastards, swinepigs and
moths.`;

function *load() {
  state.buildSlot();
  yield;
  if (state.guiValue >= 1 && state.guiValue <= 3) {
    controller.loadGame(state.guiValue);
    if (controller.getCharacters().length == 0) {
      controller.setSlot(state.guiValue);
      controller.addCharacter("stasbangoraKebabom");
      controller.transport("next","start");
    } else {
      controller.toOverworld();
    }
  }
}

function *credits() {
  state.buildTextbox("Dany Burton",CREDIT_MESSAGE,"dany_n");
  yield;
}

function *deleting() {
  state.buildSlot(true);
  yield;
  if (state.guiValue >= 2 && state.guiValue <= 4) {
    controller.setSlot(state.guiValue - 1);
    controller.saveGame();
    state.buildTextbox("Deleted","Slot "+controller.getSlot()+" deleted!",null);
    yield;
  }
}

while (true) {
  state.buildQA(
    "Vobangora Gorad Dortsars: Vaedsom Gedarmem Somoarse",
    null,
    "Play",
    "A game by Dany Burton",
    "Delete Saves"
  );
  yield;
  if (state.guiValue == 1) {
    yield* load();
  } else if (state.guiValue == 2) {
    yield* credits();
  } else if (state.guiValue == 3) {
    yield* deleting();
  }
}