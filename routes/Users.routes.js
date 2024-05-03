const express = require("express");
const router = express.Router();

const UsersController = require("../controllers/Users.controller");
const validationSchema = require("../middelwares/validationSchema");

router.route("/register").post(
  // validationSchema.userRegisterValidationSchema(),
  UsersController.AccountRegister
);

router
  .route("/login")
  .post(
    validationSchema.userLoginValidationSchema(),
    UsersController.AccountLogin
  );

router.route("/addtoCart").patch(UsersController.addtoCart);

module.exports = router;
