using UnityEngine;
using static UnityEngine.Rendering.DebugUI;

public class PlayerShieldInput : MonoBehaviour
{
    [SerializeField] private GameObject _shield;
    [SerializeField] private SpriteRenderer _shieldSprite;
    private void Start()
    {
        gameObject.GetComponent<PlayerInputHandler>().playerInput.AddListener(DoShield);
    }
    
    private void DoShield(PlayerController.majorInput input1, PlayerController.minorInput input2)
    {
        if (input1 != PlayerController.majorInput.shield)
        {
            _shield.GetComponent<Collider2D>().enabled = false;
            _shieldSprite.enabled = false;
            return;
        }

        switch (input2)
        {
            case PlayerController.minorInput.up:
                _shield.transform.rotation = Quaternion.Euler(new Vector3(0,0,0));
                break;

            case PlayerController.minorInput.down:
                _shield.transform.rotation = Quaternion.Euler(new Vector3(0, 0, 180));
                break;

            case PlayerController.minorInput.left:
                _shield.transform.rotation = Quaternion.Euler(new Vector3(0, 0, 90));
                break;

            case PlayerController.minorInput.right:
                _shield.transform.rotation = Quaternion.Euler(new Vector3(0, 0, 270));
                break;
        }

        gameObject.GetComponent<Collider2D>().enabled = true;
        _shieldSprite.enabled = true;
    }
}
