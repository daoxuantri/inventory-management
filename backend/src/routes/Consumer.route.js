const express = require("express")
const Authentication = require("../middlewares/Authentication");
const ConsumerController = require("../controllers/Consumer.controller");
const ConsumerValidation = require("../validations/Consumer.validation");
const Validation = require("../middlewares/Validation");
const router = express.Router();

router.use(Authentication);

router.get("/get-all",ConsumerValidation.query_page,Validation,ConsumerController.getAllUser)
router.get("/get-search",ConsumerController.getUserForSearch)
router.post("/register",ConsumerValidation.RegisterConsumer,Validation,ConsumerController.registerConsumer)
router.delete("/delete/:id",ConsumerValidation.Params_id,Validation,ConsumerController.deleteConsumer)

router.route("/dashboard").get(ConsumerController.dashboardData);
router.get("/get/:id",ConsumerValidation.Params_id,Validation,ConsumerController.getById)
router.patch("/update/:id",ConsumerValidation.RegisterConsumer,Validation,ConsumerController.updateById)



module.exports = router