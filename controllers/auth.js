const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");

const bcrypt = require("bcryptjs");

const register = async (req, res) => {
  const user = await User.create({ ...req.body });
  const token = user.createJWT();
  res
    .status(StatusCodes.CREATED)
    .json({ user: { name: user.name, userId: user._id }, token });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthenticatedError("User not found");
  }

  if (user.status === "blocked") {
    throw new UnauthenticatedError(
      "You have been blocked. Please contact IT department for more information",
    );
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Incorrect Password");
  }

  user.lastLogin = new Date();
  await user.save();

  const token = user.createJWT();
  res
    .status(StatusCodes.OK)
    .json({ user: { name: user.name, userId: user._id }, token });
};

const resetPassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("User not found");
  }

  const isPasswordCorrect = await user.comparePassword(currentPassword);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  const token = user.createJWT();

  res
    .status(StatusCodes.OK)
    .json({ msg: "Password updated successfully", token });
};

const blockUser = async (req, res) => {
  const { userId } = req.body;
  const userCheck = await User.findById(userId);
  if (userCheck.status === "blocked") {
    throw new BadRequestError("User is already blocked");
  }
  const user = await User.findByIdAndUpdate(
    userId,
    { status: "blocked" },
    { new: true },
  );
  if (!user) {
    throw new NotFoundError(`No user with id ${userId}`);
  }
  res.status(StatusCodes.OK).json({ msg: "User blocked successfully" });
};

const unblockUser = async (req, res) => {
  const { userId } = req.body;
  const userCheck = await User.findById(userId);
  if (userCheck.status === "active") {
    throw new BadRequestError("User is already active");
  }
  const user = await User.findByIdAndUpdate(
    userId,
    { status: "active" },
    { new: true },
  );
  if (!user) {
    throw new NotFoundError(`No user with id ${userId}`);
  }
  res.status(StatusCodes.OK).json({ msg: "User unblocked successfully" });
};

module.exports = { register, login, resetPassword, blockUser, unblockUser };
