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
      let input = InputManager.getInputDevice(0);
      this.script = generatorConstructor
      (
        "state","caller","input","Axis","Button","sound","music","Channel",
        game.cache.getText(scriptName)
      )(<Overworld>game.state.getCurrentState(),caller,input,Axis,Button,game.sound,MusicManager,MusicChannel);
    }


    /** runs the controller's script.
     * returns false normally, or true when the script is over */
    run(elapsed:number):boolean
    {
      return this.script.next(elapsed).done;
    }
  }
};
