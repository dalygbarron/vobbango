#include "theatre.js"

var sections = caller.properties.text.split("~");

while (true)
{
  yield* awaitCollision();
  for (var i = 0;i < sections.length;i++)
  {
    state.buildTextbox(caller.name,sections[i].trim());
    yield;
  }
  yield* awaitSeperation();
}
