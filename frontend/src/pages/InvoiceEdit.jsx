import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';

const InvoiceEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    client: '',
    issueDate: '',
    dueDate: '',
    services: [],
    gstIncluded: false,
    status: 'Pending'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, servicesRes, invoiceRes] = await Promise.all([
          api.get('/clients'),
          api.get('/services'),
          api.get(`/invoices/${id}`)
        ]);
        
        setClients(clientsRes.data);
        setAvailableServices(servicesRes.data);
        
        const invoice = invoiceRes.data;
        setFormData({
          client: invoice.client?._id || invoice.client,
          issueDate: invoice.issueDate.split('T')[0],
          dueDate: invoice.dueDate.split('T')[0],
          services: invoice.services.map(s => ({
            service: s.service?._id || s.service,
            customName: s.customName,
            price: s.price,
            quantity: s.quantity
          })),
          gstIncluded: invoice.gstIncluded,
          status: invoice.status
        });
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

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

    const cleanedServices = formData.services.map(s => {
      const item = { ...s };
      if (!item.service) delete item.service;
      return item;
    });

    try {
      await api.put(`/invoices/${id}`, { ...formData, services: cleanedServices });
      navigate(`/invoices/${id}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error updating invoice');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading invoice data...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-sm font-bold text-gray-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft size={16} className="mr-2" /> Back
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Edit Invoice</h1>
        <div className="w-20"></div> {/* Spacer */}
      </div>

      <div className="bg-white p-4 md:p-8 rounded-xl shadow-sm border border-gray-100">
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
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</label>
              <select
                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
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
                <span className="text-md font-black uppercase tracking-tight text-gray-900">Total Amount</span>
                <span className="text-2xl font-black text-indigo-600">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-8 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(`/invoices/${id}`)}
              className="px-8 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-bold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-sm transition-all shadow-md flex items-center"
            >
              <Save size={18} className="mr-2" /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceEdit;
