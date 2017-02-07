#include "wait.js"

state.addEnemy(caller);
while (caller.health > 0) yield* waitRandomMove(caller.properties.period);
state.removeEnemy(caller);
