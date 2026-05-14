# Step 4: The Magic System
**TARGET AGENT:** Unity Developer
**OBJECTIVE:** Implement Spells using ScriptableObjects.

## Instructions
1. **SpellData.cs (ScriptableObject)**
   - Do not hardcode spells! Create a ScriptableObject class:
     ```csharp
     [CreateAssetMenu(fileName = "NewSpell", menuName = "Magic/SpellData")]
     public class SpellData : ScriptableObject {
         public string spellName;
         public int mpCost;
         public Vector2 effectArea; // e.g., 1x1, 3x3, 5x5
     }
     ```
2. **The Blizzard Spell**
   - When cast, use `Physics2D.OverlapBoxAll()` at the target grid position with the size defined by the `SpellData`.
   - Iterate through the colliders. If they possess an `IFreezable` interface, call `Freeze()`.
   - The frozen object must stop moving, swap its sprite to a blue tint, and become an obstacle for other cars (causing a pile-up raycast check).
3. **The Float Spell**
   - Sets a boolean `isFloating = true` and starts a 3-second Coroutine.
   - While floating, use `Physics2D.IgnoreLayerCollision()` or simply bypass the `Die()` logic in `OnTriggerEnter2D`.
4. **Suicide Magic**
   - Directly call `PlayerController.Die()` and instantiate blood particles.
