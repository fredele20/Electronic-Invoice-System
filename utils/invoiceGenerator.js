const PDFGenerator = require("pdfkit")
const fs = require("fs")


class InvoiceGenerator {
  constructor(invoice) {
      this.invoice = invoice
  }

  generateHeaders(doc) {
      // TO DO create a pretty header...
      const productDetails = this.invoice.invoiceDetails.product
      const customerDetail = this.invoice.invoiceDetails.customer
// .image('./bus-brochure4.PNG', 0, 0, { width: 250})
      doc
        .fillColor('#000')
        .fontSize(20)
        .text('TRANSACTION INVOICE', {align: 'center'})
        .moveDown()
        .moveDown()
        .fontSize(15)
        .text("Customer's Details", {align: "right"})
        .fontSize(10)
        .text(`name: ${customerDetail.name}`, { align: "right" })
        .text(`Address: ${customerDetail.address}`, { align: "right" })
        .text(`Invoice Number: ${this.invoice.invoiceNumber}`, {align: 'right'})
        .moveDown()
        .moveDown()
        .fontSize(15)
        .text("Product's Details", { align: "left" })
        .fontSize(10)
        .text(`Name: ${productDetails.name}`, { align: "left" })
        .text(`Description: ${productDetails.description}`, { align: "left" })
        .text(`Seller: ${productDetails.seller}`, { align: "left" })
        .text(`Quantity: ${productDetails.quantity}`, { align: "left" })
        .text(`Price: $${productDetails.price}`, { align: "left" }) 
        .text(`Amount: ${productDetails.paymentAmount}`, {align: 'right'})

    const beginningOfPage = 50
    const endOfPage = 550

    doc.moveTo(beginningOfPage,350)
        .lineTo(endOfPage,350)
        .stroke()
            
    doc
    .text(`Total Amount: $${this.invoice.invoiceDetails.product.paymentAmount || 'N/A'}`, 50, 370)
    .text(`Transaction Date: ${this.invoice.dueDate}`, { align: "center" })

    doc.moveTo(beginningOfPage,400)
        .lineTo(endOfPage,400)
        .stroke()
  }

  generateTable(doc) {
      // TODO: loop through and create a new row for each item
  }

  generateFooter(doc) {
      // TODO
  }

  generate() {
    let theOutput = new PDFGenerator 

    console.log(this.invoice)

    // const fileName = `Invoice ${this.invoice.invoiceNumber}.pdf`

    // pipe to a writable stream which would save the result into the same directory
    theOutput.pipe(fs.createWriteStream('invoice.pdf'))

    this.generateHeaders(theOutput)

    theOutput.moveDown()

    this.generateTable(theOutput)

    this.generateFooter(theOutput)
    

    // write out file
    theOutput.end()
  }
}


module.exports = InvoiceGenerator