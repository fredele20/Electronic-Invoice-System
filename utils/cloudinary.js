const cloudinary = require("cloudinary").v2
const config = require("config")
const fs = require("fs")
// const upload = require("./multer")



cloudinary.config({
  cloud_name: config.get("cloud_name"),
  api_key: config.get("api_keys"),
  api_secret: config.get("api_secret")
})


module.exports = cloudinary;