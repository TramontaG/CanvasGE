import type { SoundManager } from "../../SoundManager";

const loadAudios = async (soundManager: SoundManager) => {
  await soundManager.loadSound(
    "test",
    new URL("../assets/minecraft_click.mp3", import.meta.url)
  );
  await soundManager.loadSound(
    "coin",
    new URL("../assets/coin.mp3", import.meta.url)
  );
};

export { loadAudios };
