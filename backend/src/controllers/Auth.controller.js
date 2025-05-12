const httpStatus = require("http-status");
const UserModel = require("../models/user.models");
const ProfileModel = require("../models/profile.models");
const ApiError = require("../utils/ApiError");
const { generatoken } = require("../utils/Token.utils");
const axios = require("axios");

exports.registerUser = async (req, res, next) => {
  try {
    const { email, password, name, token } = req.body;

    // Verify reCAPTCHA
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      {},
      {
        params: {
          secret: process.env.CAPTCHA_SCREATE_KEY,
          response: token,
        },
      }
    );

    const data = response.data;
    if (!data.success) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Captcha Không Hợp Lệ",
      });
    }

    // Check if user already exists
    const checkExist = await UserModel.findOne({ email });
    if (checkExist) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Email đã được đăng ký, vui lòng sử dụng email khác",
      });
    }

    // Create new user
    const user = new UserModel({ email, password, name });
    const savedUser = await user.save();
    if (!savedUser) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Đăng ký người dùng thất bại",
      });
    }

    // Generate tokens
    const tokend = generatoken(savedUser);
    const refresh_token = generatoken(savedUser, "2d");

    // Create profile with refresh token
    const profile = new ProfileModel({ user: savedUser._id, refresh_token });
    await profile.save();

    return res.status(httpStatus.CREATED).send({
      success: true,
      message: "Đăng ký người dùng thành công",
      data: {
        user: { email: savedUser.email, name: savedUser.name },
        token: tokend,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password, token } = req.body; 
    

    // Verify reCAPTCHA
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      {},
      {
        params: {
          secret: process.env.CAPTCHA_SCREATE_KEY,
          response: token,
        },
      }
    );

    const data = response.data;
    if (!data.success) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Captcha Không Hợp Lệ",
      });
    }

    // Check if user exists
    const checkExist = await UserModel.findOne({ email });
    if (!checkExist) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Người dùng chưa được đăng ký",
      });
    }

    // Validate password
    if (password !== checkExist.password) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Thông tin đăng nhập không hợp lệ",
      });
    }

    // Generate token
    const tokend = generatoken(checkExist);

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        user: { email: checkExist.email, name: checkExist.name },
        token: tokend,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.profileController = async (req, res, next) => {
  try {
    const user = req.user;

    console.log("Da toi day roi");

    // Fetch user profile
    const checkExist = await UserModel.findById(user).select("name email");
    if (!checkExist) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Lấy thông tin hồ sơ thành công",
      data: {
        user: checkExist,
      },
    });
  } catch (err) {
    next(err);
  }
};