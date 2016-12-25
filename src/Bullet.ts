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
      this.body.gravity.set(gx,gy);
    }

    /** changes the direction of the bullet
     * angle is the angle it changes to */
    redirect(angle:number,speed:number,gx:number=0,gy:number=0)
    {
      this.game.physics.arcade.velocityFromRotation(angle,speed,this.body.velocity);
      this.angle = angle;
      this.body.gravity.set(gx,gy);
    }


    update()
    {
      /** if it's out of the camera, end it */
      if (this.x < this.game.camera.x ||
          this.x > this.game.camera.x + this.game.camera.width ||
          this.y < this.game.camera.y ||
          this.y > this.game.camera.y + this.game.camera.height)
      {
        this.kill();
      }
    }
  }
}
