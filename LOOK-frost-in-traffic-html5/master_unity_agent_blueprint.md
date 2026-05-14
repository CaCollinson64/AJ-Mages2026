# SYSTEM INSTRUCTION: PROJECT RECONSTRUCTION
**Target Entity:** AI Coding Agent / Unity Developer  
**Project Name:** Frost in Traffic  
**Objective:** Reconstruct the HTML5 Canvas prototype of "Frost in Traffic" as a 1:1 replica in the Unity Game Engine.

---

## 1. GLOBAL PROJECT SPECIFICATIONS
- **Template:** Unity 2D Core
- **Resolution:** `1920x1080` (16:9 Aspect Ratio).
- **Grid System:** The game operates on a strict mathematical grid. 
  - Width: 32 Chunks
  - Height: 18 Chunks
  - *Agent Note: Set up a standard Unity `Grid` component. 1 Unity Unit = 1 Chunk.*
- **Input:** Use the **New Input System**.
  - **Player 1 Action Map:** WASD for movement, Space for Confirm, Q for Cancel.
  - **Player 2 Action Map:** Arrow Keys for movement, Enter for Confirm, Right Shift for Cancel.

---

## 2. SCENE HIERARCHY & CORE MANAGERS

### Root Scene Layout
```text
- Main Camera (Orthographic)
- GlobalVolume (Post-Processing)
- GameManager (Empty GameObject)
- LevelManager (Empty GameObject)
- EnvironmentGrid (Grid Component)
- Canvas (UI Root)
```

### Script: `GameManager.cs`
**Role:** The global state machine.
- **States:** `enum GameState { Menu, Playing, GameOver }`
- **Fields:**
  - `PlayerController player1, player2`
  - `float difficultyMultiplier` (Starts at 1.0, increases by 0.2 on win)
  - `float gameOverTimer` (Wait 3 seconds after all active players die before resetting).
- **Logic:** During the `Menu` state, disable all Player input and hide UI, but allow `LevelManager` to continue running (Attract Mode).

### Script: `LevelManager.cs`
**Role:** Hazards and Collectible generation.
- The prototype uses **RNG timers** for lane spawning. For ease of implementation, maintain this random spawning system.
- Create `LaneSpawner.cs` scripts on empty GameObjects. Use Coroutines or `Update()` timers to randomly `Instantiate()` obstacle prefabs based on the `spawnRate`.
- **Lanes:**
  - `Roads:` Y-Index 11 to 16
  - `River:` Y-Index 4 to 8
  - `Safe Zones:` Y-Index 17 (Start), 9-10 (Middle), 0-3 (Goal)

---

## 3. PREFAB BLUEPRINTS

### Player Prefab (`PlayerController.cs`)
- **Components:** `SpriteRenderer`, `Rigidbody2D` (Kinematic), `BoxCollider2D` (IsTrigger = true).
- **Fields:** `int maxSp (5), int maxMp (10), int lives (3), int score (0)`.
- **Movement:** Must be constrained to the Grid. Use Coroutines (`Vector3.Lerp`) to smoothly translate the transform over `0.15s` when a movement input is received. Subtract SP on move.
- **Collision:** `OnTriggerEnter2D` and `OnTriggerStay2D`. 
  - If overlapping a `River` tile without touching a `Log` collider, trigger `Die()`.
  - If touching a `Car` collider, trigger `Die()`.
- **Timers:**
  - `spRegenTimer`: Regens 1 SP every second.
  - `floatTimer`: If > 0, ignore all Hazard collisions.

### Obstacle Prefabs (`Obstacle.cs`)
- **Types:** `Car`, `Log`, `Alligator`.
- **Components:** `BoxCollider2D` (IsTrigger). Cars need a small `Raycast2D` pointing forward.
- **Pile-ups:** If a Car's raycast hits an Obstacle with `isFrozen == true`, the Car must call `Freeze()` on itself, creating a chain-reaction pile-up.

---

## 4. THE MAGIC SYSTEM

Implement the Magic System using **ScriptableObjects** for clean architecture.

### `SpellData.asset`
Create a ScriptableObject class with:
- `string spellName`
- `int mpCost`
- `int radius` (0 for 1x1, 1 for 3x3, 2 for 5x5).

### Spell Behaviours
- **Blizzard (I, II, III):** Instantiate an invisible `BoxCollider2D` at the target grid position. Scale it based on the spell `radius`. Use `Physics2D.OverlapBoxAll` to get all `Obstacles` inside. Call `Freeze(5.0f)` on them.
- **Float:** Costs 5 MP. Sets Player's `floatTimer = 3.0f`. Add a yellow glowing particle aura.
- **Suicide Magic:** Costs 0 MP. Directly calls `PlayerController.Die()`.

---

## 5. UI CANVAS MAPPING

The UI relies heavily on a JRPG-style nested menu system for each player.

### Hierarchy
```text
Canvas
 ├── ScanlineOverlay (Image with repeating striped texture)
 ├── Player1_UI (Anchored Left)
 │    ├── JoinPromptText (Blinking)
 │    ├── GameOverText (Hidden)
 │    ├── StatusBars (Vertical Layout Group: Score, Lives, SP, MP)
 │    ├── RootMenu (Vertical Layout Group: Move, Magic, Suicide)
 │    └── MagicMenu (Hidden, Vertical Layout Group: Blizz1, Blizz2, Blizz3, Float, Back)
 └── Player2_UI (Anchored Right)
```
- **Navigation:** Do NOT use the mouse. Map the EventSystem to Player 1's WASD and Player 2's Arrows. Ensure both EventSystems do not conflict (use Unity's `MultiplayerEventSystem` if necessary).

---

## 6. JUICE & GAME FEEL

### Post-Processing
- Install the **Universal Render Pipeline (URP)** or **Post Processing Stack**.
- Add a `GlobalVolume` with **Bloom** to make the cyan UI and frozen enemies glow.
- The `ScanlineOverlay` in the UI Canvas will handle the CRT aesthetic.

### Cinemachine Screen Shake
- Install **Cinemachine**.
- Attach a `Cinemachine Impulse Source` to the `GameManager`.
- **Triggers:**
  - Car pile-up: `GenerateImpulse(0.2f)`
  - Player Death: `GenerateImpulse(1.0f)`

### Particle Systems
- Create two `ParticleSystem` prefabs:
  - **IceBurst:** Blue/White square particles. Burst count: 20. Triggered via `Obstacle.Freeze()`.
  - **BloodSparks:** Red/Gold square particles. Burst count: 30. Triggered via `PlayerController.Die()`.
