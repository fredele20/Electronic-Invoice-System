const multer = require("multer")
const cloudinary = require("cloudinary")
const cloudinaryStorage = require("multer-storage-cloudinary")
const path = require("path")

module.exports = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, callback) => {
    let ext = path.extname(file.originalname);
    if(ext !== ".jpg" && ext !== ".jpeg" && ext != ".PNG" && ext != ".pdf") {
      callback(new Error("Unsupported file type."), false)
      return
    }
    callback(null, true)
  }
})