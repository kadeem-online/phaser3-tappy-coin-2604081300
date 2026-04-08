// third party imports
import Phaser from "phaser";

// local application imports
import * as CFG from "./config.ts";

function runGame(): Phaser.Game {
	const config: Phaser.Types.Core.GameConfig = {
		width: CFG.GAME_WIDTH,
		height: CFG.GAME_HEIGHT,

		parent: "game",

		scale: {
			mode: Phaser.Scale.FIT,
			autoCenter: Phaser.Scale.CENTER_BOTH,
		},
	};

	const game = new Phaser.Game(config);
	return game;
}

function onPageLoad() {
	runGame();
}

window.addEventListener("load", onPageLoad);
