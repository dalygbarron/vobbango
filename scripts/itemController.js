#include "theatre.js"

const switchName = `got_${caller.name}`;

if (!StateOfGame.s(switchName)) {
    yield* awaitCollision();
    yield* speak(`Got ${caller.name}!!!!! yeeeaaahhh abbbabby`);
    StateOfGame.s(switchName, true);
}