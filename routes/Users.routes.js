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

router.route("/clearCart").patch(UsersController.clearCart);

router.route("/RemoveFromCart").patch(UsersController.removeFromCart);
router.route("/removeOneFromCart").patch(UsersController.removeOneFromCart);

router.route("/changeQuantity").patch(UsersController.changeQuantity);

module.exports = router;
