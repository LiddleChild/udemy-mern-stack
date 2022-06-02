import React, { useReducer, useEffect } from "react";

import { validate } from "../../utils/validators";

import "./Input.css";

const inputRuducer = (state, action) => {
  switch (action.type) {
    case "CHANGE":
      return {
        ...state,
        value: action.val,
        isValid: validate(action.val, action.validators),
      };

    case "TOUCH":
      return {
        ...state,
        isTouched: true,
      };

    default:
      return state;
  }
};

const Input = (props) => {
  const [inputState, dispatch] = useReducer(inputRuducer, {
    value: props.initialValue || "",
    isValid: props.initialValid || false,
    isTouched: false
  });

  const changeHandler = (event) => {
    dispatch({
      type: "CHANGE",
      val: event.target.value,
      validators: props.validators,
    });
  };

  const { id, onInput } = props;
  const { value, isValid } = inputState;

  useEffect(() => {
    onInput(id, value, isValid);
  }, [id, onInput, value, isValid]);

  const touchHandler = () => {
    dispatch({
      type: "TOUCH",
    });
  };

  const element =
    (props.element === "input") ?
      <input
        id={props.id}
        type={props.type}
        placeholder={props.placeholder}
        onChange={changeHandler}
        onBlur={touchHandler}
        value={inputState.value}
      /> :
        <textarea
        id={props.id}
        rows={props.row || 3}
        onChange={changeHandler}
        onBlur={touchHandler}
        value={inputState.value}
      />;
        
  return (
    <div className={`form-control ${(!inputState.isValid && inputState.isTouched) && "form-control--invalid"}`}>
      <label htmlFor={props.id}>{props.label}</label>
      {element}
      { (!inputState.isValid && inputState.isTouched) &&<p>{props.errorText}</p> }
    </div>
  );
};

export default Input;