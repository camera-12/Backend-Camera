const { body } = require("express-validator");

const userRegisterValidationSchema = () => {
  return [
    body("Title").notEmpty().withMessage("Title is required"),
    body("FirstName").notEmpty().withMessage("First Name is required"),
    body("LastName").notEmpty().withMessage("Last Name is required"),
    body("Email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),
    body("Password").notEmpty().withMessage("Password is required"),
    body("DateOfBirth").notEmpty().withMessage("Date of Birth is required"),
    body("Address").notEmpty().withMessage("Address is required"),
    body("City").notEmpty().withMessage("City is required"),
    body("State").notEmpty().withMessage("State is required"),
    body("Zip_Postal_Code")
      .notEmpty()
      .withMessage("Zip/Postal Code is required"),
    body("AdditionalInformation"), // Assuming this field is optional
    body("HomePhone"), // Assuming this field is optional
    body("MobilePhone"), // Assuming this field is optional
  ];
};

const userLoginValidationSchema = () => {
  return [
    body("Email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),
    body("Password").notEmpty().withMessage("Password is required"),
  ];
};

const userPayValidationSchema = () => {
  return [
    body("card_number").notEmpty().withMessage("Invalid card_number format"),
    body("CVV2").notEmpty().withMessage("Invalid CVV2 format"),
    body("month").notEmpty().withMessage("Invalid month format"),
    body("year").notEmpty().withMessage("Invalid year format"),
  ];
};
module.exports = {
  userRegisterValidationSchema,
  userLoginValidationSchema,
  userPayValidationSchema,
};
