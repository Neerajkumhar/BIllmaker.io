import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';

const InvoiceCreate = () => {
  const [clients, setClients] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    client: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    services: [],
    gstIncluded: false,
    paymentMethod: 'None'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, servicesRes] = await Promise.all([
          api.get('/clients'),
          api.get('/services')
        ]);
        setClients(clientsRes.data);
        setAvailableServices(servicesRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleAddService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { service: '', customName: '', price: 0, quantity: 1 }]
    });
  };

  const handleServiceChange = (index, field, value) => {
    const newServices = [...formData.services];
    newServices[index][field] = value;

    if (field === 'service') {
      const selected = availableServices.find(s => s._id === value);
      if (selected) {
        newServices[index].price = selected.basePrice;
        newServices[index].customName = selected.name;
      }
    }

    setFormData({ ...formData, services: newServices });
  };

  const removeService = (index) => {
    const newServices = formData.services.filter((_, i) => i !== index);
    setFormData({ ...formData, services: newServices });
  };

  const subtotal = formData.services.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const gstAmount = formData.gstIncluded ? subtotal * 0.18 : 0;
  const totalAmount = subtotal + gstAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.services.length === 0) return alert('Please add at least one service');
    if (!formData.client) return alert('Please select a client');

    // Clean up empty service IDs to avoid validation errors
    const cleanedServices = formData.services.map(s => {
      const item = { ...s };
      if (!item.service) delete item.service;
      return item;
    });

    try {
      await api.post('/invoices', { ...formData, services: cleanedServices });
      navigate('/invoices');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error creating invoice. Please check all fields.');
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
    <div className="max-w-5xl mx-auto bg-white p-4 md:p-8 rounded-xl shadow-sm border border-gray-100">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Create New Invoice</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Client *</label>
            <select
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            >
              <option value="">Select Client</option>
              {clients.map(c => (
                <option key={c._id} value={c._id}>{c.companyName || c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Issue Date *</label>
            <input
              type="date"
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
              value={formData.issueDate}
              onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Due Date *</label>
            <input
              type="date"
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Status</label>
            <select
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            >
              <option value="None">Pending (Unpaid)</option>
              <option value="Cash">Paid via Cash</option>
              <option value="Bank Transfer">Paid via Bank Transfer</option>
              <option value="UPI">Paid via UPI</option>
              <option value="Credit Card">Paid via Credit Card</option>
              <option value="Other">Paid via Other</option>
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-md md:text-lg font-bold text-gray-800 uppercase tracking-tight">Invoice Items</h3>
            <button
              type="button"
              onClick={handleAddService}
              className="flex items-center text-xs px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-bold transition-all"
            >
              <Plus size={16} className="mr-1.5" /> Add Item
            </button>
          </div>

          <div className="space-y-4">
            {formData.services.map((item, index) => (
              <div key={index} className="relative group bg-gray-50 p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-indigo-100 hover:bg-white">
                <button
                  type="button"
                  onClick={() => removeService(index)}
                  className="absolute top-2 right-2 md:top-4 md:right-4 text-gray-300 hover:text-red-500 p-1 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-end">
                  <div className="md:col-span-4">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Select Service</label>
                    <select
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                      value={item.service}
                      onChange={(e) => handleServiceChange(index, 'service', e.target.value)}
                    >
                      <option value="">Predefined Service</option>
                      {availableServices.map(s => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Item Description</label>
                    <input
                      type="text"
                      placeholder="Service name on invoice"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                      value={item.customName}
                      onChange={(e) => handleServiceChange(index, 'customName', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 md:col-span-4 gap-3 md:items-end">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 text-center">Qty</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-center"
                        value={item.quantity}
                        onChange={(e) => handleServiceChange(index, 'quantity', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 text-center">Price</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-center"
                        value={item.price}
                        onChange={(e) => handleServiceChange(index, 'price', Number(e.target.value))}
                      />
                    </div>
                    <div className="flex flex-col items-center">
                       <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Amount</label>
                       <span className="text-xs md:text-sm font-bold text-gray-800 py-2">
                         {formatCurrency(item.quantity * item.price)}
                       </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {formData.services.length === 0 && (
              <div className="text-center py-12 text-gray-400 font-medium bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                Your invoice is empty. Add a service item to begin.
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 pt-8 border-t border-gray-100">
          <div className="w-full lg:w-auto bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="gst"
                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded-md cursor-pointer transition-all"
                checked={formData.gstIncluded}
                onChange={(e) => setFormData({ ...formData, gstIncluded: e.target.checked })}
              />
              <label htmlFor="gst" className="ml-3 block text-sm font-bold text-indigo-800 cursor-pointer uppercase tracking-tight">
                Include 18% GST (Goods and Services Tax)
              </label>
            </div>
            <p className="mt-2 text-xs text-indigo-500/80 ml-8 font-medium italic">GST will be calculated on the total subtotal automatically.</p>
          </div>
          
          <div className="w-full lg:w-72 space-y-4">
            <div className="flex justify-between items-center py-1 text-gray-500">
              <span className="text-xs font-bold uppercase tracking-widest">Subtotal</span>
              <span className="text-sm font-bold text-gray-800">{formatCurrency(subtotal)}</span>
            </div>
            {formData.gstIncluded && (
              <div className="flex justify-between items-center py-1 text-gray-500">
                <span className="text-xs font-bold uppercase tracking-widest">GST (18%)</span>
                <span className="text-sm font-bold text-gray-800">{formatCurrency(gstAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center border-t-2 border-gray-900 pt-5">
              <span className="text-md font-black uppercase tracking-tight text-gray-900">Total Due</span>
              <span className="text-2xl font-black text-indigo-600">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-8 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="px-8 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-bold text-sm transition-colors text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-sm transition-all shadow-md shadow-indigo-100 text-center"
          >
            Create & Finalize Invoice
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceCreate;
