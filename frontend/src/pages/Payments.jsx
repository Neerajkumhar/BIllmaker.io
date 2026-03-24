import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, X } from 'lucide-react';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ invoice: '', amount: '', method: 'Bank Transfer', referenceId: '' });

  const fetchData = async () => {
    try {
      const [paymentsRes, invoicesRes] = await Promise.all([
        api.get('/payments'),
        api.get('/invoices')
      ]);
      setPayments(paymentsRes.data);
      // Only show pending or overdue invoices
      setInvoices(invoicesRes.data.filter(inv => inv.status !== 'Paid'));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payments', formData);
      setShowModal(false);
      setFormData({ invoice: '', amount: '', method: 'Bank Transfer', referenceId: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error recording payment');
    }
  };

  const deletePayment = async (id) => {
    if (confirm('Are you sure? Removing this payment will update the invoice balance.')) {
      try {
        await api.delete(`/payments/${id}`);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Payments</h1>
          <p className="text-xs md:text-sm text-gray-500">Record and track client payments</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setFormData({ invoice: '', amount: '', method: 'Bank Transfer', referenceId: '' }); }}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus size={18} className="mr-2" />
          Record Payment
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[10px] md:text-xs uppercase tracking-wider font-bold">
                <th className="py-4 px-4 md:px-6">Date</th>
                <th className="py-4 px-4 md:px-6">Invoice</th>
                <th className="py-4 px-4 md:px-6">Method</th>
                <th className="py-4 px-4 md:px-6">Reference</th>
                <th className="py-4 px-4 md:px-6 text-right">Amount</th>
                <th className="py-4 px-4 md:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 md:px-6 text-xs md:text-sm text-gray-500">{new Date(payment.date).toLocaleDateString()}</td>
                  <td className="py-4 px-4 md:px-6 font-bold text-indigo-600 text-xs md:text-sm">{payment.invoice?.invoiceId || 'Deleted Invoice'}</td>
                  <td className="py-4 px-4 md:px-6 text-xs md:text-sm text-gray-600 font-medium">{payment.method}</td>
                  <td className="py-4 px-4 md:px-6 text-xs md:text-sm text-gray-400 font-medium italic">{payment.referenceId || '-'}</td>
                  <td className="py-4 px-4 md:px-6 text-right font-bold text-green-600 text-xs md:text-sm">+{formatCurrency(payment.amount)}</td>
                  <td className="py-4 px-4 md:px-6 text-right">
                    <button onClick={() => deletePayment(payment._id)} className="p-1 px-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-gray-400 italic text-sm">No payment history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 no-print">
          <div className="bg-white p-5 md:p-8 rounded-2xl shadow-2xl w-full max-w-md fade-in relative overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Record Payment</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Select Invoice *</label>
                <select
                  required
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                  value={formData.invoice}
                  onChange={(e) => {
                     const inv = invoices.find(i => i._id === e.target.value);
                     const remaining = inv ? inv.totalAmount - inv.paidAmount : '';
                     setFormData({...formData, invoice: e.target.value, amount: remaining });
                  }}
                >
                  <option value="">Choose Invoice</option>
                  {invoices.map(inv => (
                    <option key={inv._id} value={inv._id}>
                      {inv.invoiceId} (Bal: {formatCurrency(inv.totalAmount - inv.paidAmount)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Amount (₹) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-bold"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Method</label>
                  <select
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                    value={formData.method}
                    onChange={(e) => setFormData({...formData, method: e.target.value})}
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Reference ID</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                  value={formData.referenceId}
                  onChange={(e) => setFormData({...formData, referenceId: e.target.value})}
                  placeholder="e.g. Transaction ID / UTR"
                />
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-bold text-sm transition-colors text-center">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-sm transition-all shadow-md shadow-indigo-100 text-center">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
