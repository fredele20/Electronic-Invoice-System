const express = require("express")
const { Product } = require("../models/product")
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

  const orderResponse = {
    product: {
      name: product.name,
      desc: product.desc,
      qty: req.body.qty
    },
    // customer
  }

  product = await Product.findByIdAndUpdate(
    req.body.productId, 
    { qty: product.qty - req.body.qty },
    {new: true}
  )

  // generateInvoice()
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