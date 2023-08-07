function* say(name,text)
{
  state.buildTextbox(name,text);
  yield;
}
function* speak(text)
{
  state.buildTextbox(caller.properties.name,text);
  yield;
}
function* read(book,bookName)
{
  var content = ctx.state.tilemap.properties[book].split("-");
  for (var i = 0;i < content.length;i++)
  {
    yield* say(bookName,content[i].trim());
  }
}
function* watch()
{
  var dx = state.player.x - (caller.body.x + caller.body.width / 2);
  var dy = state.player.y - caller.y;
  var distance = Math.hypot(dx,dy);
  if (distance < caller.width) return;
  var x = caller.x;
  var y = caller.y;
  var angle = Math.atan2(state.player.y - caller.y,state.player.x - (caller.body.x + caller.body.width / 2));
  caller.body.velocity.x = Math.cos(angle);
  caller.body.velocity.y = Math.sin(angle);
  yield;
  caller.body.velocity.set(0);
  caller.x = x;
  caller.y = y;
  var elapsed = 0;
  while (elapsed < 200) elapsed += yield;
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
function* awaitCollision(meanwhile=null)
{
  var collision = caller.collision;
  while (true)
  {
    if (collision != caller.collision) break;
    else if (meanwhile != null)
    {
      yield;
      yield* meanwhile();
    }
    else yield;
  }
}
function* awaitSeperation()
{
  const GAP = 100;
  while (true)
  {
    var collision = caller.collision;
    var elapsed = 0;
    for (var elapsed = 0;elapsed < GAP;elapsed += yield);
    if (collision == caller.collision) break;
  }
}

var sections = caller.properties.text.split("~");
while (true)
{
  yield* awaitCollision(watch);
  for (var i = 0;i < sections.length;i++)
  {
    state.buildTextbox(caller.name,sections[i].trim());
    yield;
  }
  yield* awaitSeperation();
}
