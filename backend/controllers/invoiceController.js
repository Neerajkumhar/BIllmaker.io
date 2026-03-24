const Invoice = require('../models/Invoice');
require('../models/Client');
require('../models/Service');
const generatePdf = require('../utils/generatePdf');

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({}).populate('client');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client')
      .populate('services.service')
      .lean();
    if (invoice) {
      const Payment = require('../models/Payment');
      const payments = await Payment.find({ invoice: invoice._id });
      invoice.payments = payments;
      res.json(invoice);
    } else {
      res.status(404).json({ message: 'Invoice not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create an invoice
// @route   POST /api/invoices
// @access  Private
const createInvoice = async (req, res) => {
  try {
    const { client, services, gstIncluded, issueDate, dueDate } = req.body;
    let subtotal = 0;
    
    // Calculate totals
    services.forEach(item => {
      subtotal += item.price * (item.quantity || 1);
    });

    let gstAmount = 0;
    let gstPercentage = gstIncluded ? 18 : 0;
    
    if (gstIncluded) {
      gstAmount = (subtotal * gstPercentage) / 100;
    }
    
    const totalAmount = subtotal + gstAmount;

    // Generate unique Invoice ID by finding the latest invoice
    const lastInvoice = await Invoice.findOne({}).sort({ createdAt: -1 });
    let nextNum = 1;
    if (lastInvoice && lastInvoice.invoiceId) {
      const parts = lastInvoice.invoiceId.split('-');
      const lastNum = parseInt(parts[parts.length - 1]);
      if (!isNaN(lastNum)) {
        nextNum = lastNum + 1;
      }
    }
    const invoiceId = `INV-${new Date().getFullYear()}-${nextNum.toString().padStart(4, '0')}`;

    const invoice = new Invoice({
      invoiceId,
      client,
      services,
      subtotal,
      gstIncluded,
      gstPercentage,
      gstAmount,
      totalAmount,
      issueDate,
      dueDate
    });

    let createdInvoice = await invoice.save();

    if (req.body.paymentMethod && req.body.paymentMethod !== 'None') {
      const Payment = require('../models/Payment');
      const payment = new Payment({
        invoice: createdInvoice._id,
        amount: totalAmount,
        method: req.body.paymentMethod,
        date: issueDate
      });
      await payment.save();

      createdInvoice.paidAmount = totalAmount;
      createdInvoice.status = 'Paid';
      createdInvoice = await createdInvoice.save();
    }

    res.status(201).json(createdInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update invoice status
// @route   PUT /api/invoices/:id/status
// @access  Private
const updateInvoiceStatus = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (invoice) {
      const oldStatus = invoice.status;
      const newStatus = req.body.status;
      
      invoice.status = newStatus;

      // If marked as Paid and wasn't fully paid before, record a full payment
      if (newStatus === 'Paid' && invoice.paidAmount < invoice.totalAmount) {
        const Payment = require('../models/Payment');
        const remainingAmount = invoice.totalAmount - invoice.paidAmount;
        
        const payment = new Payment({
          invoice: invoice._id,
          amount: remainingAmount,
          method: 'Other', // Assigned as Other since it was a manual status change
          date: new Date()
        });
        await payment.save();
        
        invoice.paidAmount = invoice.totalAmount;
      }

      const updatedInvoice = await invoice.save();
      res.json(updatedInvoice);
    } else {
      res.status(404).json({ message: 'Invoice not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an invoice
// @route   DELETE /api/invoices/:id
// @access  Private
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (invoice) {
      await invoice.deleteOne();
      res.json({ message: 'Invoice removed' });
    } else {
      res.status(404).json({ message: 'Invoice not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Download PDF
// @route   GET /api/invoices/:id/pdf
// @access  Private
const downloadInvoicePdf = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client')
      .populate('services.service')
      .lean();
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const Payment = require('../models/Payment');
    const payments = await Payment.find({ invoice: invoice._id });
    invoice.payments = payments;

    const pdfBuffer = await generatePdf(invoice);

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment;filename=invoice_${invoice.invoiceId}.pdf`,
      'Content-Length': pdfBuffer.length
    });

    res.end(pdfBuffer);

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getInvoices, getInvoiceById, createInvoice, updateInvoiceStatus, deleteInvoice, downloadInvoicePdf };
