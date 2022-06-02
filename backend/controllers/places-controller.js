const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const fs = require("fs");

const HTTPError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");



/*
 * =================================================================
 *                         getPlaceByID
 * =================================================================
 */
const getPlaceByID = async (req, res, next) => {
  const placeID = req.params.pid;
  let place;

  try {
    place = await Place.findById(placeID);
  } catch (err) {
    return next(new HTTPError("Something went wrong, could not find a place.", 500));
  }

  if (!place) {
    return next(new HTTPError("Could not find a place for a provided ID.", 404));
  }

  res.json({
    place: place.toObject({ getters: true })
  });
};



/*
 * =================================================================
 *                        getPlacesByUserID
 * =================================================================
 */
const getPlacesByUserID = async (req, res, next) => {
  const userID = req.params.uid;
  let places;

  try {
    places = await Place.find({ creator: userID });
  } catch (err) {
    return next(new HTTPError("Fetching places failed, please try again later.", 500));
  }
  
  if (!places || places.length === 0) {
    return next(new HTTPError("Could not find a places for a provided user ID.", 404));
  }
  
  res.json({
    places: places.map(p => p.toObject({ getters: true }))
  });
};



/*
 * =================================================================
 *                             createPlace
 * =================================================================
 */
const createPlace = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    next(new HTTPError("Invalid input passed, please check your data.", 402));
  }

  const { title, description, address, creator } = req.body;
  const coordinates = await getCoordsForAddress(address);

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(new HTTPError("Creating place failed, please try again later.", 500));
  }

  if (!user) {
    return next(new HTTPError("Could not find user for provided id.", 404));
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator
  });
  
  try {
    // Grouping 2 saving processes in a session, so that failing one should undo the whole.
    const session = await mongoose.startSession();
    session.startTransaction();

    await createdPlace.save({ session, validateModifiedOnly: true });
    user.places.push(createdPlace);
    await user.save({ session, validateModifiedOnly: true });
    
    await session.commitTransaction();
  } catch (err) {
    return next(new HTTPError("Creating place failed, please try again.", 500));
  }

  res.status(201).json({ place: createdPlace });
};



/*
 * =================================================================
 *                            updatePlace
 * =================================================================
 */
const updatePlace = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return next(new HTTPError("Invalid input passed, please check your data.", 402));
  }

  const { title, description } = req.body;

  const placeID = req.params.pid;
  let place;

  try {
    place = await Place.findById(placeID);
  } catch (err) {
    return next(new HTTPError("Something went wrong, could not update place.", 500));
  }

  place.title = title;
  place.description = description;

  try {
  await place.save();
  } catch (err) {
  return new HTTPError("Something went wrong, could not update place.", 500);
  }

  res.status(200).json({
    place: place.toObject({ getters: true })
  });
};



/*
 * =================================================================
 *                            deletePlace
 * =================================================================
 */
const deletePlace = async (req, res, next) => {
  const placeID = req.params.pid;

  let place;

  try {
    place = await Place.findById(placeID).populate("creator");
  } catch (err) {
    return next(new HTTPError("Something went wrong, could not delete place.", 500));
  }

  if (!place) {
    return next(new HTTPError("Could not find place for this ID.", 404));
  }

  const imagePath = place.image;

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    await place.remove({ session, validateModifiedOnly: true });
    place.creator.places.pull(place);
    await place.creator.save({ session, validateModifiedOnly: true });

    await session.commitTransaction();
  } catch (err) {
    return next(new HTTPError("Something went wrong, could not delete place.", 500));
  }

  fs.unlink(imagePath, (err) => {
    console.log(err);
  });
  
  res.status(200).json({ message: "Deleted place." });
};

exports.getPlaceByID = getPlaceByID;
exports.getPlacesByUserID = getPlacesByUserID;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;