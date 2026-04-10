/**
 *
 * This file contains configuration values for the game.
 *
 */
export const GAME_WIDTH: number = import.meta.env.VITE_GAME_WIDTH || 480;
export const GAME_HEIGHT: number = import.meta.env.VITE_GAME_HEIGHT || 360;

type SceneKeys = "prototype";
export const SCENE_KEYS: Record<SceneKeys, string> = Object.freeze({
	prototype: "PROTOTYPE_LEVEL",
});
