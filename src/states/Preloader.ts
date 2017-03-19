/// <reference path="../phaser/phaser.d.ts"/>


module Scumbag
{
  export class Preloader extends Phaser.State
  {
    preloadBar: Phaser.Sprite;
    background: Phaser.Sprite;

    preload()
    {
      //Set up our preloader sprites
      this.preloadBar = this.add.sprite(0,0,'preloadBar');

      //set the preload bar as a preload bar
      this.load.setPreloadSprite(this.preloadBar);

      //Load our actual games assets
      this.game.load.pack("main","pack.json");
      this.game.load.pack("sprites","spritePack.json");
      this.game.load.pack("scripts","scriptPack.json");
      this.game.load.json("animations","animations.json");
      this.game.load.json("enemies","data/enemies.json");
      this.game.load.json("credits","data/credits.json");
      this.game.load.json("backgrounds","data/backgrounds.json");
    }

    create()
    {
      var tween = this.add.tween(this.preloadBar).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
      tween.onComplete.add(this.startMainMenu, this);
    }

    startMainMenu()
    {
      this.game.state.start('MainMenu', true, false);
    }
  }
}
