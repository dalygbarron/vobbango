module Scumbag
{
  export module StateOfGame
  {
    /** structure of a saved game's parameteres */
    export interface StateParameters {
      slot: number;
      switches: {[name: string]: boolean};
      variables: {[name: string]: number};
      characters: string[];
      map: string;
      playerKey: string;
      actors: {name: string, x: number, y: number}[];
      score: number;
      lives: number;
      time: number;
    }

    /** the game's persistent state */
    export let parameters: StateOfGame.StateParameters;

    export function flush() {
      parameters = {
        slot: 0,
        switches: {},
        variables: {},
        characters: [],
        map: "",
        playerKey: "",
        actors: new Array<{name: string, x: number, y: number}>(),
        score: 0,
        lives: 3,
        time: 0
      };
    }

    let timerFunction = 0;

    export function startTimer(): void {
      timerFunction = setInterval(function(){parameters.time++;parameters.score -= 0.135},1000);
    }


    export function stopTimer(): void {
      clearInterval(timerFunction);
    }


    /** save the data to the given slot */
    export function save(): void {
      let data = JSON.stringify(parameters);
      if (typeof(Storage) !== "undefined") {
        localStorage.setItem("save"+parameters.slot,data);
      } else {
        console.log("I'm afraid saving won't be possible in this browser, but" +
                    " here's what it was going to save:");
        console.log(data);
      }
    }


    /** load the data from the given slot */
    export function load(slot: number): void {
      if (typeof(Storage) !== "undefined") {
        let data = localStorage.getItem("save"+slot);
        if (data != null) {
          parameters = JSON.parse(data);
        } else {
          console.log("oing the other way")
          flush();
          parameters.slot = slot;
        }
      } else {
        console.log("I'm afraid loading won't be possible in this browser");
      }
      parameters.slot = slot;
    }

    /**
     * Gets or sets a switch. 
     * @param key the name of the switch to work with.
     * @param value is the value to set the switch to if it is provided, but if it
     *        is null then the value of the switch is just returned.
     * @returns the value of the switch after any potential changes are made.
     */
    export function s(key: string, value: boolean|null = null): boolean {
      if (value !== null) parameters.switches[key] = value;
      return parameters.switches[key];
    }

    /**
     * Like the s function but appends some crap to the key to make it local to
     * the map it is in. NOT local to the calling entity tho, just the map.
     * @param key is the local switch key.
     * @param value is a potential value to give it.
     * @returns the value of the local switch after changes.
     */
    export function ss(key: string, value: boolean|null = null): boolean {
      return s(`_${parameters.map}_${key}_`, value);
    }
  }
};
