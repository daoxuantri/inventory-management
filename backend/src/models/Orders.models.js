const mongoose = require("mongoose")
const { Schema } = mongoose;

const ordersSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    consumer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consumer',
        required: true
    },
    items: {
        type: [
            {
                name: {
                    type: String,
                    trim: true
                },
                price: {
                    type: Number
                }
            }
        ]
    },

    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true })


const Order = mongoose.model("Order", ordersSchema)
module.exports = Order