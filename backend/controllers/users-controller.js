const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) { return next(new HTTPError("Could not create user, try again later.", 500)); }

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: []
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(new HTTPError("Signing up failed, please try again later.", 500));
  }

  let token;
  try {
    token = jwt.sign(
      {
        userID: createdUser.id,
        email: createdUser.email
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HTTPError("Signing up failed, please try again later.", 500));
  }

  res.status(201).json({
    userID: createdUser.id,
    email: createdUser.email,
    token
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
    return next(new HTTPError("Logging in failed, please try again later.", 500));
  }

  if (!existingUser) {
    return next(new HTTPError("Invalid credentials, could not log you in.", 403));
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    return next(new HTTPError("Could not logged you in, please check your credentials and try again.", 500));
  }

  if (!isValidPassword) { 
    return next(new HTTPError("Could not logged you in, please check your credentials and try again.", 500));
  }

  let token;
  try {
      token = jwt.sign(
      {
        userID: existingUser.id,
        email: existingUser.email
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HTTPError("Logging in failed, please try again later.", 500));
  }
  
  res.json({
    userID: existingUser.id,
    email: existingUser.email,
    token
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;