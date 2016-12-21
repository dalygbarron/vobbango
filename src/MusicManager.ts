module Scumbag
{
  /** the channels for music */
  export enum MusicChannel
  {
    Music,Ambience,NChannels
  }


  export namespace MusicManager
  {
    let game:               Phaser.Game;
    let currentSongKey:     string[]        = new Array<string>(MusicChannel.NChannels);
    let currentSong:        Phaser.Sound[]  = new Array<Phaser.Sound>(MusicChannel.NChannels);


    export function init(theGame:Phaser.Game):void
    {
      game = theGame;
    }

    /** play some song unless it's already playing */
    export function playSong(key:string,channel:MusicChannel):void
    {
      if (currentSongKey[channel] == key) return;
      if (currentSongKey[channel] != null)
      {
        game.sound.removeByKey(currentSongKey[channel]);
      }

      currentSongKey[channel] = key;
      currentSong[channel] = game.add.audio(key,1,true);
      currentSong[channel].play();
    }


    /** stops the currently playing song if there is one */
    export function stopSong(channel:MusicChannel):void
    {
      if (currentSong[channel] != null)
      {
        currentSong[channel].destroy();
        currentSongKey[channel] = null;
      }
    }

    export function fadeOut(time:number,channel:MusicChannel):void
    {
      if (currentSong[channel] != null)
      {
        currentSong[channel].fadeOut(time);
      }
    }
  }
}
