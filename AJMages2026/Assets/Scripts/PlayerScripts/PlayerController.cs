using NUnit.Framework.Constraints;
using Unity.Mathematics;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.InputSystem;

public class PlayerController : MonoBehaviour
{
    public UnityEvent<majorInput, minorInput> sendInput;
    private majorInput leftStickInput = majorInput.none;
    private minorInput rightStickInput = minorInput.up;
    public enum majorInput
    {
        move,
        spell,
        shield,
        item,
        none
    }

    public enum minorInput
    {
        up, down, left, right
    }

    public void OnLeftStick(InputValue input)
    {
        Debug.Log("K");
        Vector2 vectorInput = input.Get<Vector2>();
        vectorInput = math.normalize(vectorInput);
        float xValue = vectorInput.x;
        float yValue = vectorInput.y;
        float combined = Mathf.Abs(yValue) - Mathf.Abs(xValue);
        if (combined >= 0)
        {
            if (yValue > 0)
            {
                leftStickInput = majorInput.move;
            }
            else if (yValue < 0)
            {
                leftStickInput = majorInput.shield;
            }
            else
            {
                leftStickInput = majorInput.none;
            }
        }
        else
        {
            if (xValue > 0)
            {
                leftStickInput = majorInput.spell;
            }
            else
            {
                leftStickInput = majorInput.item;
            }
        }
    }

    public void OnRightStick(InputValue input)
    {
        Debug.Log("Ok");
        Vector2 vectorInput = input.Get<Vector2>();
        vectorInput = math.normalize(vectorInput);
        float xValue = vectorInput.x;
        float yValue = vectorInput.y;
        float combined = Mathf.Abs(yValue) - Mathf.Abs(xValue);
        if (combined >= 0.1)
        {
            if (yValue > 0)
            {
                rightStickInput = minorInput.up;
            }
            else if (yValue < 0)
            {
                rightStickInput = minorInput.down;
            }
        }
        else if (combined < 0.1)
        {
            if (xValue > 0)
            {
                rightStickInput = minorInput.right;
            }
            else
            {
                rightStickInput = minorInput.left;
            }
        }
        else
        {
            sendInput.Invoke(leftStickInput, rightStickInput);
        }
    }
}
