const express = require("express")
const { Product } = require("../models/product")
const mongoose = require('mongoose')
const _ = require("lodash")
const upload = require("../utils/multer")
const cloudinary = require("../utils/cloudinary")
const uploadToCloudinary = require("../utils/cloudinary")
const { auth } = require("../middleware/auth")
const { Customer } = require("../models/customer")
const { generateInvoice } = require("../utils/invoiceData")
const InvoiceGenerator = require('../utils/invoiceGenerator')
var Path = require("path")
const { promises: Fs } = require('fs')
const { CompletedTransaction } = require("../models/transactions")

const router = express.Router()


router.post("/add-product", upload.single("image"), auth, async(req, res) => {

  const customer = await Customer.findById(req.customer._id)
  console.log(req.customer.firstname)
  
  
  const result = await uploadFunc(req.file.path)
  let product = new Product(_.extend(req.body, 
    {
      ownerId: customer._id, 
      ownerName: customer.firstname + " " + customer.lastname,
      imageURL: result.secure_url
    })) 

  product = await product.save()

  res.status(201).send(product)

})

router.post("/", auth, async(req, res) => {
  
  let product = await Product.findById(req.body.productId)
  if(!product) return res.status(404).send("The product with the given id is not found")
  if (product.qty < req.body.qty) return res.status(400).send("Not enough quantity available, go for a lesser one...")

  const customer = await Customer.findById(req.customer._id).select('-password')

  product = await Product.findByIdAndUpdate(
    req.body.productId, 
    { qty: product.qty - req.body.qty },
    {new: true}
  )

  const invoiceData = {
    invoiceDetails: {
      customer: {
        name: customer.firstname + " " + customer.lastname,
        address: customer.address,
        phone: customer.phone,
        email: customer.email
      },
      product: {
        name: product.name,
        description: product.desc,
        seller: product.ownerName,
        quantity: req.body.qty,
        price: product.price,
        paymentAmount: req.body.qty * product.price
      }
    },
    // memo: 'As discussed',
    invoiceNumber: 1234,
    dueDate: new Date().toLocaleDateString()
  }

  const ig = new InvoiceGenerator(invoiceData)
  ig.generate()

  const invoiceResult = await uploadFunc("invoice.pdf")

  let transactionInvoice = new CompletedTransaction(_.extend(req.body, {
    sellerId: product.ownerId,
    sellerName: product.ownerName,
    buyerId: customer._id,
    buyerName: customer.firstname + " " + customer.lastname,
    productId: product._id,
    productName: product.name,
    fileURL: invoiceResult.secure_url
  }))

  transactionInvoice = await transactionInvoice.save()

  const orderResponse = {
    product: {
      name: product.name,
      desc: product.desc,
      qty: req.body.qty
    },
    customer,
    transactionInvoice
  }

  res.status(200).send(orderResponse)
  // res.download("invoice.pdf")
})

router.get("/downloadPDF", (req, res) => {
  res.download("invoice.pdf");
});

router.get("/product/list", async(req, res) => {
  const products = await Product.find()

  res.status(200).send(products)
})

router.get("/:id", async (req, res) => {
  const product =  await Product.findById(req.params.id)
  if(!product) return res.status(404).send("The product with the given id is not found")

  return res.status(200).send(product)
})

router.put("/:id", auth, async(req, res) => {

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { 
      name: req.body.name,
      desc: req.body.desc,
      qty: req.body.qty,
      price: req.body.price
    },
    { new: true }
  )

  if (!product) return res.status(404).send("The product with the given ID is not found.")

  res.send(product)
  
})

router.delete("/:id", auth, async(req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id)
  if (!product) return res.status(404).send("The product with the given ID is not found")

  return res.status(200).send(product)
})


// This is the route to get all the product published by one customer
// DONE
router.get("/ownerProducts/:id", auth, async (req, res) => {
  const checkValid = mongoose.Types.ObjectId.isValid(req.params.id)

  let products;

  checkValid?
    res.send(products = await Product.find({ "ownerId": req.params.id }))
    :res.status(404).send("No product for this customer")
  // res.status(200).send(products)
})

router.get("/product/transactions", async(req, res) => {
  const transactions = await CompletedTransaction.find()

  res.status(200).send(transactions)
})

router.get("/product/transactions/:id", async(req, res) => {
  const transaction = await CompletedTransaction.findById(req.params.id)
  if(!transaction) return res.status(404).send("The transaction with the given ID is not found")

  res.status(200).send(transaction)
})

// This route is to get all transactions from the buyer's end
router.get("/product/buyers-transactions/:id", auth, async(req, res) => {
  const checkValid = mongoose.Types.ObjectId.isValid(req.params.id)

  let buyerTransactions;

  checkValid ? 
    res.send(buyerTransactions = await CompletedTransaction.find({ "buyerId": req.params.id}))
    : res.status(404).send("No customer with the given ID")
})

// This route is to get all transactions from the seller's end
router.get("/product/seller-transactions/:id", auth, async(req, res) => {
  const checkValid = mongoose.Types.ObjectId.isValid(req.params.id)

  let sellerTransactions;

  checkValid ? 
    res.send(sellerTransactions = await CompletedTransaction.find({ "sellerId": req.params.id}))
    : res.status(404).send("No customer with the given ID")
})

async function exists(path) {
  try {
      await Fs.access(path)
      console.log(path)
      return true
  } catch {
      return false
  }
}

async function checkFilePath(file) {
  const path = Path.join(__dirname, file)
  await exists(path)
}

async function uploadFunc(file) {
  let check = checkFilePath(file)
  if(check) {
      let result = await cloudinary.uploader.upload(file)
      return result
  }else {
      result = ""
  }
}

module.exports = router