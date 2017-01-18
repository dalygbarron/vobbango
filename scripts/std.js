#ifndef STD_H
#define STD_H
/** the standard library that all other scripts are appended to before they are
 * run */


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


function getX() {return caller.body.x + caller.body.width / 2}

function getY() {return caller.y}

function getAngleToPlayer()
{
  return Math.atan2(state.player.y - getY(),state.player.x - getX());
}


/** tells you if a value is close to a target, within the margin */
function close(value,target,margin)
{
  margin = Math.abs(margin);
  return ((value >= target - margin) && (value <= target + margin));
}


function* periodicSpray(bulletGroup,nBullets,spread,period,delay=0)
{
  while(true)
  {
    for (var i = 0;i < nBullets;i++)
    {
      poisonBullets.fire(getX(),getY(),0,0,getAngleToPlayer() + i * spread / nBullets - spread / 2);
      yield* wait(delay);
    }
    yield* wait(period);
  }
}




/** makes the actor wait until a certain amount of time has passed */
function* wait(time)
{
  var elapsed = 0;
  while (elapsed < time)
  {
    elapsed += yield;
  }
  return elapsed - time;
}


/** makes the actor wait until an animation has played to continue */
function* waitAnimation(name)
{
  caller.animations.play(name);
  while (!caller.animations.currentAnim.isFinished) yield;
}

function* waitEffect(x,y,name,nFrames,framerate)
{
  var effect = state.addEffect(x,y,name,nFrames,framerate);
  while (effect.alive) yield;
}



function* waitMove(x,y)
{
  while (true)
  {
    var elapsed = yield;
    if (close(getX(),x,caller.body.velocity.x * elapsed / 1000) &&
        close(getY(),y,caller.body.velocity.y * elapsed / 1000))
    {
      caller.x = x - caller.body.width / 2;
      caller.y = y;
      return;
    }
    var angle = Math.atan2(y - getY(),x - getX());
    caller.body.velocity.x = Math.cos(angle) * caller.properties.moveSpeed;
    caller.body.velocity.y = Math.sin(angle) * caller.properties.moveSpeed;
  }
}


function* waitRandomMove(time)
{
  var angle = Math.random() * Math.PI * 2 - Math.PI;
  caller.body.velocity.x = Math.sin(angle) * caller.properties.moveSpeed;
  caller.body.velocity.y = Math.cos(angle) * caller.properties.moveSpeed;
  yield* wait(time);
}


function* waitMoveNearPosition(time,x,y,maxDistance)
{
  var distance = Math.cos(Math.atan2(getY() - y,getX() - x)) * (getX() - x);
  if (distance < maxDistance)
  {
    var angle = Math.random() * Math.PI * 2 - Math.PI;
    caller.body.velocity.x = Math.sin(angle) * caller.properties.moveSpeed;
    caller.body.velocity.y = Math.cos(angle) * caller.properties.moveSpeed;
    yield* wait(time);
  }
  else
  {
    yield* waitMove(x,y);
  }
}


function* waitMoveToRegion(region)
{
  var region = state.regions[region];
  var x = region.x + region.width / 2;
  var y = region.y + region.height / 2;
  yield* waitMove(x,y);
  caller.body.velocity.set(0);
}


/** sets a unique switch for this actor that can hopefully not collide with
 * any other switch in the game */
function setSelfSwitch(name,value)
{
  ctx.setSwitch(ctx.state.tilemap.key+"-"+ctx.caller.name+"-"+name,value);
}

/** gets a unique switch for this actor that can hopefully not collide with
 * any other switch in the game */
function getSelfSwitch(name)
{
  return ctx.getSwitch(ctx.state.tilemap.key+"-"+ctx.caller.name+"-"+name,value);
}

/** tells you if two arrays have each element equal and are of equal length */
function compareArrays(a,b)
{
  if (a.length != b.length) return false;
  for (var i = 0 ;i < a.length;i++) if (a[i] != b[i]) return false;
  return true;
}


#endif
