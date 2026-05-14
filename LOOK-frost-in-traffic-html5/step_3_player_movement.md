# Step 3: Player & Input System
**TARGET AGENT:** Unity Developer
**OBJECTIVE:** Grid-based movement and split-keyboard input.

## Instructions
1. **The Input System**
   - Create an `InputActions` asset.
   - Create two Action Maps: `Player1` (WASD) and `Player2` (Arrow Keys).
2. **PlayerController.cs**
   - Attach a `Rigidbody2D` (Kinematic) and `BoxCollider2D` (IsTrigger).
   - Variables: `int hp`, `int mp`, `int sp`.
   - The Player must snap to the grid. Do not use physics forces for movement.
   - When directional input is received, start a `Coroutine` that uses `Vector3.Lerp` to slide the player exactly 1 Grid Unit over `0.15` seconds. Ignore further input until the Coroutine finishes.
3. **Collision Matrix**
   - Use Unity's **Physics Layer Matrix**. 
   - Create Layers: `Player`, `Hazard_Road`, `Hazard_River`, `Platform`.
   - In `OnTriggerStay2D`:
     - If touching `Hazard_Road`, trigger `Die()`.
     - If touching `Hazard_River` BUT NOT touching `Platform`, trigger `Die()`.
