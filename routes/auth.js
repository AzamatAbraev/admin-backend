const express = require("express");
const router = express.Router();

const {
  register,
  login,
  resetPassword,
  blockUser,
  unblockUser,
} = require("../controllers/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/password", resetPassword);
router.patch("/block", blockUser);
router.patch("/unblock", unblockUser);

module.exports = router;
