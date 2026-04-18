/**
 *
 * Prototype scene for base game idea
 *
 */

// third party imports
import Phaser from "phaser";

// local application imports
import * as CFG from "../config.ts";

type ArcadeColliderObject =
	| Phaser.Types.Physics.Arcade.GameObjectWithBody
	| Phaser.Physics.Arcade.Body
	| Phaser.Physics.Arcade.StaticBody
	| Phaser.Tilemaps.Tile;

function create_player(scene: Phaser.Scene): Phaser.Physics.Arcade.Sprite {
	const graphics = scene.add.graphics();
	graphics.fillStyle(0xefefef, 1);
	graphics.fillCircle(16, 16, 16);

	const texture_key: string = "TEMPORARY_CIRCLE_TEXTURE";
	graphics.generateTexture(texture_key, 32, 32);
	graphics.destroy();

	const player = scene.physics.add.sprite(0, 0, texture_key, 0);
	player.setCircle(16);
	player.body.onWorldBounds = true;

	player.setData("isAlive", false);
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

	/**
	 * Utility function that activates an obstacle. Only enables the obstacle and
	 * its physics body in the scene. NOTE: should not actively apply effects such
	 * as velocity, gravity and accelaration.
	 */
	activate() {
		this.setActive(true);
		this.setVisible(true);
		this.body.setEnable(true);
	}

	/**
	 * Utility function that deactivates an obstacle. Only disable the obstacle and
	 * its physics body in the scene. NOTE: this method clears any active velocity
	 * and accelaration on the body
	 */
	deactivate() {
		this.setActive(false);
		this.setVisible(false);
		this.body.setEnable(false);
		this.body.reset(0, 0);
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
			defaultKey: KEY,
			maxSize: MAX_POOL_SIZE,
			active: false,
			visible: false,
			quantity: 0,
			createCallback: obstalce_pool_manager_create_callback,
		});
	}

	/**
	 * Returns a text description of the ObstaclePoolManger's maximum size,
	 * current size, number of active items and number of inactive items.
	 *
	 * @returns {string}
	 */
	describe(): string {
		const maxSize = this.maxSize;
		const currentSize = this.getLength();
		const currentActive = this.countActive(true);
		const currentInactive = this.countActive(false);

		return (
			`MaxSize: ${maxSize}, CurrentSize: ${currentSize}, Active: ` +
			`${currentActive}, Inactive: ${currentInactive}`
		);
	}
}

class PrototypeEventManager extends Phaser.Events.EventEmitter {
	static #instance: PrototypeEventManager;

	private constructor() {
		super();
	}

	public static get_instance(): PrototypeEventManager {
		if (!PrototypeEventManager.#instance) {
			PrototypeEventManager.#instance = new PrototypeEventManager();
		}

		return PrototypeEventManager.#instance;
	}

	destroy() {
		super.destroy();
	}
}

type GameStates = "PRE_GAME" | "RUNNING" | "POST_GAME";

export default class PrototypeLevel extends Phaser.Scene {
	player!: Phaser.Physics.Arcade.Sprite;
	tapZone!: Phaser.GameObjects.Zone;
	obstaclePool!: ObstaclePoolManager;
	gameState: GameStates = "PRE_GAME";
	eventManager: PrototypeEventManager;
	obstacleDespawner!: Phaser.Physics.Arcade.StaticBody;

	constructor() {
		super(CFG.SCENE_KEYS.prototype);
		this.eventManager = PrototypeEventManager.get_instance();
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

		// create collider for destroying obstacles
		this.obstacleDespawner = this.physics.add.staticBody(
			10,
			0,
			32,
			this.scale.height,
		);
		this.physics.add.collider(
			this.obstacleDespawner,
			this.obstaclePool,
			this.handleObstacleDespawn,
			undefined,
			this,
		);

		this.physics.world.on(
			"worldbounds",
			this.handleWorldBoundsCollisions,
			this,
		);

		this.eventManager.on("gamestatechange", this.handleGameStateChange, this);

		// start game
		this.setGameState("RUNNING");
	}

	/**
	 * Handler for the game state changes of the 'gamestatechange' event attached
	 * to the eventManager.
	 *
	 * @param {GameStates} prevState - the last game state.
	 * @param {GameState} currentState - the new current game state.
	 */
	handleGameStateChange(prevState: GameStates, currentState: GameStates) {
		switch (currentState) {
			case "PRE_GAME":
				this.handleGameState_PRE_GAME(prevState);
				break;

			case "RUNNING":
				this.handleGameState_RUNNING(prevState);
				break;

			case "POST_GAME":
				this.handleGameState_POST_GAME(prevState);
				break;

			default:
				break;
		}

		// DEBUG
		if (import.meta.env.VITE_GAME_DEBUG === "true") {
			console.log(
				`new game state: ${currentState}, last game state: ${prevState}`,
			);
		}

		return;
	}

	/**
	 * Handles entering the PRE_GAME game state.
	 *
	 * @param {GameStates} _previousState - the last game state.
	 */
	private handleGameState_PRE_GAME(_previousState: GameStates) {}

