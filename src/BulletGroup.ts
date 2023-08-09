module Scumbag {
  let num = 0;

  export class BulletGroup extends Phaser.Group {
    master: Actor;
    speed:  number;
    sound:  string;
    lastSound: number;

    /** creates a bullet group. game is the game, parent is the group this group goes into
     * master is the owner of the bullets, speed is the speed of the bullets, size is the
     * number of bullets, key is the key to the bullet graphics, and sound is the key to
     * the firing sound */
    constructor(
      game: Phaser.Game,
      parent: Phaser.Group,
      master: Actor,
      speed: number,
      size: number,
      key: string,
      sound: string
    ) {
      super(game,parent,(num++).toString(),false,true,Phaser.Physics.ARCADE);
      this.master = master;
      this.speed = speed;
      this.sound = sound;
      this.lastSound = this.game.time.now;
      //create the bullet pool
      for (let i = 0; i < size; i++) {
        let bullet = new Bullet(game,key);
        this.add(bullet,true);
        bullet.body.setCircle(bullet.width / 4,bullet.width / 4,bullet.height / 4);
        bullet.alive = false;
      }
    }

    /**
     * Tries to play the bullet sound if it hasn't already been played this
     * frame and it exists.
     */
    doSound(): void {
      if (this.sound == null) return;
      let currentTime = this.game.time.now;
      if (currentTime > this.lastSound) {
        this.lastSound = currentTime;
        this.game.sound.play(this.sound);
      }
    }

    /**
     * Fires a bullet using the default bullet speed.
     * @param x x start position.
     * @param y y start position.
     * @param gx x acceleration.
     * @param gy y acceleration.
     * @param angle angle of movement.
     * @returns the created bullet if it was.
     */
    fire(
      x: number,
      y: number,
      gx: number,
      gy: number,
      angle: number
    ): Bullet|null {
      if (!Util.onScreen(x, y, this.game)) return null;
      this.doSound();
      let bullet = this.getFirstExists(false);
      if (bullet != null) bullet.fire(x, y, angle, this.speed, gx, gy);
      return bullet;
    }

    /**
     * Fires a bullet at a custom speed using angular velocity description.
     * @param x x starting position.
     * @param y y starting position.
     * @param angle angle to move in.
     * @param speed speed to move at.
     * @param gx x axis acceleration to add.
     * @param gy y axis acceleration to add.
     * @returns the created bullet or null if it could not be done.
     */
    fireAtSpeed(x, y, angle, speed, gx = 0, gy = 0): Bullet|null {
      if (x < this.game.camera.x - this.game.camera.width / 2 ||
          x > this.game.camera.x + this.game.camera.width + this.game.camera.width / 2 ||
          y < this.game.camera.y - this.game.camera.height / 2 ||
          y > this.game.camera.y + this.game.camera.height + this.game.camera.height / 2)
      {
        return null;
      }
      this.doSound();
      let bullet = this.getFirstExists(false);
      if (bullet != null) bullet.fire(x,y,angle,speed,gx,gy);
      return bullet;
    }

    /**
     * Quickly fades out all bullets in the group then deletes them.
     */
    clear(): void {
      this.forEachAlive(
        function(bullet) {
          let tween = this.game.add.tween(bullet).to(
            {alpha: 0},
            300,
            Phaser.Easing.Default,
            true
          );
          tween.onComplete.add(function(){this.kill()}, bullet);
        },
        this
      );
    }
  }
};
