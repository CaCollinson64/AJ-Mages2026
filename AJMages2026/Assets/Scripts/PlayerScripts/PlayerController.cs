using NUnit.Framework.Constraints;
using Unity.Collections.LowLevel.Unsafe;
using Unity.Mathematics;
using UnityEditor.Rendering;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.InputSystem;
using static UnityEngine.Rendering.DebugUI;

public class PlayerController : MonoBehaviour
{
    public UnityEvent<majorInput, minorInput> sendP1Input;
    private majorInput p1MajorInput = majorInput.none;
    private minorInput p1MinorInput = minorInput.up;
    private bool didMajorP1 = false;

    private majorInput p2MajorInput = majorInput.none;
    private minorInput p2MinorInput = minorInput.up;
    private bool didMajorP2 = false;
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

    private majorInput GetMajorInput(Vector2 vectorInput)
    {
        float xValue = vectorInput.x;
        float yValue = vectorInput.y;
        float combined = Mathf.Abs(yValue) - Mathf.Abs(xValue);
        if (combined > 0)
        {
            if (yValue > 0)
            {
                return majorInput.move;
            }
            else
            {
                return majorInput.shield;
            }
        }
        else if (combined < 0)
        {
            if (xValue > 0)
            {
                return majorInput.spell;
            }
            else
            {
                return majorInput.item;
            }
        }
        return majorInput.none;
    }

    private minorInput GetMinorInput(Vector2 vectorInput, minorInput oldInput)
    {
        float xValue = vectorInput.x;
        float yValue = vectorInput.y;
        float combined = Mathf.Abs(yValue) - Mathf.Abs(xValue);
        if (combined > 0)
        {
            if (yValue >= 0)
            {
                return minorInput.up;
            }
            else
            {
                return minorInput.down;
            }
        }
        else if (combined < 0)
        {
            if (xValue > 0)
            {
                return minorInput.right;
            }
            else
            {
                return minorInput.left;
            }
        }
        return oldInput;
    }

    public void On_1ButtonLeft(InputValue input)
    {

        Debug.Log(input.isPressed.ToString());

        if (didMajorP1)
        {
            sendP1Input.Invoke(p1MajorInput, p1MinorInput);
            didMajorP1 = false;
        }
        else
        {
            didMajorP1 = true;
        }
    }

    public void OnLeftStick(InputValue input)
    {
        Vector2 vectorInput = input.Get<Vector2>();
        vectorInput = math.normalize(vectorInput);
        
        if (!didMajorP1)
        {
            p1MajorInput = GetMajorInput(vectorInput);
            Debug.Log(p1MajorInput.ToString());
        }
        else
        {
            p1MinorInput = GetMinorInput(vectorInput, p1MinorInput);
            Debug.Log(p1MinorInput.ToString());
        }
    }

    public void OnRightStick(InputValue input)
    {
        Vector2 vectorInput = input.Get<Vector2>();
        vectorInput = math.normalize(vectorInput);

        if (!didMajorP2)//Replace with didMajorP2
        {
            p2MajorInput = GetMajorInput(vectorInput);
        }
        else
        {
            p2MinorInput = GetMinorInput(vectorInput,p2MinorInput);
        }
    }
}
