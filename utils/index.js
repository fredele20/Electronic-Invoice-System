const bcrypt = require("bcrypt")
const Joi = require("joi")

// Customer Util managements
// export const StatusActivated = "Activated"
// export const StatusDeactivated = "Deactivated"

// Customer inputs validations using Joi.
function validateCustomer(customer) {
  const schema = {
    firstname: Joi.string().min(3).required(),
    lastname: Joi.string().min(3).required(),
    email: Joi.string().min(5).required().email(),
    phone: Joi.string().required(),
    address: Joi.string().min(5).required(),
    password: Joi.string().min(5).required()
  }
  return Joi.validate(customer, schema)
}

function validateLogin(login) {
  const schema = {
    email: Joi.string().min(5).max(255).required(),
    password: Joi.string().min(5).max(255).required()
  }
  return Joi.validate(login, schema)
}

function validateProduct(product) {
  const schema = {
    name: Joi.string().min(3).max(255).required(),
    desc: Joi.string().max(255),
    qty: Joi.number().required(),
    price: Joi.number().required()
  }
}


async function passwordHash(password) {
  const salt =  await bcrypt.genSalt(10)
  let hashedPassword = await bcrypt.hash(password, salt)
  return hashedPassword
}

// Password comparison function for user login
async function matchPassword(enteredPassword, existingPassword) {
  return await bcrypt.compare(existingPassword, enteredPassword)
}


module.exports.validateCustomer = validateCustomer;
module.exports.validateLogin = validateLogin;
module.exports.validateProduct = validateProduct;
module.exports.passwordHash = passwordHash;
module.exports.matchPassword = matchPassword;