// third party imports
import Phaser from "phaser";

// local application imports
import * as CFG from "./config.ts";
import PrototypeLevel from "./scenes/prototype.ts";

function runGame(): Phaser.Game {
	const scene_list: Array<Phaser.Types.Scenes.SceneType> = [PrototypeLevel];

	const config: Phaser.Types.Core.GameConfig = {
		width: CFG.GAME_WIDTH,
		height: CFG.GAME_HEIGHT,

		parent: "game",

		scale: {
			mode: Phaser.Scale.FIT,
			autoCenter: Phaser.Scale.CENTER_BOTH,
		},
		scene: scene_list,
	};

	const game = new Phaser.Game(config);
	return game;
}

function onPageLoad() {
	runGame();
}

window.addEventListener("load", onPageLoad);
