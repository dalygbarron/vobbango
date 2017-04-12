#include "theatre.js"

while (true)
{
  yield* awaitCollision();
  state.buildPause("Savepoint","Save","Don't Save");
  yield;


  console.log(state.guiValue);

  if (state.guiValue == 1)
  {
    controller.saveGame();
    controller.playSound("charge");
  }
  yield* awaitSeperation();
}
