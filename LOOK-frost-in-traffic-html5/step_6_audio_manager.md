# Step 6: Audio Architecture
**TARGET AGENT:** Unity Developer
**OBJECTIVE:** Build a scalable, centralized `AudioManager` for music and SFX.

## Instructions
1. **AudioManager.cs (Singleton)**
   - Create an empty GameObject named `AudioManager` and attach the script.
   - Attach two `AudioSource` components to the GameObject: one for `MusicSource` (Loop = true) and one for `SFXSource` (Loop = false).
   - Use a `Dictionary<string, AudioClip>` or a `Serializable` struct to map sound names to their clips in the Inspector.
   - Create two public methods: `public void PlayMusic(string trackName)` and `public void PlaySFX(string sfxName)`.

2. **Music Integration**
   - Hook into the `GameManager` C# State Actions you built in Step 2.
   - When `OnStateChanged(GameState.Menu)` fires, call `PlayMusic("MenuTheme")`.
   - When `OnStateChanged(GameState.Playing)` fires, call `PlayMusic("GameTheme")`.
   - When `OnStateChanged(GameState.GameOver)` fires, stop the music.

3. **SFX Integration**
   - Do NOT attach unique `AudioSource` components to every car and log! Use the centralized `AudioManager.Instance.PlaySFX()`.
   - **Player Movement:** Trigger `PlaySFX("Hop")` at the start of the `Vector3.Lerp` movement coroutine in `PlayerController.cs`.
   - **Magic Casting:** Trigger `PlaySFX("Blizzard")` inside the Spell Execution logic when overlapping the BoxCollider.
   - **Obstacle Pile-Ups:** Trigger `PlaySFX("Crash")` when a Car raycast hits a frozen object.
   - **Death:** Trigger `PlaySFX("Explode")` or `PlaySFX("Splash")` inside `PlayerController.Die()` depending on whether the player died on the road or in the river.
