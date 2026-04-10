/**
 *
 * Prototype scene for base game idea
 *
 */

// third party imports
import Phaser from "phaser";

// local application imports
import * as CFG from "../config.ts";

function create_player(scene: Phaser.Scene): Phaser.Physics.Arcade.Sprite {
	const graphics = scene.add.graphics();
	graphics.fillStyle(0xefefef, 1);
	graphics.fillCircle(16, 16, 16);

	const texture_key: string = "TEMPORARY_CIRCLE_TEXTURE";
	graphics.generateTexture(texture_key, 32, 32);
	graphics.destroy();

	const player = scene.physics.add.sprite(0, 0, texture_key, 0);
	player.setCircle(16);
	return player;
}

export default class PrototypeLevel extends Phaser.Scene {
	player: Phaser.Physics.Arcade.Sprite;

	constructor() {
		super(CFG.SCENE_KEYS.prototype);
	}

	create() {
		this.player = create_player(this);

		const playerStartPos = new Phaser.Math.Vector2(40, this.scale.height / 2);
		this.player.setPosition(playerStartPos.x, playerStartPos.y);
		this.player.setCollideWorldBounds(true);
		this.player.setGravityY(20);
	}
}
