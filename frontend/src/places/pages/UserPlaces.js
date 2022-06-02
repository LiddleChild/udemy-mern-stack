import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { useHTTPClient } from "../../shared/hooks/http-hook";
import PlaceList from "../components/PlaceList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";

const UserPlaces = () => {
  const userID = useParams().userID;

  const { isLoading, error, sendRequest, clearError } = useHTTPClient();
	const [loadedPlaces, setLoadedPlaces] = useState([]);

	useEffect(() => {
		const fetchPlaces = async () => {
			try {
				const responseData = await sendRequest(`http://localhost:5000/api/places/user/${userID}`);
				setLoadedPlaces(responseData.places);
			} catch (err) {}
		}

		fetchPlaces();
	}, [sendRequest, userID]);

	const placeDeleteHandler = (deletedPlaceID) => {
		setLoadedPlaces(prevPlaces => 
			prevPlaces.filter(place => place.id !== deletedPlaceID)
		);
	}

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
			{ isLoading && 
				<div className="center">
					<LoadingSpinner />
				</div>
			}
			{ !isLoading && loadedPlaces &&
				<PlaceList items={loadedPlaces} onDeletePlace={placeDeleteHandler} />
			}
    </React.Fragment>
  );
};

export default UserPlaces;