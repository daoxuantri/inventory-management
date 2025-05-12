const httpStatus = require("http-status");
const ConsumerModel = require("../models/Consumer.models");
const OrdersModel = require("../models/Orders.models");
const ApiError = require("../utils/ApiError"); 

exports.registerConsumer = async (req, res, next) => {
  try {
    const { name, email, mobile, dob, address } = req.body;
    const user = req?.user;

    const checkExist = await ConsumerModel.findOne({ email, user });

    if (checkExist) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Consumer Already in Record");
    }

    await ConsumerModel.create({
      name,
      email,
      mobile,
      dob,
      address,
      user,
    });

    return res.status(200).json({
      success: true,
      message: "Consumer Added ",
    });
  } catch (err) {
    next(err)
  }
};

exports.updateById = async (req, res, next) => {
  try {
    const { name, email, mobile, dob, address } = req.body;
    const user = req?.user;
    const id = req.params.id;

    const checkExist = await ConsumerModel.findById(id);

    if (!checkExist) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Consumer Not Found in Record");
    }

    if (checkExist.email !== email) {
      const checkExistEmail = await ConsumerModel.findOne({ email, user });
      if (checkExistEmail) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Consumer Email Already in Another Record"
        );
      }
    }

    await ConsumerModel.findByIdAndUpdate(id, {
      name,
      email,
      mobile,
      dob,
      address,
      user,
    });

    return res.status(200).json({
      success: true,
      message: "Consumer Updated :)",
    });
  } catch (err) {
    next(err)
  }
};

exports.getById = async (req, res, next) => {
  try {
    const user = req?.user;
    const id = req.params.id;

    const checkExist = await ConsumerModel.findOne({ _id: id, user });

    if (!checkExist) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Consumer Not Found in Record");
    }

    return res.status(httpStatus.OK).json({
      success: true,
      user: checkExist,
    });
  } catch (err) {
    next(err)
  }
};

exports.getAllUser =async (req, res, next) => {
  try {
    const user = req?.user;
    const page = req.query?.page || 1;
    const query = req.query?.query || "";
    const limit = 10;
    const skip = (Number(page) - 1) * limit;

    const queries = {
      user,
      $or: [
        { name: new RegExp(query, "i") },
        { email: new RegExp(query, "i") },
        { address: new RegExp(query, "i") },
        { mobile: new RegExp(query, "i") },
      ],
    };

    const data = await ConsumerModel.find(queries)
      .select("name email mobile")
      .skip(skip)
      .limit(limit);

    const totalConsumer = await ConsumerModel.countDocuments(queries);
    const hasMore = skip + limit < totalConsumer;

    return res.status(httpStatus.OK).json({
      success: true,
      users: data,
      more: hasMore,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteConsumer = async (req, res, next) => {
  try {
    const user = req?.user;
    const id = req.params.id;

    const checkExist = await ConsumerModel.findOneAndDelete({ _id: id, user });

    if (!checkExist) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Consumer Not Found in Record");
    }

    await OrdersModel.deleteMany({ consumer: id });

    return res.status(httpStatus.OK).json({
      success: true,
      message: "Consumer Deleted :)",
    });
  } catch (err) {
    next(err)
  }
};

exports.getUserForSearch =async (req, res, next) => {
  try {
    const user = req?.user;

    const data = await ConsumerModel.find({ user }).select("name dob");

    return res.status(httpStatus.OK).json({
      success: true,
      users: data,
    });
  } catch (err) {
    next(err)
  }
};

exports.dashboardData =async (req, res, next) => {
  try {
    const user = req?.user;

    const consumers = await ConsumerModel.countDocuments({ user });
    const orders = await OrdersModel.find({ user }).select("items.price -_id");

    const arr = orders.map((cur) => [...cur.items.map((c) => c.price)]);

    return res.status(httpStatus.OK).json({
      success: true,
      consumers,
      orders: orders.length,
      sell: arr.length > 0 ? arr.flat().reduce((a, c) => a + c, 0) : 0,
    });
  } catch (err) {
    next(err)
  }
};