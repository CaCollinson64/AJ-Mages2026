using UnityEngine;

public class TestPlayerInput : MonoBehaviour
{

    private void Start()
    {
        gameObject.GetComponent<PlayerController>().sendInput.AddListener(TestOutput);
    }

    private void TestOutput(PlayerController.majorInput input1,PlayerController.minorInput input2)
    {
        Debug.Log(input1.ToString());
        Debug.Log(input2.ToString());
    }
}
