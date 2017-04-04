module Scumbag
{
  export namespace Util
  {
    /** returns 1 when the value is greater than one, otherwise it returns 0 */
    export function slow(value:{x:number,y:number}):void
    {
      if (value.x > 1) value.x = 1;
      else if (value.x < -1) value.x = -1;
      else value.x = 0;

      if (value.y > 1) value.y = 1;
      else if (value.y < -1) value.y = -1;
      else value.y = 0;
    }

    /** takes either an angle in degrees or a direction like left and turns it into
     * radians */
    export function evaluateDirection(direction:string):number
    {
      if (direction == "up") return Math.PI / 2;
      else if (direction == "left") return Math.PI;
      else if (direction == "down") return -1 * Math.PI / 2;
      else if (direction == "right") return 0;
      else return parseInt(direction);
    }

    /** tells you if a given point is now onscreen */
    export function onScreen(x,y,game)
    {
      return (x >= game.camera.x && x <= game.camera.x + game.camera.width &&
              y >= game.camera.y && y <= game.camera.y + game.camera.height);
    }

    export function range(min:number,max:number)
    {
      let list = [];
      for (let i = min;i <= max;i++) list.push(i);
      return list;
    }


    /**
     * a 2d point
     */
    export interface Point
    {
      x:number;
      y:number;
    }
  };
};
