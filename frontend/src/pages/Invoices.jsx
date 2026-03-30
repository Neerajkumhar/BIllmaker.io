import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Eye, Pencil } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const deleteInvoice = async (id) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        await api.delete(`/invoices/${id}`);
        fetchInvoices();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/invoices/${id}/status`, { status });
      fetchInvoices();
    } catch (err) {
      console.error(err);
    }
  };

  const viewPdf = (id) => {
    navigate(`/invoices/${id}`);
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
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Invoices</h1>
          <p className="text-xs md:text-sm text-gray-500">Manage your billing and invoices</p>
        </div>
        <Link
          to="/invoices/new"
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus size={18} className="mr-2" />
          Create Invoice
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[10px] md:text-xs uppercase tracking-wider font-bold">
                <th className="py-4 px-4 md:px-6">Invoice</th>
                <th className="py-4 px-4 md:px-6">Client</th>
                <th className="py-4 px-4 md:px-6">Issue Date</th>
                <th className="py-4 px-4 md:px-6">Total</th>
                <th className="py-4 px-4 md:px-6">Balance</th>
                <th className="py-4 px-4 md:px-6">Status</th>
                <th className="py-4 px-4 md:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 md:px-6 font-bold text-indigo-700 text-xs md:text-sm">{inv.invoiceId}</td>
                  <td className="py-4 px-4 md:px-6 text-gray-900 font-medium text-xs md:text-sm">{inv.client?.name || 'Unknown'}</td>
                  <td className="py-4 px-4 md:px-6 text-gray-500 text-xs md:text-sm">{new Date(inv.issueDate).toLocaleDateString()}</td>
                  <td className="py-4 px-4 md:px-6 font-bold text-gray-900 text-xs md:text-sm">{formatCurrency(inv.totalAmount)}</td>
                  <td className="py-4 px-4 md:px-6 text-red-600 font-bold text-xs md:text-sm">{formatCurrency(inv.totalAmount - (inv.paidAmount || 0))}</td>
                  <td className="py-4 px-4 md:px-6">
                    <div className="relative inline-block w-full min-w-[100px]">
                      <select
                        className={`w-full text-[10px] md:text-xs font-bold uppercase tracking-tighter rounded-full px-3 py-1 outline-none appearance-none border transition-all cursor-pointer ${
                          inv.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' :
                          inv.status === 'Overdue' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}
                        value={inv.status}
                        onChange={(e) => updateStatus(inv._id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </div>
                  </td>
                  <td className="py-4 px-4 md:px-6 text-right space-x-1 md:space-x-4">
                    <button onClick={() => viewPdf(inv._id)} className="p-1 px-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all" title="View Detail">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => navigate(`/invoices/${inv._id}/edit`)} className="p-1 px-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-all" title="Edit Invoice">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => deleteInvoice(inv._id)} className="p-1 px-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-gray-400 italic text-sm">No invoices found. Create your first one!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
