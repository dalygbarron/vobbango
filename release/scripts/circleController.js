var moveSpeed = 100;
var angle = 0;

var bullets = state.createBulletGroup(caller,100,40,'blood1');
var otherBullets = state.createBulletGroup(caller,50,30,'blood2');

var player = state.player;
var xOffset = caller.body.width / 2;


var thickCircle = new Periodic(90,function()
{
  bullets.fire(caller.body.x + xOffset,caller.body.y,player.body.x - caller.body.x,player.body.y - caller.body.y,angle);
});

var thinCircle = new Periodic(300,function()
{
  otherBullets.fire(caller.body.x,caller.body.y,0,0,angle);
});


while (angle < 50)
{
  var elapsed = yield(null);
  angle += elapsed / 150;
  thickCircle.update(elapsed);
  thinCircle.update(elapsed);
}


bullets.destroy();
thinCircle.period /= 2;

while (true)
{
  var elapsed = yield(null);
  thinCircle.update(elapsed);
}
