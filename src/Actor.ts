///<reference path="phaser/phaser.d.ts"/>

module Scumbag
{
  export function createActor(game:Phaser.Game,data:any):Actor
  {
    /* generic enemy */
    if (data.properties.hasOwnProperty("type"))
    {
      let enemyData = Enemies.getEnemyData(data.properties.type,game);
      let actor = new Actor(game,data.x,data.y,name,enemyData.key,enemyData.controller,enemyData.health);
      actor.properties = enemyData;
      actor.script = game.cache.getText(enemyData.script);
      return actor;
    }

    /* bespoke artisanal enemy */
    let actor = new Actor(game,data.x,data.y,name,data.properties.key,data.properties.controller,data.properties.health);
    actor.properties = data.properties;
    actor.script = data.properties.script;
    return actor;
  }


  /** a fighter that will jump about and all that in the battle system */
  export class Actor extends Phaser.Sprite
  {
    name:       string;
    updating:   boolean   = true;
    strafing:   boolean   = false;
    fighting:   boolean   = false;
    heart:      Phaser.Sprite;
    halo:       Phaser.Sprite;
    moveOnSpot: boolean;
    controller: Controller;
    script:     string;
    properties: any;

    /** like a sprite, but also with tile width and height */
    constructor
    (
      game:Phaser.Game,x:number,y:number,name:string,key:string,controllerName:string,
      health:number
    )
    {
      //run superconstructor
      super(game,x,y,key);

      //set it's parameters
      this.name = name;
      this.health = health;

      //turn on physics
      this.game.physics.arcade.enable(this);
      this.body.collideWorldBounds = true;
      this.body.immovable = true;

      //set it's dimensions
      this.body.width = this.width / 5 * 4;
      this.body.height = this.height / 12 * 5;
      this.body.offset.x = this.width / 10;
      this.body.offset.y = this.height / 12 * 7;

      //do animation type crap
      this.anchor.setTo(0.5);
      this.animations.add('front',[0,1,2,3],10,true);
      this.animations.add('back',[4,5,6,7],10,true);

      //create it's heart
      this.heart = new Phaser.Sprite(game,0,0,"heart");
      this.game.physics.arcade.enable(this.heart);
      this.heart.anchor.setTo(0.5);
      this.heart.body.setCircle(this.heart.width / 9,this.heart.width / 9 * 4,this.heart.height / 9 * 4);

      this.addChild(this.heart);
      this.heart.alpha = 0;

      //create it's controller
      this.controller = new Controller(game,controllerName,this);

      //add it to the scene
      game.add.existing(this);
    }


    /** overrides Phaser.Sprite.update() */
    update()
    {
      if (!(this.updating && this.alive))
      {
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
        if (!this.moveOnSpot) this.animations.stop();
        return;
      }


      //if it's out of the camera, restore it's health
      /** if it's out of the camera, end it */
      if (this.x < this.game.camera.x ||
          this.x > this.game.camera.x + this.game.camera.width ||
          this.y < this.game.camera.y ||
          this.y > this.game.camera.y + this.game.camera.height)
      {
        this.health = this.properties.health;
      }



      //run the controller, and kill the actor if it's over
      if (this.controller.run(this.game.time.elapsedMS)) this.kill();

      //show or hide heart
      if (this.strafing) this.heart.alpha = 1;
      else this.heart.alpha = 0;

      //set the animation right
      let angle = Math.atan2(this.body.velocity.y,this.body.velocity.x);
      if
      (
        this.body.velocity.x != 0 || this.body.velocity.y != 0 || this.moveOnSpot
      )
      {
        if (!this.strafing) this.angle = angle;

        if ((this.animations.currentAnim.name == "front" ||
             this.animations.currentAnim.name == "back") ||
            this.animations.currentAnim.isFinished)
        {
          if (angle < 0) this.animations.play("back");
          else this.animations.play("front");
          if (Math.abs(angle) < Math.PI / 2) this.scale.x = 1;
          else if (Math.abs(angle) > Math.PI / 2) this.scale.x = -1;
        }
      }
      else if (this.animations.currentAnim.name == "front" ||
               this.animations.currentAnim.name == "back")
      {
        this.animations.stop();
      }
    }

    /** sets the actor's string on the current page */
    setKey(key:string):void
    {
      if (key == "") this.alpha = 0;
      else this.loadTexture(key);
    }

    /** overrides damage() so that it doesn't kill them */
    damage(amount:number):Actor
    {
      this.health -= amount;
      return this;
    }

    setHalo(key:string,nFrames:number,framerate:number,duration:number=1000)
    {
      if (this.halo != null) this.halo.destroy();
      this.halo = this.game.add.sprite(0,0,key);
      this.halo.anchor.set(0.5);
      let frames = [];
      for (let i = 0;i < nFrames;i++) frames.push(i);
      this.halo.animations.add("animation",frames,duration,true);
      this.halo.animations.play("animation");
      this.addChild(this.halo);
      this.halo.alpha = 0;
      this.game.add.tween(this.halo).to({alpha:1},duration,Phaser.Easing.Default,true);
      this.halo.blendMode = PIXI.blendModes.MULTIPLY;
    }
  }
};
