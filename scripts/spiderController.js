#include "wait.js"

caller.mode = Mode.FIGHTING;
while (caller.health > 0) yield* waitRandomMove(caller.properties.period);
