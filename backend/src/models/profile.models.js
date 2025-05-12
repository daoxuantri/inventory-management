const mongoose = require("mongoose")
const {Schema} = mongoose

const profileSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    refresh_token: {
        type: String,
        default: ''
    }
}, { timestamps: true })


// 

const Profile = mongoose.model("Profile", profileSchema)
module.exports = Profile