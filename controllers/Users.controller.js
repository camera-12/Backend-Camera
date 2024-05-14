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

// Middleware to add an item to the user's cart
const addtoCart = asyncWrapper(async (req, res, next) => {
  const { userId, itemId, image, price, quantity, Discount, Tax } = req.body;

  if (!userId || !itemId || !image || !price || !quantity) {
    const err = appError.create(
      "Missing required fields",
      404,
      httpStatusText.FAIL
    );
    return next(err);
  }

  // Find the user by ID and update their cart
  const user = await UserDB.findOne({ _id: userId });
  if (!user) {
    const err = appError.create("User not found", 404, httpStatusText.FAIL);
    return next(err);
  }

  // Check if the item already exists in the cart
  const existingItemIndex = user.cart.findIndex(
    (item) => item.itemId === itemId
  );

  const totalPrice = +price * +quantity;
  const totalDiscount = +Discount * +quantity;
  const beforeTax = totalPrice - totalDiscount;
  const afterTax = beforeTax * (1 + +Tax / 100);

  if (existingItemIndex !== -1) {
    // Item already exists, increment quantity
    user.cart[existingItemIndex].quantity += quantity;
    user.cart[existingItemIndex].image = image;
    user.cart[existingItemIndex].price = price;
    user.cart[existingItemIndex].TotalPrice =
      price * user.cart[existingItemIndex].quantity;
    user.cart[existingItemIndex].Discount = Discount;
    user.cart[existingItemIndex].TotalDiscount =
      Discount * user.cart[existingItemIndex].quantity;
    user.cart[existingItemIndex].Tax = Tax;
    // Recalculate total based on updated quantity, price, discount, and tax

    const beforeTax =
      +user.cart[existingItemIndex].TotalPrice -
      +user.cart[existingItemIndex].TotalDiscount;
    const afterTax = beforeTax * (1 + +Tax / 100);

    user.cart[existingItemIndex].Total = afterTax;
  } else {
    // Item doesn't exist, add it to the cart
    user.cart.push({
      itemId,
      image,
      price,
      quantity,
      Discount,
      Tax,
      Total: afterTax,
      TotalPrice: totalPrice,
      TotalDiscount: totalDiscount,
    });
  }
  user.CartProductsCount = user.cart.length;

  user.TotalDiscount = 0;
  user.TotalPrice = 0;
  user.TotalTax = 0;
  user.TotalAll = 0;
  user.cart.forEach((item) => {
    user.TotalDiscount += item.TotalDiscount;
    user.TotalPrice += item.TotalPrice;
    user.TotalTax += item.Tax;
    user.TotalAll += item.Total;
  });

  await user.save();

  res.status(201).json({ status: httpStatusText.SUCCESS, user });
});

// Middleware to clear the user's cart
const clearCart = asyncWrapper(async (req, res, next) => {
  const { userId } = req.body;
  // Find the user by ID and clear their cart
  const user = await UserDB.findById(userId);
  if (!user) {
    const err = appError.create("User not found", 404, httpStatusText.FAIL);
    return next(err);
  }

  user.cart = [];
  user.CartProductsCount = user.cart.length;
  user.TotalDiscount = 0;
  user.TotalPrice = 0;
  user.TotalTax = 0;
  user.TotalAll = 0;

  await user.save();

  res.status(201).json({ status: httpStatusText.SUCCESS, user });
});

