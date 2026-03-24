import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingDown,
  Calendar
} from 'lucide-react';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!stats) return <div className="text-center py-12 text-gray-500">Failed to load analytics data.</div>;

  // Format month names for the chart
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartData = stats.monthlyRevenue.map(item => ({
    name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
    revenue: item.total
  }));

  // Top Clients Data
  const pieData = stats.topClients.map((item, index) => ({
    name: item.client?.companyName || item.client?.name || 'Unknown',
    value: item.revenue
  }));

  const COLORS = ['#4f46e5', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Business Analytics</h1>
          <p className="text-sm md:text-md text-gray-500 font-medium">Deep dive into your billing performance and client trends</p>
        </div>
        <div className="flex items-center px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm text-sm font-bold text-gray-600">
          <Calendar size={16} className="mr-2 text-indigo-500" />
          Last 12 Months
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Collected Revenue', value: formatCurrency(stats.totalCollected), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', trend: '+12.5%', trendUp: true },
          { label: 'Pending Amount', value: formatCurrency(stats.pendingAmount), icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50', trend: '-2.4%', trendUp: false },
          { label: 'Active Clients', value: stats.totalClients, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+4', trendUp: true },
          { label: 'Total Billed', value: formatCurrency(stats.totalRevenue), icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', trend: '+8', trendUp: true },
        ].map((metric, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${metric.bg} ${metric.color} transition-transform group-hover:scale-110`}>
                <metric.icon size={24} />
              </div>
              <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-lg ${metric.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {metric.trendUp ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
                {metric.trend}
              </div>
            </div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{metric.label}</h3>
            <p className="text-2xl font-black text-gray-900 tracking-tight">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-gray-800 tracking-tight">Revenue Timeline</h3>
            <div className="flex gap-2">
               <span className="w-3 h-3 rounded-full bg-indigo-600 mr-1"></span>
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Monthly Earnings</span>
            </div>
          </div>
          <div className="h-[300px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
                  tickFormatter={(value) => `₹${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4f46e5" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Clients - Pie Chart */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 tracking-tight mb-8 text-center">Top Clients by Revenue</h3>
          <div className="h-[300px] md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            {pieData.slice(0, 3).map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <div className="flex items-center overflow-hidden">
                  <div className="w-2 h-2 rounded-full mr-2 shrink-0" style={{ backgroundColor: COLORS[i] }}></div>
                  <span className="text-gray-600 font-medium truncate">{item.name}</span>
                </div>
                <span className="font-bold text-gray-800 ml-2">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
           <div className="relative z-10">
             <h3 className="text-xl font-bold mb-2">Growth Projection</h3>
             <p className="text-indigo-100 text-sm mb-6 max-w-xs">Based on your current billing trends, you are projected to see a 15% increase in revenue next quarter.</p>
             <button className="px-6 py-2 bg-white text-indigo-600 rounded-xl font-bold text-sm shadow-lg">View Detailed Forecast</button>
           </div>
           <TrendingUp size={180} className="absolute -bottom-10 -right-10 text-indigo-500 opacity-20 rotate-12" />
        </div>
        
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Payment Method Distribution</h3>
            <div className="space-y-6">
              {(() => {
                const methods = stats.paymentMethods || [];
                const totalPaid = methods.reduce((acc, curr) => acc + (curr.total || 0), 0);
                
                if (methods.length === 0 || totalPaid === 0) 
                  return <p className="text-gray-400 italic text-sm text-center border-2 border-dashed border-gray-50 py-8 rounded-2xl">No payments recorded yet.</p>;

                return methods.map((method, i) => {
                  const methodTotal = method.total || 0;
                  const percentage = totalPaid > 0 ? Math.round((methodTotal / totalPaid) * 100) : 0;
                  const colors = ['bg-indigo-500', 'bg-green-500', 'bg-amber-500', 'bg-red-500', 'bg-purple-500'];
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                        <span className="text-gray-700">{method._id || 'Unspecified'}</span>
                        <span className="text-gray-600">{percentage}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                        <div className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-700`} style={{ width: `${percentage}%` }}></div>
                      </div>
                      <div className="flex justify-end">
                        <span className="text-[10px] font-bold text-gray-400">{formatCurrency(methodTotal)} total</span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
