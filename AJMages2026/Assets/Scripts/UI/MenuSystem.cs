using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.SceneManagement;

public class MenuSystem : MonoBehaviour
{
    private void OnPlayer1Button(InputValue input)
    {
        if (SceneManager.GetActiveScene().buildIndex == 0)
        {
            GameDataManager.instance.SetPlayerCount(true);
            SceneManager.LoadScene("GameScene");
        }
    }

    private void OnPlayer2Button(InputValue input)
    {
        if (SceneManager.GetActiveScene().buildIndex == 0)
        {
            GameDataManager.instance.SetPlayerCount(false);
            SceneManager.LoadScene("GameScene");
        }
    }
}
