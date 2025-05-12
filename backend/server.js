const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const dbConfig = require('./src/config/db.config');


console.log("JWT_SECRET:", process.env.JWT_SECRET);
const app = express();


app.use(cors({ origin: true, credentials: true }));
app.use(express.json());


mongoose.connect(dbConfig.db)
    .then(() => console.log("✅ Database Connected"))
    .catch((err) => {
        console.error("❌ Database Connection Failed: " + err);
        process.exit(1);
    });

// Routes
app.use("/api/auth",require("./src/routes/Auth.route"))
app.use("/api/consumer",require("./src/routes/Consumer.route"))
app.use("/api/order",require("./src/routes/Order.route"))
// Middleware xử lý lỗi
app.use((err, req, res, next) => {
    console.error(err.message);
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
});

// Khởi động server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
