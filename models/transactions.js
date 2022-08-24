const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)
const mongoose = require('mongoose')


const transactionSchema = new mongoose.Schema({
  sellerId: mongoose.Types.ObjectId,
  sellerName: {
    type: String,
    required: [true, "Product must belong to a particular owner"]
  },

  buyerId: mongoose.Types.ObjectId,
  buyerName: {
    type: String,
    required: [true, "Product must belong to a particular owner"]
  },

  productId: mongoose.Types.ObjectId,

  productName: {
    type: String,
    required: true
  },

  fileURL: {
    type: String,
    validate: {
        validator: function(v) {
            return v && v.length > 0
        },
        message: "Please add a file"
    },
    required: false
  //   default: """joi-objectid": "^4.0.2",
  },

  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },

  isDeleted: {
    type: Boolean,
    default: false
  }
})

// This is a static type of function that match the sellerId and
// userId to the transactionSchema.
// transactionSchema.statics.lookup = function (sellerId, userId) {
//   return this.findOne({
//     'product.ownerId': sellerId,
//     'user._id': userId
//   })
// }

// This is validation based on Joi library
// function validateOwnedVehicle(ownedVehicle) {
//   const schema = {
//     sellerId: Joi.objectId().required(),
//     userId: Joi.objectId().required()
//   }
//   return Joi.validate(ownedVehicle, schema)
// }

const CompletedTransaction = mongoose.model('CompletedTransaction', transactionSchema)

exports.CompletedTransaction = CompletedTransaction