

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String
    },
    email: {

        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    accessToken: {
        type: String,
          }
   

});


module.exports = mongoose.model("usersData", userSchema, "pahal_admins");