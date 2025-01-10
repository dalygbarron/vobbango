function getAngleToPlayer()
{
  return Math.atan2(state.player.y - (caller.y),state.player.x - (caller.body.x + caller.body.width / 2));
}
function getFutureAngleToPlayer(bulletSpeed)
{
  var time = Math.hypot(state.player.x - (caller.body.x + caller.body.width / 2),state.player.y - (caller.y)) / bulletSpeed;
  return Math.atan2((state.player.y + time * state.scroll.y) - (caller.y),(state.player.x + time * state.scroll.x) - (caller.body.x + caller.body.width / 2));
}
function bulletAngleToPlayer(bullet)
{
  return Math.atan2(state.player.y - bullet.y,state.player.x - bullet.x);
}
function setSelfSwitch(name,value)
{
  ctx.setSwitch(ctx.state.tilemap.key+"-"+ctx.caller.name+"-"+name,value);
}
function getSelfSwitch(name)
{
  return ctx.getSwitch(ctx.state.tilemap.key+"-"+ctx.caller.name+"-"+name,value);
}
function compareArrays(a,b)
{
  if (a.length != b.length) return false;
  for (var i = 0 ;i < a.length;i++) if (a[i] != b[i]) return false;
  return true;
}
function createGun(x,y,key,moveSpeed=200,name="e")
{
  var data = {"key":key,"directional":false,"moveOnSpot":true,"health":1,
              "moveSpeed":moveSpeed,"controller":"gunController.js"};
  var gun = state.addDrone(x,y,name,{"properties":data});
  gun.targets = [];
  return gun;
}
function addTarget(gun,x,y)
{
  gun.targets.push({x:x,y:y});
}
function* waitGuns(guns)
{
  yield* wait(50);
  while (true)
  {
    var clean = true;
    for (var i in guns)
    {
      var speed = guns[i].body.speed;
      if (speed > 1 || speed < -1)
      {
        clean = false;
      }
    }
    if (clean) return;
    yield;
  }
}
function clearGuns(guns)
{
  for (var i in guns) guns[i].kill();
  guns.length = 0;
}
