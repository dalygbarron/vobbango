module Scumbag
{
  let num = 0;

  export class BulletGroup extends Phaser.Group
  {
    master: Actor;
    speed:  number;
    sound:  string;

    /** creates a bullet group. game is the game, parent is the group this group goes into
     * master is the owner of the bullets, speed is the speed of the bullets, size is the
     * number of bullets, key is the key to the bullet graphics, and sound is the key to
     * the firing sound */
    constructor
    (
      game:Phaser.Game,parent:Phaser.Group,master:Actor,speed:number,size:number,
      key:string,sound:string
    )
    {
      super(game,parent,(num++).toString(),false,true,Phaser.Physics.ARCADE);
      this.master = master;
      this.speed = speed;
      this.sound = sound;

      //create the bullet pool
      for (let i = 0;i < size;i++)
      {
        let bullet = new Bullet(game,key);
        this.add(bullet,true);
        bullet.body.setCircle(bullet.width / 4,bullet.width / 4,bullet.height / 4);
      }
    }


    fire(x:number,y:number,gx:number,gy:number,angle:number):Bullet
    {
      if (this.sound != null) this.game.sound.play(this.sound);
      let bullet = this.getFirstExists(false);
      if (bullet != null) bullet.fire(x,y,angle,this.speed,gx,gy);
      return bullet;
    }


    fireAtSpeed(x,y,angle,speed):Bullet
    {
      if (this.sound != null) this.game.sound.play(this.sound);
      let bullet = this.getFirstExists(false);
      if (bullet != null) bullet.fire(x,y,angle,speed,0,0);
      return bullet;
    }
  }
};
