const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  Title: {
    type: String,
  },
  FirstName: {
    type: String,
  },
  LastName: {
    type: String,
  },
  Email: {
    type: String,
    validate: [validator.isEmail, "Field must be a valid email address"],
  },
  Password: {
    type: String,
  },
  DateOfBirth: {
    type: String,
  },
  Address: {
    type: String,
  },
  Address2: {
    type: String,
  },
  City: {
    type: String,
  },
  State: {
    type: String,
  },
  Zip_Postal_Code: {
    type: String,
  },
  AdditionalInformation: {
    type: String,
  },
  HomePhone: {
    type: String,
  },
  MobilePhone: {
    type: String,
  },
  role: {
    type: String,
    default: "Customer",
  },
  Balance: {
    type: Number,
    default: 5000,
  },
  cart: [
    {
      itemId: {
        type: String, // Storing item IDs as strings
      },
      image: {
        type: String,
      },
      price: {
        type: Number,
      },
      Discount: {
        type: Number,
        default: 0,
      },
      Tax: {
        type: Number,
        default: 0,
      },
      Total: {
        type: Number,
      },
      quantity: {
        type: Number,
        default: 1, // Default quantity is 1, can be adjusted as needed
      },
    },
  ],
  CartProductsCount: {
    type: Number,
  },
  TotalPrice: {
    type: Number,
  },
  TotalDiscount: {
    type: Number,
    default: 0,
  },
  TotalTax: {
    type: Number,
    default: 0,
  },
  TotalAll: {
    type: Number,
  },
});

module.exports = mongoose.model("User", userSchema);
