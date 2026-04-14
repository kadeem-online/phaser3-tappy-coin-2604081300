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

class Obstacle extends Phaser.Physics.Arcade.Image {
	declare body: Phaser.Physics.Arcade.Body;

	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		texture: string | Phaser.Textures.Texture,
		frame: string | number,
	) {
		super(scene, x, y, texture, frame);
	}
}

/**
 * helper function that generates the temporary obstacle texture and registers
 * it in the scene.
 *
 * @param {Phaser.Scene} scene - The scene the pool manager will be instantiated
 * into.
 */
function obstacle_pool_manager_register_temporary_texture(
	scene: Phaser.Scene,
): string {
	const OBSTACLE_TEXUTRE_KEY: string = "TEMPORARY_OBSTACLE_TEXTURE";

	if (scene.textures.exists(OBSTACLE_TEXUTRE_KEY)) {
		return OBSTACLE_TEXUTRE_KEY;
	}

	const TEXTURE_WIDTH = 32;
	const TEXTURE_HEIGHT = scene.scale.height;

	const texture = scene.add.graphics();
	texture.fillStyle(0xff0000, 1);
	texture.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);

	texture.generateTexture(OBSTACLE_TEXUTRE_KEY, TEXTURE_WIDTH, TEXTURE_HEIGHT);
	texture.destroy();

	return OBSTACLE_TEXUTRE_KEY;
}

/**
 * Helper function that handles any actions that need to be taken on newly
 * created objects in the group.
 */
function obstalce_pool_manager_create_callback(
	obstacle: Phaser.GameObjects.GameObject,
) {
	if (obstacle instanceof Obstacle) {
		obstacle.setVisible(false);
		obstacle.setActive(false);
		obstacle.body.enable = false;
		obstacle.body.setImmovable(true);
	}

	return;
}

class ObstaclePoolManager extends Phaser.Physics.Arcade.Group {
	constructor(scene: Phaser.Scene) {
		const KEY: string = obstacle_pool_manager_register_temporary_texture(scene);
		const MAX_POOL_SIZE: number = 30;

		super(scene.physics.world, scene, {
			classType: Obstacle,
			key: KEY,
			maxSize: MAX_POOL_SIZE,
			active: false,
			visible: false,
			quantity: 0,
			createCallback: obstalce_pool_manager_create_callback,
		});
		this._generate_obstacle_texture();
	}

	/**
	 * Creates the temporary obstacle texture if it does not yet exist.
	 */
	_generate_obstacle_texture() {}
}

export default class PrototypeLevel extends Phaser.Scene {
	player!: Phaser.Physics.Arcade.Sprite;
	tapZone!: Phaser.GameObjects.Zone;
	obstaclePool!: ObstaclePoolManager;

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

		this.obstaclePool = new ObstaclePoolManager(this);
	}

	handleTapZoneInput() {
		const tapVelocity: number = -50;
		this.player.setVelocityY(tapVelocity);
		return;
	}
}
