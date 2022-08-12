const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const config = require("config")
const { StatusActivated } = require("../utils")

const customerSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: [true, "please add your firstname"],
        minlength: 3,
        maxlength: 255
    },

    lastname: {
        type: String,
        required: [true, "please add your lastname"],
        minlength: 3,
        maxlength: 255
    },

    phone: {
        type: String,
        required: [true, "please add your phone number"],
        unique: true
    },

    // status: {
    //   type: String,
    //   default: StatusActivated
    // },

    address: {
      type: String,
      required: [true, "please add an address"]
    },

    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 255,
        // match: /pattern/ TODO: will add regexp pattern for email here later
    },

    password: {
        type: String,
        required: true,
        minlength: 5
    },

    // imageURL: {
    //   type: String,
    //   validate: {
    //       validator: function(v) {
    //           return v && v.length > 0
    //       },
    //       message: "Please add an image"
    //   },
    //   required: false
    // //   default: ""
    // }
})

customerSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
      { _id: this._id, email: this.email, phone: this.phone },
      config.get("jwtPrivateKey")
    );
    return token;
  };


customerSchema.methods.PasswordHash = function() {}


const Customer = mongoose.model('Customer', customerSchema)


exports.Customer = Customer;