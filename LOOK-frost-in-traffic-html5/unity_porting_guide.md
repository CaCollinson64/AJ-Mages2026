# Frost in Traffic - Unity Porting Guide

This guide breaks down how to map the final HTML5/JS vanilla architecture of **Frost in Traffic** directly into Unity's component-based system.

## 1. Project Setup
- **Template:** 2D Core
- **Camera:** Set the Main Camera to `Orthographic`. Adjust the Size to fit a 16:11 aspect ratio (equivalent to our 800x600 canvas divided by chunks).
- **Grid:** Use a Unity `Grid` component for the environment to easily snap players and obstacles. Each cell should correspond to `chunkSize` (e.g., 1 unit = 1 chunk).

## 2. Core Architecture Translation

### `Game.js` $\rightarrow$ `GameManager.cs`
- Create an empty GameObject `GameManager`.
- Attach `GameManager.cs` (Singleton pattern recommended).
- **Responsibilities:**
  - Track `GameState` enum (`Menu`, `Playing`, `GameOver`).
  - Keep references to `PlayerController` scripts.
  - Handle `Update()` state switching (e.g., stopping gameplay execution during `Menu`).

### `WorldManager.js` $\rightarrow$ `LevelManager.cs`
- The JS prototype uses **RNG timers** for lane spawning. For ease of implementation, maintain this random spawning system in Unity.
- Create an empty GameObject `LaneSpawner` and attach a script that runs a coroutine or `Update()` timer to randomly `Instantiate()` Hazard prefabs based on a given `spawnRate`.

### `Player.js` $\rightarrow$ `PlayerController.cs`
- Create a Player Prefab with:
  - `SpriteRenderer`
  - `Rigidbody2D` (Kinematic)
  - `BoxCollider2D` (IsTrigger = true)
- **Movement:** Use Unity Coroutines (`Vector3.Lerp` over time) to smoothly slide the player from one grid tile to the next.
- **Collision:** Use `OnTriggerEnter2D` and `OnTriggerStay2D` to detect intersections with hazards.

### `UIManager.js` $\rightarrow$ Unity UI Canvas
- Build the UI using standard Unity `Button` and `Panel` components.
- **Suicide Magic**: Tie the Suicide Magic menu button directly to the `PlayerController.Die()` method to instantly trigger a life loss and particle explosion.

## 3. Implementing the Juice & Mechanics

### The Blizzard Spell
- Instantiate an invisible `BoxCollider2D` prefab at the target location. Set scale based on tier.
- Use `Physics2D.OverlapBoxAll()` to detect obstacles, and call a `Freeze()` method on them (which stops movement and swaps the sprite).

### Crash Effects & Particle Systems
- Create a `ParticleSystem` prefab for Ice Bursts and another for Player Death (blood/sparks).
- When a car raycast hits a frozen object, instantiate the Ice `ParticleSystem` and call `Freeze()` on the car to trigger a pile-up.

### Screen Shake & Arcade Polish
- **Screen Shake:** Install the **Cinemachine** package. Attach a `Cinemachine Impulse Source` to your GameManager, and trigger an impulse whenever a pile-up or death occurs.
- **Scanlines:** Use Unity's **Post Processing Stack v2** or **URP Volumes** to apply a CRT/Scanline material over the camera, capturing that retro arcade feel natively.
