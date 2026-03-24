const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({}).populate('invoice');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Record a payment
// @route   POST /api/payments
// @access  Private
const createPayment = async (req, res) => {
  try {
    const { invoice: invoiceId, amount, method, referenceId } = req.body;
    
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
    }

    const payment = new Payment({
      invoice: invoiceId,
      amount,
      method,
      referenceId
    });

    const createdPayment = await payment.save();

    // Update invoice paidAmount and status
    invoice.paidAmount += amount;
    if (invoice.paidAmount >= invoice.totalAmount) {
      invoice.status = 'Paid';
    } else {
      invoice.status = 'Pending';
    }
    
    await invoice.save();

    res.status(201).json(createdPayment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a payment
// @route   DELETE /api/payments/:id
// @access  Private
const deletePayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (payment) {
            const invoice = await Invoice.findById(payment.invoice);
            
            if (invoice) {
                invoice.paidAmount -= payment.amount;
                if (invoice.paidAmount < invoice.totalAmount) {
                    invoice.status = 'Pending';
                }
                await invoice.save();
            }

            await payment.deleteOne();
            res.json({ message: 'Payment removed' });
        } else {
            res.status(404).json({ message: 'Payment not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getPayments, createPayment, deletePayment };