	/**
	 * Handles entering the POST_GMAE game state.
	 *
	 * @param {GameStates} _previousState - the last game state.
	 */
	private handleGameState_POST_GAME(_previousState: GameStates) {}

	/**
	 * Handles entering the RUNNING game state.
	 *
	 * @param {GameStates} _previousState - the last game state.
	 */
	private handleGameState_RUNNING(_previousState: GameStates) {
		this.startGame();
	}

	handleObstacleDespawn(
		_despawner: ArcadeColliderObject,
		obstacle: ArcadeColliderObject,
	) {
		if (!(obstacle instanceof Obstacle)) {
			return;
		}

		if (this.obstaclePool.contains(obstacle)) {
			this.obstaclePool.killAndHide(obstacle);
		}
		obstacle.body.reset(0, 0);
	}

	/**
	 * Handles all collisions with the world boundary by arcade physics bodies.
	 *
	 * @param {Phaser.Physics.Arcade.Body} body - the body colliding with the
	 * world bounds.
	 */
	handleWorldBoundsCollisions(
		body: Phaser.Physics.Arcade.Body,
		_up: boolean,
		_down: boolean,
		_left: boolean,
		_right: boolean,
	) {
		// handle player and world bounds collision.
		if (this.gameState === "RUNNING" && body.gameObject === this.player) {
			this.setGameState("POST_GAME");
			return;
		}
	}

	handleTapZoneInput() {
		// GUARD: only handle player movement if in RUNNING game state.
		if (this.gameState !== "RUNNING") {
			return;
		}

		const tapVelocity: number = -50;
		this.player.setVelocityY(tapVelocity);
		return;
	}

	/**
	 * Utility for changing the game state, emits a 'gamestatechange' event on
	 * the PrototypeLevel.eventManager event emitter.
	 *
	 * @param {GameStates} state
	 */
	setGameState(state: GameStates) {
		if (this.gameState === state) {
			return;
		}

		const prevState = this.gameState;
		const nextState = state;

		this.gameState = nextState;
		this.eventManager.emit("gamestatechange", prevState, nextState);
		return;
	}

	/**
	 *
	 * Handles any setup required before starting the main game loop;
	 *
	 */
	prepareGame() {
		const PlayerStartPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
			this.player.width * 1.5,
			this.scale.height / 2,
		);

		this.player.setPosition(PlayerStartPosition.x, PlayerStartPosition.y);
		this.player.setGravityY(0);
	}

	/**
	 * handles starting the main game loop.
	 */
	startGame() {
		const PlayerGravity: number = 100;

		this.player.setData("isAlive", true);
		this.player.setGravityY(PlayerGravity);

		this.spawnObstacles();
	}

	/**
	 *
	 * handles ending the main game loop.
	 *
	 */
	endGame() {
		this.player.setData("isAlive", false);
	}

	/**
	 * Handles obstacle spawning logic.
	 */
	spawnObstacles() {
		// variables
		const MINIMUM_GAP_SIZE: number = 64; // twice the player size
		const MAXIMUM_GAP_SIZE: number = 96; // three times the player size
		const MINIMUM_PADDING: number = 32; // minimum obstacle size at top|bottom
		const OBSTACLE_HEIGHT: number = this.scale.height; // height of each obstacle
		const OBSTACLE_SPEED: number = 20 * -1; // moving in the negative x direction
		const SPAWN_DELAY: number = 5000;

		// get spawn points
		const gap = Phaser.Math.Between(MINIMUM_GAP_SIZE, MAXIMUM_GAP_SIZE);
		/**
		 * Space taken up by the gap and minimum visibility for the top and bottom
		 * obstacles
		 */
		const reserved_space = MINIMUM_PADDING * 2 + gap;
		const leftover_space = this.scale.height - reserved_space;
		const top_space = Phaser.Math.Between(0, leftover_space);
		const bottom_space = leftover_space - top_space;

		const spawnX = this.scale.width - 20;
		const spawnY = {
			top: top_space + MINIMUM_PADDING - OBSTACLE_HEIGHT / 2,
			bottom:
				this.scale.height -
				MINIMUM_PADDING -
				bottom_space +
				OBSTACLE_HEIGHT / 2,
		};

		// create obstacles
		// place obstacles at their start position
		// add velocity to the obstacles
		const top: any = this.obstaclePool.getFirstDead(true);
		if (top instanceof Obstacle) {
			top.setPosition(spawnX, spawnY.top);
			top.activate();
			top.setVelocityX(OBSTACLE_SPEED);
		}

		const bottom: any = this.obstaclePool.getFirstDead(true);
		if (bottom instanceof Obstacle) {
			bottom.setPosition(spawnX, spawnY.bottom);
			bottom.activate();
			bottom.setVelocityX(OBSTACLE_SPEED);
		}

		// queue next obstacle spawn
		this.time.delayedCall(SPAWN_DELAY, this.spawnObstacles, [], this);

		console.log(this.obstaclePool.describe());
	}
}
