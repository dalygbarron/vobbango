module Scumbag
{
  /** a bullet that gets shot about the place and stuff */
  export class Bullet extends Phaser.Sprite
  {
    /** constructs the bullet */
    constructor(game:Phaser.Game,key:string)
    {
      super(game,0,0,key);
      this.anchor.set(0.5);
      this.exists = false;
    }


    /** Fires the bullets so that it is back in the game
     * x and y are it's position to start at
     * angle is the angle it is fired at
     * speed is the speed it moves at
     * gx and gy are the gravity that affect it */
    fire(x:number,y:number,angle:number,speed:number,gx:number,gy:number)
    {
      this.reset(x,y);

      this.game.physics.arcade.velocityFromRotation(angle,speed,this.body.velocity);
      this.angle = angle;
      this.rotation = angle;
      this.alpha = 1;
      this.body.gravity.set(gx,gy);
      this.body.collideWorldBounds = true;
      this.body.onWorldBounds = new Phaser.Signal();
      this.body.onWorldBounds.add(this.kill,this);
    }

    /** changes the direction of the bullet
     * angle is the angle it changes to */
    redirectWithSpeed(angle:number,speed:number,gx:number=0,gy:number=0)
    {
      this.game.physics.arcade.velocityFromRotation(angle,speed,this.body.velocity);
      this.angle = angle;
      this.rotation = angle;
      this.body.gravity.set(gx,gy);
    }

    redirect(angle)
    {
      let speed = Math.hypot(this.body.velocity.x,this.body.velocity.y);
      this.game.physics.arcade.velocityFromRotation(angle,speed,this.body.velocity);
      this.angle = angle;
      this.rotation = angle;
    }


    update()
    {
    }
  }
}
