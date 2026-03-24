import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const Services = () => {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', basePrice: '' });

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await api.put(`/services/${formData._id}`, formData);
      } else {
        await api.post('/services', formData);
      }
      setShowModal(false);
      setFormData({ name: '', description: '', basePrice: '' });
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteService = async (id) => {
    if (confirm('Are you sure?')) {
      try {
        await api.delete(`/services/${id}`);
        fetchServices();
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
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Services</h1>
          <p className="text-xs md:text-sm text-gray-500">Manage your predefined service offerings</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setFormData({ name: '', description: '', basePrice: '' }); }}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus size={18} className="mr-2" />
          Add Service
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {services.map((service) => (
          <div key={service._id} className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-md md:text-lg font-bold text-indigo-700 group-hover:text-indigo-800 transition-colors uppercase tracking-tight">{service.name}</h3>
              <div className="flex space-x-1 md:space-x-2">
                <button onClick={() => { setFormData(service); setShowModal(true); }} className="p-1 px-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => deleteService(service._id)} className="p-1 px-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="text-gray-500 text-xs md:text-sm mb-6 min-h-[40px] leading-relaxed">{service.description || 'No description provided.'}</p>
            <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
              <div>
                <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Base Price</span>
                <span className="text-xl md:text-2xl font-bold text-gray-900">{formatCurrency(service.basePrice)}</span>
              </div>
            </div>
          </div>
        ))}
        {services.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-400 font-medium bg-white rounded-xl border border-gray-100 border-dashed">
            No services found. Add your first service to get started!
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 no-print">
          <div className="bg-white p-5 md:p-8 rounded-2xl shadow-2xl w-full max-w-md fade-in relative overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">{formData._id ? 'Edit Service' : 'Add Service'}</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Service Name *</label>
                <input required type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium" placeholder="e.g. Graphic Design" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Base Price (₹) *</label>
                <input required type="number" min="0" step="0.01" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium" value={formData.basePrice} onChange={(e) => setFormData({...formData, basePrice: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Description</label>
                <textarea rows="4" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium resize-none" placeholder="What does this service include?" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-bold text-sm transition-colors text-center">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-sm transition-all shadow-md shadow-indigo-100 text-center">Save Service</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
