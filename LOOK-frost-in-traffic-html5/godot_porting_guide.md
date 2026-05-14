# Frost in Traffic - Godot 4 Porting Guide

Godot's node-based architecture is a fantastic fit for **Frost in Traffic**. This guide explains how to translate the final JS prototype into Godot 4 GDScript.

## 1. Project Setup
- **Renderer:** Forward+ or Compatibility (2D).
- **Window Size:** Set display to 800x600. Set Stretch Mode to `viewport` to keep the pixel-perfect aesthetic.
- **TileMap:** Use a `TileMap` node with a `TileSet` of 40x40 pixels for the background.

## 2. Node Architecture Translation

### `Game.js` $\rightarrow$ `GameManager` (Autoload / Singleton)
- Create a script `GameManager.gd` and add it to **Project Settings -> Autoload**.
- **Responsibilities:**
  - Store global state variables: `enum GameState { MENU, PLAYING, GAMEOVER }`
  - Provide signals: `signal game_state_changed(new_state)`

### `WorldManager.js` $\rightarrow$ `Level` Node
- The JS prototype spawns cars and logs using random timers. For ease of implementation, map this directly to Godot's built-in `Timer` nodes.
- Create a `LaneSpawner.tscn` with a `Timer`. On the `timeout()` signal, randomize the wait time slightly and `instantiate()` an obstacle scene.

### `Player.js` $\rightarrow$ `Player.tscn` (Area2D)
- Create a Player scene with:
  - `Area2D` as the root.
  - `Sprite2D` for visuals.
  - `CollisionShape2D` (RectangleShape2D set to 40x40).
- **Grid Movement:** Use a `Tween` node to handle the movement interpolation smoothly. 
  ```gdscript
  var tween = create_tween()
  tween.tween_property(self, "position", target_position, 0.2)
  ```

### `UIManager.js` $\rightarrow$ `Control` Nodes
- Create a `CanvasLayer` to keep UI rendering above the game world.
- **Suicide Magic**: In the magic menu VBoxContainer, connect the "Suicide Magic" button's `pressed` signal directly to the `player.die()` function.

## 3. Implementing the Juice & Mechanics

### The Blizzard Spell
- Create a `BlizzardBlast.tscn` scene (an `Area2D`).
- Upon cast, instantiate it and use `get_overlapping_areas()` to find all cars/players caught in the blast, calling `freeze()` on them.

### Crash Effects & Particle Systems
- Create `GPUParticles2D` nodes for Ice Shards and Blood Splatters.
- Attach a `RayCast2D` to your `Obstacle.tscn`. If the raycast detects a frozen obstacle, trigger the Ice `GPUParticles2D` and halt movement.

### Screen Shake & Arcade Polish
- **Screen Shake:** Add a `Camera2D` to your Level scene. Write a simple GDScript function to randomize the `offset` property of the camera over a short duration using a `Tween`.
- **Scanlines:** Add a `CanvasLayer` on top of your game with a `ColorRect` set to cover the full screen. Apply a custom Shader Material with a classic CRT or Scanline shader.
