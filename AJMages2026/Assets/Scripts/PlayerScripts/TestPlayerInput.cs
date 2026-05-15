using UnityEngine;

public class TestPlayerInput : MonoBehaviour
{

    private void Start()
    {
        PlayerController.instance.sendP1Input.AddListener(TestOutput);
    }

    private void TestOutput(PlayerController.majorInput input1,PlayerController.minorInput input2)
    {
        Debug.Log(input1.ToString());
        Debug.Log(input2.ToString());
    }
}