// Middleware to remove an item from the user's cart
const removeOneFromCart = asyncWrapper(async (req, res, next) => {
  const { userId, itemId } = req.body;

  // Find the user by ID and remove the item from their cart
  const user = await UserDB.findById(userId);
  if (!user) {
    const err = appError.create("User not found", 404, httpStatusText.FAIL);
    return next(err);
  }

  const existingItemIndex = user.cart.findIndex(
    (item) => item.itemId === itemId
  );
  if (existingItemIndex === -1) {
    const err = appError.create("Product not exist", 404, httpStatusText.FAIL);
    return next(err);
  }

  if (user.cart[existingItemIndex].quantity > 1) {
    user.cart[existingItemIndex].quantity -= 1;

    user.cart[existingItemIndex].TotalPrice =
      user.cart[existingItemIndex].price *
      user.cart[existingItemIndex].quantity;

    user.cart[existingItemIndex].TotalDiscount =
      user.cart[existingItemIndex].Discount *
      user.cart[existingItemIndex].quantity;
    // Recalculate total based on updated quantity, price, discount, and tax

    const beforeTax =
      +user.cart[existingItemIndex].TotalPrice -
      +user.cart[existingItemIndex].TotalDiscount;
    const afterTax = beforeTax * (1 + user.cart[existingItemIndex].Tax / 100);

    user.cart[existingItemIndex].Total = afterTax;
  } else {
    const err = appError.create(
      "Can't Remove Product",
      404,
      httpStatusText.FAIL
    );
    return next(err);
  }

  user.CartProductsCount = user.cart.length;

  user.TotalDiscount = 0;
  user.TotalPrice = 0;
  user.TotalTax = 0;
  user.TotalAll = 0;
  user.cart.forEach((item) => {
    user.TotalDiscount += item.TotalDiscount;
    user.TotalPrice += item.TotalPrice;
    user.TotalTax += item.Tax;
    user.TotalAll += item.Total;
  });
  await user.save();

  res.status(201).json({ status: httpStatusText.SUCCESS, user });
});

const removeFromCart = asyncWrapper(async (req, res, next) => {
  const { userId, itemId } = req.body;

  // Find the user by ID and remove the item from their cart
  const user = await UserDB.findById(userId);
  if (!user) {
    const err = appError.create("User not found", 404, httpStatusText.FAIL);
    return next(err);
  }

  const existingItemIndex = user.cart.findIndex(
    (item) => item.itemId === itemId
  );
  if (existingItemIndex === -1) {
    const err = appError.create("Product not exist", 404, httpStatusText.FAIL);
    return next(err);
  }
  user.cart.splice(existingItemIndex, 1);

  user.CartProductsCount = user.cart.length;

  user.TotalDiscount = 0;
  user.TotalPrice = 0;
  user.TotalTax = 0;
  user.TotalAll = 0;
  user.cart.forEach((item) => {
    user.TotalDiscount += item.TotalDiscount;
    user.TotalPrice += item.TotalPrice;
    user.TotalTax += item.Tax;
    user.TotalAll += item.Total;
  });
  await user.save();

  res.status(201).json({ status: httpStatusText.SUCCESS, user });
});

// Middleware to remove an item from the user's cart
const changeQuantity = asyncWrapper(async (req, res, next) => {
  const { userId, itemId, quantity } = req.body;

  // Find the user by ID and remove the item from their cart
  const user = await UserDB.findById(userId);
  if (!user) {
    const err = appError.create("User not found", 404, httpStatusText.FAIL);
    return next(err);
  }

  // Find the index of the item in the cart
  const itemIndex = user.cart.findIndex((item) => item.itemId === itemId);

  // If item not found, return error
  if (itemIndex === -1) {
    const err = appError.create(
      "Item not found in cart",
      404,
      httpStatusText.FAIL
    );
    return next(err);
  }

  // Update the quantity of the item
  if (quantity > 0) {
    user.cart[itemIndex].quantity = quantity;

    user.cart[itemIndex].TotalPrice = user.cart[itemIndex].price * quantity;

    user.cart[itemIndex].TotalDiscount =
      user.cart[itemIndex].Discount * user.cart[itemIndex].quantity;
    // Recalculate total based on updated quantity, price, discount, and tax

    const beforeTax =
      +user.cart[itemIndex].TotalPrice - +user.cart[itemIndex].TotalDiscount;
    const afterTax = beforeTax * (1 + user.cart[itemIndex].Tax / 100);

    user.cart[itemIndex].Total = afterTax;
  } else {
    const err = appError.create(
      "Quantity Not allowed",
      400,
      httpStatusText.ERROR
    );
    return next(err);
  }

  user.TotalDiscount = 0;
  user.TotalPrice = 0;
  user.TotalTax = 0;
  user.TotalAll = 0;
  user.cart.forEach((item) => {
    user.TotalDiscount += item.TotalDiscount;
    user.TotalPrice += item.TotalPrice;
    user.TotalTax += item.Tax;
    user.TotalAll += item.Total;
  });
  await user.save();

  res.status(201).json({ status: httpStatusText.SUCCESS, user });
});

module.exports = {
  AccountRegister,
  AccountLogin,
  addtoCart,
  clearCart,
  removeFromCart,
  removeOneFromCart,
  changeQuantity,
};
