type Audio = {
  buffer: AudioBuffer;
  volume: number;
  tags: string[];
};

type AudioPlayOptions = {
  volume?: number;
  loop?: boolean;
  playbackRate?: number;
  /** wait time in seconds before playing the sound */
  wait?: number;
  /** Audio start time offset in seconds */
  start?: number;
  /** Audio end time in seconds */
  end?: number;
  /** how long to play the sound. Takes precedence over
   *  end if both are provided
   */
  duration?: number;
};

class SoundManager {
  private sounds: Record<string, Audio> = {};
  public active: boolean = false;

  private context = new AudioContext();
  public masterGain = this.context.createGain();

  constructor() {}

  /**
   * Has to be called whenever the user clicks something or hits a key
   * to unlock the audio context. Browsers require this to prevent
   * autoplaying sounds.
   */
  async unlock() {
    this.masterGain.connect(this.context.destination);

    if (this.context.state !== "running") {
      await this.context.resume();
      this.active = true;
    }
  }

  setMasterGain(volume: number) {
    // Avoid negative volumes
    this.masterGain.gain.value = Math.max(0, volume);
  }

  getMasterGain() {
    return this.masterGain.gain.value;
  }

  getLoadedSounds() {
    return this.sounds;
  }

  setSoundVolume(sound: string, volume: number) {
    const audioEntry = this.sounds[sound];
    if (!audioEntry) {
      throw new Error(
        `Tried to set volume of sound ${sound} but it was not loaded into the library`
      );
    }

    audioEntry.volume = Math.max(0, volume);
  }

  getSoundVolume(sound: string) {
    const audioEntry = this.sounds[sound];
    if (!audioEntry) {
      throw new Error(
        `Tried to set volume of sound ${sound} but it was not loaded into the library`
      );
    }

    return audioEntry.volume;
  }

  async loadSound(name: string, url: URL, tags: string[] = []) {
    const res = await fetch(url.toString());

    if (!res.ok) {
      throw new Error(
        `Failed to fetch audio ${name}: ${res.status}-${res.statusText}`
      );
    }

    const arrayBuffer = await res.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);

    this.sounds[name] = {
      buffer: audioBuffer,
      volume: 1,
      tags,
    };
  }

  playSound(name: string, options: AudioPlayOptions = {}) {
    // This will work only if the sonud was triggered by a
    // User interaction.
    if (!this.active) {
      this.unlock();
    }
    const audioEntry = this.sounds[name];

    if (!audioEntry) {
      throw new Error(
        `Tried to play sound ${name} but it was not found in the library`
      );
    }

    const { buffer, volume } = audioEntry;

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = options.loop ?? false;
    source.playbackRate.value = options.playbackRate ?? 1;

    const gain = this.context.createGain();
    gain.gain.value = Math.max(0, options.volume ?? volume);

    source.connect(gain);
    gain.connect(this.masterGain);

    const waitTime = options.wait ?? 0;
    const audioStart = options.start ?? 0;
    const audioDuration = (() => {
      if (options.duration) {
        return options.duration;
      } else if (options.end) {
        return options.end - (options.start ?? 0);
      } else {
        return undefined;
      }
    })();

    // one try-catch for each disconnect to avoid one failing to stop the others
    const onEnd = () => {
      try {
        source.disconnect();
      } catch {}
      try {
        gain.disconnect();
      } catch {}
    };

    source.onended = onEnd;
    source.start(
      this.context.currentTime + waitTime,
      audioStart,
      audioDuration
    );

    return {
      stop: () => {
        try {
          source.stop();
        } catch (e) {}
        onEnd();
      },
    };
  }
}

export { SoundManager, type AudioPlayOptions, type Audio };
