/**
 *
 * Prototype scene for base game idea
 *
 */

// third party imports
import Phaser from "phaser";

// local application imports
import * as CFG from "../config.ts";

export default class PrototypeLevel extends Phaser.Scene {
	constructor() {
		super(CFG.SCENE_KEYS.prototype);
	}

	create() {
		this.cameras.main.setBackgroundColor("#ff6400");
	}
}
