const express = require("express")
const router = express.Router()
const { validateCustomer, passwordHash, validateLogin, matchPassword } = require("../utils/index")
const { Customer } = require("../models/customer");
const _ = require("lodash");
const { auth } = require("../middleware/auth");




router.post("/register", async(req, res) => {

  // Validation of request body
  const { error } = validateCustomer(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  // Check if customer with the given email is already existing in the database
  let customer = await Customer.findOne({ email: req.body.email });
  if (customer) return res.status(400).send("A user with the email already exists");

  customer = await Customer.findOne({ phone: req.body.phone })
  if (customer) return res.status(400).send("A user with the phone number already exists");

  // Hash customer password before creating the new customer
  req.body.password = await passwordHash(req.body.password)

  customer = new Customer(_.pick(req.body, ["firstname", "lastname", "email", "password", "address", "phone"]));

  // Create and send token upon successful customer registration
  const token = customer.generateAuthToken();
  if (!token) return res.status(400).send("Could not generate auth token")

  customer = await customer.save()
  
  res
    .header("x-auth-token", token)
    .send({
      data:_.pick(customer, ["_id", "firstname", "lastname", "address", "phone", "email"]), 
      token
    });

})

router.post("/login", async(req, res) => {

  const { error } = validateLogin(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  let customer = await Customer.findOne({ email: req.body.email })
  if (!customer) return res.status(400).send("Invalid email or password")

  const validPassword = await matchPassword(customer.password, req.body.password)
  if (!validPassword) return res.status(400).send("Invalid email or password")

  // Create and send token upon successful customer login
  const token = customer.generateAuthToken();

  res.status(200).send({token})
})

router.get("/me", auth, async(req, res) => {
  const customer = await Customer.findById(req.customer._id).select("-password")
  res.send(customer)
})

module.exports = router