#ifndef WAIT_H
#define WAIT_H

#include "std.js"

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


/** wait for caller to move to a location */
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


/** wait for caller to move randomly for a set period of time */
function* waitRandomMove(time)
{
  var angle = Math.random() * Math.PI * 2 - Math.PI;
  caller.body.velocity.x = Math.sin(angle) * caller.properties.moveSpeed;
  caller.body.velocity.y = Math.cos(angle) * caller.properties.moveSpeed;
  yield* wait(time);
}


/** wait for caller to move randomly for a certain amount of time, unless he goes too
 * far from home in which case he returns to it */
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


/** wait for caller to move into a region */
function* waitMoveToRegion(region)
{
  var region = state.regions[region];
  var x = region.x + region.width / 2;
  var y = region.y + region.height / 2;
  yield* waitMove(x,y);
  caller.body.velocity.set(0);
}


/** waits for some bullet groups to have all their bullets gone */
function* waitBullets()
{
  while (true)
  {
    var clean = true;
    for (var i in arguments) if (arguments[i].countLiving() > 0) clean = false;
    if (clean) return;
    yield;
  }
}


/** tells you if a value is close to a target, within the margin */
function close(value,target,margin)
{
  margin = Math.abs(margin);
  return ((value >= target - margin) && (value <= target + margin));
}


#endif
