#ifndef THEATRE_H
#define THEATRE_H

/** builds a textbox where name is the speaker's name, chip is the chip graphic,
 * and text is the text in the textbox */
function* say(name,chip,text)
{
  state.buildTextbox(name,text,chip);
  yield;
}


/** like say, but uses info from the caller to guess the name and chip and stuff */
function* speak(mood,text)
{
  state.buildTextbox(caller.properties.name,text,caller.properties.name+"_"+mood);
  yield;
}


/** reads out the contents of the book property belonging to the actor denoted
 * by name */
function* read(book,bookName,bookChip)
{
  var content = ctx.state.tilemap.properties[book].split("-");
  for (var i = 0;i < content.length;i++)
  {
    yield* say(bookName,bookChip,content[i].trim());
  }
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

#endif
