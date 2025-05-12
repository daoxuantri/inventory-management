const express = require("express");
const Authentication = require("../middlewares/Authentication");
const Validation = require("../middlewares/Validation");
const AuthValidation = require("../validations/Auth.validation");
const AuthController = require("../controllers/Auth.controller");

const router = express.Router();


router.get("/profile", Authentication, AuthController.profileController);
router.post("/register", AuthValidation.RegisterUser, Validation, AuthController.registerUser);
router.post("/login", AuthValidation.LoginUser, Validation, AuthController.loginUser);


module.exports = router;