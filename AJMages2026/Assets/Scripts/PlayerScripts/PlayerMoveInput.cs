using NUnit.Framework.Interfaces;
using UnityEngine;

public class PlayerMoveInput : MonoBehaviour
{
    private Vector2 _moveDir = Vector2.zero;
    private Vector2 _currentLocation = Vector2.zero;
    private bool _isMoving = false;
    [SerializeField] private float _speed;

    private void Start()
    {
        gameObject.GetComponent<PlayerController>().sendP1Input.AddListener(OnReceivedInput);
    }

    private void FixedUpdate()
    {
        if (_isMoving)
        {
            transform.position = transform.position + new Vector3(_moveDir.x * _speed, _moveDir.y * _speed,0);
        }
    }

    private void OnReceivedInput(PlayerController.majorInput input1, PlayerController.minorInput input2)
    {
        if (_isMoving && input1 != PlayerController.majorInput.move)
        {
            return;
        }

        _currentLocation = gameObject.transform.position;

        switch(input2)
        {
            case PlayerController.minorInput.up:
                _moveDir = Vector2.up;
                break; 
            case PlayerController.minorInput.down:
                _moveDir = Vector2.down;
                break;
            case PlayerController.minorInput.left: 
                _moveDir = Vector2.left; 
                break;
            case PlayerController.minorInput.right: 
                _moveDir = Vector2.right; 
                break;
        }
    }
}
