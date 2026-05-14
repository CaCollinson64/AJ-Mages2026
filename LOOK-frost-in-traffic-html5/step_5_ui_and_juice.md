# Step 5: UI & Juice
**TARGET AGENT:** Unity Developer
**OBJECTIVE:** Build the JRPG Menus and add game feel.

## Instructions
1. **The UI Canvas**
   - Set the Canvas Scaler to `Scale With Screen Size` -> `1920x1080`.
   - Use Vertical Layout Groups for the JRPG menus.
   - Link the nested menus to Unity's `EventSystem` to allow keyboard-only navigation. Use the `MultiplayerEventSystem` component so P1 and P2 can navigate their menus simultaneously.
2. **Particle Systems**
   - Create an Ice Burst `ParticleSystem` prefab. Instantiate it when an obstacle's `Freeze()` is called.
   - Create a Blood Sparks `ParticleSystem` prefab. Instantiate it during `PlayerController.Die()`.
3. **Cinemachine Screen Shake**
   - Attach a `Cinemachine Impulse Source` to the `GameManager`.
   - Create an event listener. When a car pile-up occurs, call `GenerateImpulse(0.2f)`. When a player dies, call `GenerateImpulse(1.0f)`.
4. **Post-Processing**
   - If using URP, add a `GlobalVolume`. Add **Bloom** to make the UI borders glow. 
   - Add a UI `Image` covering the whole screen with a custom CRT scanline shader material.
