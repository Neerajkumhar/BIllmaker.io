import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', companyName: '', email: '', phone: '', address: '', gstNumber: '' });

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await api.put(`/clients/${formData._id}`, formData);
      } else {
        await api.post('/clients', formData);
      }
      setShowModal(false);
      setFormData({ name: '', companyName: '', email: '', phone: '', address: '', gstNumber: '' });
      fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteClient = async (id) => {
    if (confirm('Are you sure?')) {
      try {
        await api.delete(`/clients/${id}`);
        fetchClients();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Clients</h1>
          <p className="text-xs md:text-sm text-gray-500">Manage your client list</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setFormData({ name: '', companyName: '', email: '', phone: '', address: '', gstNumber: '' }); }}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus size={18} className="mr-2" />
          Add Client
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[10px] md:text-xs uppercase tracking-wider font-bold">
                <th className="py-4 px-4 md:px-6">Name</th>
                <th className="py-4 px-4 md:px-6">Company</th>
                <th className="py-4 px-4 md:px-6">Email</th>
                <th className="py-4 px-4 md:px-6">Phone</th>
                <th className="py-4 px-4 md:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clients.map((client) => (
                <tr key={client._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 md:px-6 font-bold text-gray-900 text-sm">{client.name}</td>
                  <td className="py-4 px-4 md:px-6 text-xs md:text-sm text-gray-600">{client.companyName || '-'}</td>
                  <td className="py-4 px-4 md:px-6 text-xs md:text-sm text-gray-600">{client.email}</td>
                  <td className="py-4 px-4 md:px-6 text-xs md:text-sm text-gray-600">{client.phone || '-'}</td>
                  <td className="py-4 px-4 md:px-6 text-right space-x-2 md:space-x-4">
                    <button onClick={() => { setFormData(client); setShowModal(true); }} className="text-indigo-600 hover:text-indigo-900 transition-colors p-1">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => deleteClient(client._id)} className="text-red-600 hover:text-red-900 transition-colors p-1">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400 italic text-sm">No clients found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 no-print">
          <div className="bg-white p-5 md:p-8 rounded-2xl shadow-2xl w-full max-w-lg fade-in relative overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">{formData._id ? 'Edit Client' : 'Add Client'}</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name *</label>
                  <input required type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium" placeholder="e.g. John Doe" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address *</label>
                  <input required type="email" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium" placeholder="email@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Company Name</label>
                  <input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium" placeholder="Optional" value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</label>
                  <input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium" placeholder="+91 ..." value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Address</label>
                  <input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium" placeholder="Street, City, Zip" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">GST Number</label>
                  <input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium" placeholder="Optional" value={formData.gstNumber} onChange={(e) => setFormData({...formData, gstNumber: e.target.value})} />
                </div>
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-bold text-sm transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-sm transition-all shadow-md shadow-indigo-100">Save Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
