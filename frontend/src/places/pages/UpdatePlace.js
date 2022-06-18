import React, { useEffect, useState, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";

import { AuthContext } from "../../shared/context/auth-context";
import { VALIDATOR_REQUIRE, VALIDATOR_MINLENGTH } from "../../shared/utils/validators";
import { useForm } from "../../shared/hooks/form-hook";
import { useHTTPClient } from "../../shared/hooks/http-hook";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import Card from "../../shared/components/UIElements/Card";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";

import "./PlaceForm.css";

const UpdatePlace = () => {
  const auth = useContext(AuthContext);
  const placeID = useParams().placeID;
  const { isLoading, error, sendRequest, clearError } = useHTTPClient();
	const [loadedPlaces, setLoadedPlaces] = useState([]);
  
  const [formState, inputHandler, setFormData] = useForm({
    title: { value: "", isValid: false },
    description: { value: "", isValid: false },
  }, false);
  
  const history = useHistory();

  useEffect(() => {
		const fetchPlaces = async () => {
			try {
				const responseData = await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/places/${placeID}`);
				setLoadedPlaces(responseData.place);
        setFormData({
          title: { value: loadedPlaces.title, isValid: true },
          description: { value: loadedPlaces.description, isValid: true },
        }, true);
			} catch (err) {}
		}

		fetchPlaces();
	}, [sendRequest, setFormData, placeID, loadedPlaces.title, loadedPlaces.description]);

  const placeUpdateSubmitHandler = async (event) => {
    event.preventDefault();
    
    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/places/${placeID}`,
        "PATCH",
        JSON.stringify({
          title: formState.inputs.title.value,
          description: formState.inputs.description.value,
        }),
        { "Content-Type": "application/json", "Authorization": `Bearer ${auth.token}` },
      );

      // Redirect
      history.push(`/${auth.userID}/places`);
    } catch (err) {}
  }
  
  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!loadedPlaces && !error) {
    return (
      <div className="center">
        <Card>
          <h2>Couldn't find place</h2>
        </Card>
      </div>
    )
  }

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      { !isLoading && loadedPlaces &&
        <form className="place-form" onSubmit={placeUpdateSubmitHandler}>
          <Input
            id="title"
            element="input"
            type="text"
            label="Title"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid title."
            onInput={inputHandler}
            initialValue={loadedPlaces.title}
            initialValid={true}
          />
          <Input
            id="description"
            element="textarea"
            label="Description"
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText="Please enter a valid description (at least 5 characters)."
            onInput={inputHandler}
            initialValue={loadedPlaces.description}
            initialValid={true}
          />
          <Button type="submit" disabled={!formState.isValid}>UPDATE PLACE</Button>
        </form>
      }
    </React.Fragment>
  );
};

export default UpdatePlace;