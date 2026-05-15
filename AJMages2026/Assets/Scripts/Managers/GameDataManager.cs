using UnityEngine;

public class GameDataManager : MonoBehaviour
{
    public static GameDataManager instance;

    private bool _isSinglePlayer = true;

    private void Awake()
    {
        if (instance == null)
        {
            instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }

    public void SetPlayerCount(bool input)
    {
        _isSinglePlayer = input;
    }

    public bool IsSinglePlayer()
    {
        return _isSinglePlayer;
    }

}
