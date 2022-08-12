const mongoose = require("mongoose")

const productSchema = mongoose.Schema({
    ownerId: mongoose.Types.ObjectId,
    ownerName: {
      type: String,
      required: [true, "Product must belong to a particular owner"]
    },
    name: {
        type: String,
        required: [true, "product must have a name"],
        minlength: 3,
        maxlength: 255
    },

    desc: {
      type: String,
      required: [false, "optional"],
      maxlength: 255
    },

    qty: {
      type: Number,
      required: [true, "product should have at least one quantity available"]
    },

    price: {
        type: Number,
        required: [true, "product must have a price"],
    },

    address: {
      type: String,
      // required: [true, "please add an address, this can be seller's address or store address"]
    },

    dateCreated: {
      type: Date,
      required: true,
      default: Date.now
    },

    dateSoldOut: {
      type: Date
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


const Product = mongoose.model('Product', productSchema)

exports.Product = Product;