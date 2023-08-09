#ifndef THEATRE_H
#define THEATRE_H

/** builds a textbox where name is the speaker's name, chip is the chip graphic,
 * and text is the text in the textbox */
function* say(name,text) {
  state.buildTextbox(name,text);
  yield;
}

/** like say, but uses info from the caller to guess the name and chip and stuff */
function* speak(text) {
  state.buildTextbox(caller.properties.name || caller.name, text);
  yield;
}

/**
 * Basic ass binary question asker that asks a yes no question and gives you a
 * boolean for a response.
 * @param string text 
 * @returns boolean true iff the answer was true and false otherwise.
 */
function* binaryQuestion(text) {
  state.buildPause(text, "Yes", "NO NO PLEASE AAHHHHH");
  yield;
  return state.guiValue == 1;
}


/** reads out the contents of the book property belonging to the actor denoted
 * by name */
function* read(book,bookName)
{
  var content = ctx.state.tilemap.properties[book].split("-");
  for (var i = 0;i < content.length;i++)
  {
    yield* say(bookName,content[i].trim());
  }
}

/** make the actor look at the player */
function* watch()
{
  const x = caller.x;
  const y = caller.y;
  const dx = state.player.x - (x + caller.body.width / 2);
  const dy = state.player.y - y;
  const distance =  1 / (Math.hypot(dx,dy) * 1000);
  caller.body.velocity.x = dx * distance;
  caller.body.velocity.y = dy * distance;
  yield;
  caller.body.velocity.set(0);
  caller.x = x - dx * distance * 0.1;
  caller.y = y - dy * distance * 0.1;
  for (let i = 0; i < 10; i++) yield;
}


function* goSpooky(time)
{
  var totalTime = 0;
  while (totalTime < time)
  {
    totalTime += yield;
    var alpha = 1 - totalTime / time;
    if (alpha < 0) alpha = 0;
    for (var i = 1;i < state.tilemap.layers.length - 1;i++)
    {
      state.tilemap.forEach
      (
        function(tile)
        {
          tile.alpha = alpha;
        },this,0,0,state.tilemap.width,state.tilemap.height,i
      );
      state.tilemap.layers[i].dirty = true;
    }
  }
}

function* endSpooky(time)
{
  var totalTime = 0;
  while (totalTime < time)
  {
    totalTime += yield;
    var alpha = totalTime / time;
    if (alpha > 1) alpha = 1;
    for (var i = 1;i < state.tilemap.layers.length;i++)
    {
      state.tilemap.forEach
      (
        function(tile)
        {
          tile.alpha = alpha;
        },this,0,0,state.tilemap.width,state.tilemap.height,i
      );
      state.tilemap.layers[i].dirty = true;
    }
  }
}

function* awaitCollision(meanwhile = null) {
  var collision = caller.collision;
  while (true) {
    if (collision != caller.collision) break;
    else if (meanwhile != null) {
      yield;
      yield* meanwhile();
    }
    else yield;
  }
}

function* awaitSeperation() {
  const GAP = 100;
  while (true) {
    var collision = caller.collision;
    var elapsed = 0;
    for (var elapsed = 0;elapsed < GAP;elapsed += yield);
    if (collision == caller.collision) break;
  }
}

#endif
