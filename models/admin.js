const mongoose = require("mongoose")

const adminSchema = mongoose.Schema({
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

    imageURL: {
      type: String,
      validate: {
          validator: function(v) {
              return v && v.length > 0
          },
          message: "Please add an image"
      },
      required: false
    //   default: ""
    }
})


adminSchema.methods.PasswordHash = function() {}


const Admin = mongoose.model('Admin', adminSchema)


exports.Admin = Admin;