const express = require("express")
const customer = require("../routes/customer")
const product = require("../routes/product")
const errors = require("../middleware/errors")
const cors = require("cors")


module.exports = function(app) {
  app.use(express.json());
  app.use(cors())
  app.use("/api/customer", customer)
  app.use("/api/products", product)

  app.use(errors)
}