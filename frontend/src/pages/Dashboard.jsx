import { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, IndianRupee, Clock, FileText } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard');
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching stats', error);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="p-4">Loading stats...</div>;

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Dashboard Overview</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={IndianRupee} color="text-green-600" bg="bg-green-100" />
        <StatCard title="Pending Amount" value={formatCurrency(stats.pendingAmount)} icon={Clock} color="text-yellow-600" bg="bg-yellow-100" />
        <StatCard title="Total Clients" value={stats.totalClients} icon={Users} color="text-blue-600" bg="bg-blue-100" />
        <StatCard title="Recent Invoices" value={stats.recentInvoices.length} icon={FileText} color="text-purple-600" bg="bg-purple-100" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-md md:text-lg font-semibold text-gray-800 mb-4">Recent Invoices</h2>
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="inline-block min-w-full align-middle md:px-0">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-gray-400 text-[10px] md:text-xs uppercase tracking-wider font-bold">
                    <th className="py-3 px-4">Invoice</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.recentInvoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-xs md:text-sm text-indigo-600 font-bold">{inv.invoiceId}</td>
                      <td className="py-3 px-4 text-xs md:text-sm font-medium text-gray-700 truncate max-w-[120px] md:max-w-none">{inv.client?.name || 'Unknown'}</td>
                      <td className="py-3 px-4 text-xs md:text-sm font-bold text-gray-900">{formatCurrency(inv.totalAmount)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-tighter ${
                          inv.status === 'Paid' ? 'bg-green-100 text-green-700 border border-green-200' :
                          inv.status === 'Overdue' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {stats.recentInvoices.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-gray-400 italic text-sm">No recent activity</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-md md:text-lg font-semibold text-gray-800 mb-4">Top Clients</h2>
          <div className="space-y-3">
               {stats.topClients.map((item, index) => (
                 <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100">
                   <div className="flex items-center space-x-3">
                     <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-indigo-600 font-bold text-sm md:text-base">
                       {item.client?.name ? item.client.name.charAt(0) : '?'}
                     </div>
                     <div>
                       <p className="text-xs md:text-sm font-bold text-gray-800 group-hover:text-indigo-700">{item.client?.name || 'Unknown'}</p>
                     </div>
                   </div>
                   <div className="text-xs md:text-sm font-bold text-gray-900 bg-white px-2 py-1 rounded border border-gray-100 shadow-sm">
                     {formatCurrency(item.revenue)}
                   </div>
                 </div>
               ))}
               {stats.topClients.length === 0 && (
                 <p className="text-gray-400 text-center py-8 italic text-sm">No client data available</p>
               )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, bg }) => (
  <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3 md:space-x-4">
    <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center flex-shrink-0 ${bg} ${color}`}>
      <Icon className="w-5 h-5 md:w-6 md:h-6" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] md:text-sm text-gray-500 font-bold uppercase tracking-wider truncate">{title}</p>
      <p className="text-lg md:text-2xl font-bold text-gray-900 truncate">{value}</p>
    </div>
  </div>
);

export default Dashboard;
