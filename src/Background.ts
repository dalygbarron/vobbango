module Scumbag
{

  /** gets the data for a specific background and puts an informative error to the console
   * if that fucks up.
   * key is the name of the background, and data is the whole background data object */
  function getBackgroundData(key:string,data:any):any
  {
    for (let i = 0;i < data.backgrounds.length;i++)
    {
      if (data.backgrounds[i].name == key) return data.backgrounds[i];
    }
    console.error("couldn't find background with name "+key);
  }


  /** a background that is described in json and consists of various scrolling
   * tilesprites */
  export class Background
  {
    images:        Phaser.TileSprite[] = [];
    data:          any;
    game:          Phaser.Game;
    time:          number = 0;

    /** yeah just the usual stuff
     * imageKey is the image to use
     * width is the width of the level
     * height is the height of the level
     * game is the game thingo */
    constructor(key:string,game:Phaser.Game)
    {
      this.game = game;

      this.data = getBackgroundData(key,this.game.cache.getJSON("backgrounds"));
      for (let i = 0;i < this.data.content.length;i++)
      {
        let image = game.add.tileSprite(0,0,this.game.width,this.game.height,this.data.content[i].image);
        image.fixedToCamera = true;
        if (this.data.content[i].hasOwnProperty("speed"))
        {
          image.animations.add("move");
          image.animations.play("move",this.data.content[i].speed,true);
        }
        this.images.push(image);
      }
    }


    /** updates the background's position
     * cameraX is the x position of the camera
     * cameraY is the y position of the camera */
    update()
    {
      for (let i = 0;i < this.data.content.length;i++)
      {
        this.time += this.game.time.elapsedMS / 1000;
        this.images[i].tilePosition.x = (0 - this.game.camera.x) + this.time * this.data.content[i].x;
        this.images[i].tilePosition.y = (0 - this.game.camera.y)  + this.time * this.data.content[i].y;
      }
    }
  }
}
