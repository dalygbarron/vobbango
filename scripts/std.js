#ifndef STD_H
#define STD_H

/** get the horizontal position of caller */
#define getX() (caller.body.x + caller.body.width / 2)

/** get the vertical position of caller */
#define getY() (caller.y)

/** gets the angle from caller to the player */
function getAngleToPlayer()
{
  return Math.atan2(state.player.y - getY(),state.player.x - getX());
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
