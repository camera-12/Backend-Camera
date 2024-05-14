const httpStatusText = require("../utils/httpStatusText");
const appError = require("../utils/appError");
const asyncWrapper = require("../middelwares/asyncWrapper");
const { validationResult } = require("express-validator");
const UserDB = require("../models/user.model");

const AccountRegister = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = appError.create(errors.array(), 401, httpStatusText.ERROR);
    return next(err);
  }

  const {
    Title,
    FirstName,
    LastName,
    Email,
    Password,
    DateOfBirth,
    Address,
    Address2,
    City,
    State,
    Zip_Postal_Code,
    AdditionalInformation,
    HomePhone,
    MobilePhone,
  } = req.body;

  const oldUserEmail = await UserDB.findOne({ Email });
  if (oldUserEmail) {
    const err = appError.create(
      "User already exists with this email",
      400,
      httpStatusText.FAIL
    );
    return next(err);
  }

  const newUser = new UserDB({
    Title,
    FirstName,
    LastName,
    Email,
    Password,
    DateOfBirth,
    Address,
    Address2,
    City,
    State,
    Zip_Postal_Code,
    AdditionalInformation,
    HomePhone,
    MobilePhone,
  });

  await newUser.save();

  res.status(201).json({ status: httpStatusText.SUCCESS, newUser });
});

const AccountLogin = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = appError.create(errors.array(), 401, httpStatusText.ERROR);
    return next(err);
  }

  const { Email, Password } = req.body;

  try {
    const user = await UserDB.findOne({ Email });

    if (!user || Password !== user.Password) {
      const err = appError.create(
        "Invalid email or password",
        400,
        httpStatusText.FAIL
      );
      return next(err);
    }

    res.json({ status: httpStatusText.SUCCESS, user });
  } catch (error) {
    console.error("Error in account login:", error);
    const err = appError.create(
      "Internal server error",
      500,
      httpStatusText.ERROR
    );
    return next(err);
  }
});

const addtoCart = asyncWrapper(async (req, res, next) => {
  const { userId, Frontcart, clearCart, removeItemId } = req.body;

  try {
    // Find the user by userId
    const user = await UserDB.findOne({ _id: userId });

    if (!user) {
      const err = appError.create("Invalid User", 400, httpStatusText.FAIL);
      return next(err);
    }

    if (clearCart) {
      // Clear the cart by emptying the cart array
      user.cart = [];
    } else if (removeItemId) {
      // Remove the item with the specified itemId from the cart
      const removedItem = user.cart.find(
        (item) => item.itemId === removeItemId
      );
      if (removedItem) {
        user.cart = user.cart.filter((item) => item.itemId !== removeItemId);
        // Deduct removed item's price, discount, and tax from totals
        user.TotalPrice -= removedItem.Total || 0;
        user.TotalDiscount -= removedItem.Discount || 0;
        user.TotalTax -= removedItem.Tax * removedItem.quantity || 0;
        user.CartProductsCount -= removedItem.quantity || 0;
        // Recalculate TotalAll
        user.TotalAll = user.TotalPrice - user.TotalDiscount + user.TotalTax;
      }
    } else {
      let existingCartItem = user.cart.find(
        (item) => item.itemId === Frontcart.itemId
      );

      if (existingCartItem) {
        // If the item exists, update its quantity
        existingCartItem.quantity += Frontcart.quantity;
      } else {
        // If the item doesn't exist, add it to the cart
        existingCartItem = {
          itemId: Frontcart.itemId,
          image: Frontcart.image,
          price: Frontcart.price,
          quantity: Frontcart.quantity,
          Discount: Frontcart.Discount || 0,
          Tax: Frontcart.Tax || 0,
        };
        user.cart.push(existingCartItem);
      }

      // Calculate total for the new/updated item
      existingCartItem.Total =
        existingCartItem.price * existingCartItem.quantity -
        existingCartItem.Discount +
        existingCartItem.Tax * existingCartItem.quantity;

      // Update totals
      user.TotalPrice = user.cart.reduce(
        (total, item) => total + (item.Total || 0),
        0
      );
      user.TotalDiscount = user.cart.reduce(
        (total, item) => total + (item.Discount || 0),
        0
      );
      user.TotalTax = user.cart.reduce(
        (total, item) => total + (item.Tax * item.quantity || 0),
        0
      );
      
      user.CartProductsCount = new Set(
        user.cart.map((item) => item.itemId)
      ).size;

      user.TotalAll = user.TotalPrice - user.TotalDiscount + user.TotalTax;
    }

    // Save the updated user
    await user.save();

    // Respond with success
    res.status(200).json({ message: "Cart updated successfully" });
  } catch (err) {
    // Handle errors
    next(err);
  }
});

module.exports = {
  AccountRegister,
  AccountLogin,
  addtoCart,
};
