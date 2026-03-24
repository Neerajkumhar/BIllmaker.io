const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const Payment = require('../models/Payment');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const totalClients = await Client.countDocuments();
    const invoices = await Invoice.find({});
    
    let totalRevenue = 0;
    let pendingAmount = 0;
    
    invoices.forEach(inv => {
      totalRevenue += inv.totalAmount;
      pendingAmount += (inv.totalAmount - inv.paidAmount);
    });

    const totalCollected = invoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);

    // Recent invoices
    const recentInvoices = await Invoice.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('client');

    const topClientsIds = await Invoice.aggregate([
      { $group: { _id: "$client", total: { $sum: "$totalAmount" } } },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);
    
    const topClients = await Client.populate(topClientsIds, { path: "_id" });

    // Monthly data
    const monthlyRevenue = await Invoice.aggregate([
      {
        $group: {
          _id: { month: { $month: "$issueDate" }, year: { $year: "$issueDate" } },
          total: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Payment distribution by method (Using find for better compatibility)
    const allPayments = await Payment.find({});
    
    const distributionMap = allPayments.reduce((acc, p) => {
      const method = p.method || 'Other';
      acc[method] = (acc[method] || 0) + p.amount;
      return acc;
    }, {});

    const paymentMethods = Object.keys(distributionMap).map(method => ({
      _id: method,
      total: distributionMap[method]
    }));

    res.json({
      totalClients,
      totalRevenue,
      totalCollected,
      pendingAmount,
      recentInvoices,
      topClients: topClients.map(c => ({ client: c._id, revenue: c.total })),
      monthlyRevenue,
      paymentMethods
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getDashboardStats };
