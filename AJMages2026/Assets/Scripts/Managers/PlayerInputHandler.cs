using UnityEngine;
using UnityEngine.Events;

public class PlayerInputHandler : MonoBehaviour
{
    [SerializeField] private bool _isP1;
    public UnityEvent<PlayerController.majorInput, PlayerController.minorInput> playerInput;

    private void Start()
    {
        if (_isP1)
        {
            PlayerController.instance.sendP1Input.AddListener(OnReceivedInput);
        }
        else
        {
            PlayerController.instance.sendP2Input.AddListener(OnReceivedInput);
        }
    }

    private void OnReceivedInput(PlayerController.majorInput input1, PlayerController.minorInput input2)
    {
        playerInput.Invoke(input1, input2);
    }
}
