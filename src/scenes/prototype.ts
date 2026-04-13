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

function create_player_input_zone(
	scene: Phaser.Scene,
): Phaser.GameObjects.Zone {
	const zone = new Phaser.GameObjects.Zone(
		scene,
		scene.scale.width / 2,
		scene.scale.height / 2,
		scene.scale.width,
		scene.scale.height,
	);

	const touchableArea = new Phaser.Geom.Rectangle(
		0,
		0,
		scene.scale.width,
		scene.scale.height,
	);
	zone.setInteractive(touchableArea, Phaser.Geom.Rectangle.Contains);

	return zone;
}

export default class PrototypeLevel extends Phaser.Scene {
	player!: Phaser.Physics.Arcade.Sprite;
	tapZone!: Phaser.GameObjects.Zone;

	constructor() {
		super(CFG.SCENE_KEYS.prototype);
	}

	create() {
		this.player = create_player(this);

		const playerStartPos = new Phaser.Math.Vector2(40, this.scale.height / 2);
		this.player.setPosition(playerStartPos.x, playerStartPos.y);
		this.player.setCollideWorldBounds(true);
		this.player.setGravityY(100);

		this.tapZone = create_player_input_zone(this);
		this.tapZone.on("pointerdown", this.handleTapZoneInput, this);
	}

	handleTapZoneInput() {
		const tapVelocity: number = -50;
		this.player.setVelocityY(tapVelocity);
		return;
	}
}
