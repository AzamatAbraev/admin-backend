const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/users");

router.route("/").get(getAllUsers).delete(deleteUser);
router.route("/:id").get(getUser).patch(updateUser);

module.exports = router;
