ctx.state.buildPause("Savepoint","Save","Don't Save");
var value = yield;
if (value == 1)
{
  ctx.saveGame();
  ctx.playSound("trogDeath");
}
