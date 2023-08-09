#include "theatre.js"

while (true) {
  yield* awaitCollision();
  state.buildPause("Savepoint", "Save", "Return Home", "Don't Save");
  yield;
  if (state.guiValue == 1) {
    yield* awaitSeperation();
    controller.saveGame();
    controller.playSound("charge");
  } else if (state.guiValue == 2) {
    controller.transport("next","start");
    yield;
  }
  yield* awaitSeperation();
}
