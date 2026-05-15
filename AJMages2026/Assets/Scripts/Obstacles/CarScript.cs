using UnityEngine;

public class CarScript : MonoBehaviour
{

    [SerializeField] private bool _goLeft;
    [SerializeField] private float _speed;

    // Update is called once per frame
    private void FixedUpdate()
    {
        if (_goLeft)
        {
            transform.position += new Vector3(1 * _speed, 0, 0);
        }
    }
}
