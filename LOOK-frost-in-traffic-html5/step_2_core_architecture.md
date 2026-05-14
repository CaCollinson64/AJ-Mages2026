# Step 2: Core Architecture
**TARGET AGENT:** Unity Developer
**OBJECTIVE:** Build the global managers using C# Standards.

## Instructions
1. **GameManager.cs (Singleton)**
   - Create an empty GameObject `GameManager`. Attach this script.
   - Define `public enum GameState { Menu, Playing, GameOver }`.
   - Use **C# Actions** for event-driven architecture to prevent tight coupling. Example: `public static event Action<GameState> OnStateChanged;`
2. **LevelManager.cs & Object Pooling**
   - The HTML5 prototype instantiated objects randomly. In Unity, we do **not** use `Instantiate` in an `Update` loop!
   - Build an Object Pool for `Car`, `Log`, and `Alligator` prefabs.
   - Create Coroutines that randomly pull from the pool based on a `spawnRate` variable.
   - When an object passes the edge of the screen (`OnBecameInvisible`), return it to the Object Pool instead of destroying it.
3. **The Grid Layout Mapping:**
   - When spawning lanes on the grid, map the Y coordinates exactly as they are laid out in the JS `WorldManager`:
     - Goal Line: Y = 0 to 1
     - River Top: Y = 2 to 4
     - Grass Island: Y = 5
     - River Bottom: Y = 6 to 9
     - Middle Safe Zone: Y = 10
     - Roads: Y = 11 to 16
     - Start Safe Zone: Y = 17
