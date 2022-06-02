const { validationResult } = require("express-validator");

const HTTPError = require("../models/http-error");
const User = require("../models/user");



/*
 * =================================================================
 *                            getUsers
 * =================================================================
 */
const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    return next(new HTTPError("Fetching users failed, please try again later.", 500));
  }

  res.json({
    users: users.map(u => u.toObject({ getters: true }))
  });
};



/*
 * =================================================================
 *                              signup
 * =================================================================
 */
const signup = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HTTPError("Invalid input passed, please check your data.", 402));
  }

  const { name, email, password } = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    return next(new HTTPError("Signing up failed, please try again later.", 500));
  }

  if (existingUser) {
    return next(new HTTPError("User already exists, please login instead.", 422));
  }

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password,
    places: []
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(new HTTPError("Signing up failed, please try again later.", 500));
  }

  res.status(201).json({
    user: createdUser.toObject({ getters: true })
  });
};



/*
 * =================================================================
 *                              login
 * =================================================================
 */
const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    return next(new HTTPError("Loggin in failed, please try again later.", 500));
  }

  if (!existingUser || existingUser.password !== password) {
    return next(new HTTPError("Invalid credentials, could not log you in.", 401));
  }

  res.json({
    message: "Logged in",
    user: existingUser.toObject({ getters: true })
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;