# Step 1: Project Setup
**TARGET AGENT:** Unity Developer
**OBJECTIVE:** Initialize the blank Unity project.

## Instructions
1. Open Unity Hub and create a new **2D Core** project. (Optionally use Universal 2D if you want URP).
2. Open the **Package Manager** and install:
   - `Input System` (Say "Yes" to restart and enable the new backend).
   - `Cinemachine` (For screen shake).
3. Set your Game View resolution to **1920x1080** (16:9 aspect ratio).
4. Create the standard Folder Structure in `Assets/`:
   - `Scripts` (Subfolders: `Managers`, `Player`, `Magic`, `UI`, `Environment`)
   - `Prefabs`
   - `ScriptableObjects`
   - `Materials`
   - `Sprites`
5. Create a `Grid` object in the root scene. This game relies on strict math!
   - Our prototype canvas was 1280x720, broken into 40x40 chunks.
   - This means the grid is 32 units wide by 18 units high.
   - Set the Main Camera to **Orthographic**. Adjust the `Size` parameter until 18 units fit perfectly top-to-bottom.
