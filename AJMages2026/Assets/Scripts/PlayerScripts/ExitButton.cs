using UnityEngine;
using UnityEngine.InputSystem;

public class ExitButton : MonoBehaviour
{
    private void OnExitButton(InputValue input)
    {
        Application.Quit();
    }
}
