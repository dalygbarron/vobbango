namespace Scumbag
{
  const generatorConstructor = Object.getPrototypeOf(function*(){}).constructor;

  /** main controller for actors that controls them on a frame to frame basis */
  export class Controller
  {
    script: Iterator<any>;

    /** builds the controller and lets it access the scnee */
    constructor(game:Phaser.Game,scriptName:string,caller:Actor)
    {
      this.script = generatorConstructor("state","caller",game.cache.getText("stdScript")+
                                         game.cache.getText(scriptName))
                                         (game.state.getCurrentState(),caller);
    }


    run(elapsed:number)
    {
      this.script.next(elapsed);
    }
  }
};
