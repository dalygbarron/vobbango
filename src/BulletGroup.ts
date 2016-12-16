module Scumbag
{
  let num = 0;

  export class BulletGroup extends Phaser.Group
  {
    master: Actor;
    speed:  number;
    sound:  string;

    constructor
    (
      game:Phaser.Game,parent:Phaser.Group,master:Actor,speed:number,size:number,
      key:string
    )
    {
      super(game,parent,(num++).toString(),false,true,Phaser.Physics.ARCADE);
      this.master = master;
      this.speed = speed;

      //create the bullet pool
      for (let i = 0;i < size;i++)
      {
        this.add(new Bullet(game,key),true);
      }
    }


    fire(x:number,y:number,gx:number,gy:number,angle:number)
    {
      if (this.sound != null) this.game.sound.play(this.sound);

      let bullet = this.getFirstExists(false);
      if (bullet != null) bullet.fire(x,y,angle,this.speed,gx,gy);
    }
  }
};
