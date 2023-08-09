#include "theatre.js"

while (!StateOfGame.s(caller.properties.switch)) {
    yield* awaitCollision();
    yield* speak(caller.properties.text);
    yield* awaitSeperation();
}