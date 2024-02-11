const User = require("../models/user");

const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const getAllUsers = async (req, res) => {
  let { limit, page } = req.query;
  limit = parseInt(limit);
  page = parseInt(page);

  const users = await User.find({})
    .sort("createdAt")
    .limit(limit)
    .skip((page - 1) * limit);

  const count = await User.countDocuments();

  res.status(StatusCodes.OK).json({
    users,
    total: count,
    limit: limit,
    currentPage: page,
  });
};

const getUser = async (req, res) => {
  const { id: userId } = req.params;
  const user = await User.findOne({ _id: userId });

  if (!user) {
    throw new NotFoundError(`No user with id ${userId}`);
  }

  res.status(StatusCodes.OK).json({ user });
};

const updateUser = async (req, res) => {
  const { id: userId } = req.params;
  const updateData = req.body;

  if (updateData.name === "" || updateData.email === "") {
    throw new BadRequestError("Please provide valid values");
  }

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });
  res.status(StatusCodes.OK).json({ user });
};

const deleteUser = async (req, res) => {
  const { userId } = req.body;
  const user = await User.findByIdAndDelete({ _id: userId });
  if (!user) {
    throw new NotFoundError(`No user with id ${userId}`);
  }
  res.status(StatusCodes.OK).json({ message: "User deleted successfully" });
};

module.exports = { getAllUsers, getUser, updateUser, deleteUser };
