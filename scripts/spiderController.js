#include "std.js"
caller.fighting = true;
while (caller.health > 0) yield* waitRandomMove(caller.properties.period);
