import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Printer, ArrowLeft, Mail } from 'lucide-react';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/invoices/${id}`);
        setInvoice(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading invoice details...</div>;
  if (!invoice) return <div className="p-8 text-center text-red-500 font-bold">Invoice not found!</div>;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 pb-12 px-2 md:px-0">
      {/* Action Bar - Hidden on Print */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-gray-100 no-print">
        <button 
          onClick={() => navigate('/invoices')}
          className="flex items-center text-sm font-bold text-gray-500 hover:text-indigo-600 transition group"
        >
          <div className="p-1.5 bg-gray-50 rounded-lg mr-2 group-hover:bg-indigo-50 transition-colors">
            <ArrowLeft size={16} />
          </div>
          Back to List
        </button>
        <div className="flex space-x-2">
          <button 
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-100 text-sm font-bold transition-all"
          >
            <Printer size={16} className="mr-2" /> Print PDF
          </button>
        </div>
      </div>

      {/* Invoice Paper Simulation */}
      <div className="bg-white shadow-xl md:shadow-2xl rounded-2xl md:rounded-sm overflow-hidden print:shadow-none print:rounded-none mx-auto w-full min-h-0 md:min-h-[1100px] flex flex-col relative border border-gray-100">
        
        {/* Paper Content */}
        <div className="p-6 md:p-12 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 md:gap-0 mb-8 md:mb-16">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center mb-2">
                <img src="/logo-v.png" alt="Company Logo" className="h-[50px] md:h-[75px] object-contain" />
              </div>
              <p className="text-xs font-black text-gray-900 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-md border border-gray-200">MSME No: UDYAM-RJ-22-0203538</p>
            </div>
            <div className="text-center md:text-right">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 opacity-10 md:opacity-20 mb-2 tracking-tighter">INVOICE</h2>
              <div className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                invoice.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                invoice.status === 'Overdue' ? 'bg-red-100 text-red-700' : 
                'bg-amber-100 text-amber-700'
              }`}>
                {invoice.status}
              </div>
            </div>
          </div>

          {/* Meta Info Grid */}
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-8 md:mb-16">
            <div className="space-y-1.5 text-center md:text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Billed To</p>
              <h3 className="text-lg md:text-xl font-black text-gray-900 leading-tight">{invoice.client?.companyName || invoice.client?.name}</h3>
              <p className="text-xs md:text-sm text-gray-500 max-w-[300px] mx-auto md:mx-0 font-medium">{invoice.client?.address}</p>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <div className="grid grid-cols-2 gap-x-4 md:gap-x-8 gap-y-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice Ref</span>
                <span className="text-sm font-bold text-gray-900">#{invoice.invoiceId}</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Issue Date</span>
                <span className="text-sm font-bold text-gray-900">{formatDate(invoice.issueDate)}</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Due Date</span>
                <span className="text-sm font-bold text-gray-900 text-red-600">{formatDate(invoice.dueDate)}</span>
              </div>
            </div>
          </div>

          {/* Separator - Design Element */}
          <div className="h-px w-full bg-gray-100 mb-8 overflow-hidden">
             <div className="h-full w-1/4 bg-indigo-500"></div>
          </div>

          {/* Items Table - Scrollable on mobile */}
          <div className="flex-1 overflow-x-auto -mx-6 md:mx-0 px-6 md:px-0 scrollbar-hide">
            <table className="w-full text-left min-w-[600px] md:min-w-0">
              <thead>
                <tr className="border-b-2 border-gray-900">
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Service Description</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Qty</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Unit Price</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoice.services.map((item, index) => (
                  <tr key={index}>
                    <td className="py-5">
                      <p className="text-sm font-black text-gray-900">{item.customName || item.service?.name}</p>
                    </td>
                    <td className="py-5 text-center text-sm font-bold text-gray-600">{item.quantity}</td>
                    <td className="py-5 text-right text-sm font-bold text-gray-600">{formatCurrency(item.price)}</td>
                    <td className="py-5 text-right text-sm font-black text-indigo-600">{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-12 flex flex-col md:flex-row justify-between items-center md:items-start gap-12 md:gap-0">
            {/* Left: Payment Method/Status */}
            <div className="w-full md:w-auto space-y-6 text-center md:text-left">
              <div>
                <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4">Payment Summary</h4>
                {invoice.payments && invoice.payments.length > 0 ? (
                  <div className="space-y-4">
                    {invoice.payments.map((p, idx) => (
                      <div key={idx} className="p-4 bg-green-50/50 rounded-2xl border border-green-100/50 inline-block md:block mb-2 text-left">
                        <p className="text-[10px] text-green-700 font-black uppercase tracking-widest mb-1.5 flex items-center">
                           <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                           Paid via {p.method}
                        </p>
                        <div className="flex justify-between gap-8">
                           <span className="text-xs font-bold text-gray-600">Amount: {formatCurrency(p.amount)}</span>
                           <span className="text-xs font-bold text-gray-400">{formatDate(p.date)}</span>
                        </div>
                      </div>
                    ))}
                    {invoice.totalAmount > invoice.paidAmount && (
                      <div className="mt-4 p-4 bg-red-50 rounded-2xl border border-red-100 text-left">
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Balance Remaining</p>
                        <p className="text-xl font-black text-red-600">{formatCurrency(invoice.totalAmount - invoice.paidAmount)}</p>
                        <p className="text-[9px] text-red-400 mt-1 font-bold italic uppercase tracking-tighter leading-none">Kindly clear the pending dues</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="inline-block p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 text-left">
                    <p className="text-[10px] text-indigo-700 font-black uppercase tracking-widest mb-2">Banking Details</p>
                    <div className="space-y-1 text-xs font-bold text-gray-600">
                        <p>A/C Name: Visuark Digital</p>
                        <p>A/C No.: 0123 4567 8901</p>
                        <p>Bank: Rimberio Global</p>
                        <p className="text-xs text-indigo-700 font-black uppercase tracking-widest pt-2 border-t border-indigo-100 mt-2">MSME: UDYAM-RJ-22-0203538</p>
                        <p className="pt-2 text-[10px] text-indigo-500 uppercase">Payable by: {formatDate(invoice.dueDate)}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="pt-4">
                <p className="text-sm text-gray-400 italic max-w-xs mx-auto md:mx-0">Thank you for choosing Visuark Digital Services!</p>
              </div>
            </div>

            {/* Right: Summary & Signature */}
            <div className="w-full md:w-80 space-y-8">
              <div className="space-y-4 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Net Subtotal</span>
                  <span className="text-gray-900 font-black">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Taxes ({invoice.gstPercentage}%)</span>
                  <span className="text-gray-900 font-black">{formatCurrency(invoice.gstAmount)}</span>
                </div>
                <div className="h-px w-full bg-gray-200"></div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-black text-gray-900 uppercase tracking-tighter">Grand Total</span>
                  <span className="text-3xl font-black text-indigo-600 leading-none">{formatCurrency(invoice.totalAmount)}</span>
                </div>
              </div>

              <div className="pt-8 text-center border-t border-gray-200">
                <div className="h-[60px] flex items-center justify-center mb-1">
                  <img src="/sign.png" alt="Signature" className="max-h-full max-w-[180px] object-contain mix-blend-multiply" />
                </div>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Authorized Signatory</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Decorative Footer */}
        <div className="h-14 w-full flex overflow-hidden mt-auto rounded-b-2xl md:rounded-b-none print:h-12">
            <div className="w-1/2 bg-[#3b82f6] flex items-center px-4 md:px-12 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                <Mail size={12} className="mr-2" /> contact@visuark.com
            </div>
            <div className="w-1/2 bg-[#10b981] flex items-center justify-end px-4 md:px-12 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest text-right">
                VISUARK | Digital Marketing Agency
            </div>
        </div>
      </div>
      
      {/* Page-Specific Print Styles */}
      <style>{`
        @media print {
          @page { 
            margin: 0; 
            size: A4;
          }
          html, body { 
            height: 100vh !important;
            overflow: hidden !important;
            background: white !important; 
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          
          /* Force container to exactly one page height */
          .bg-white.shadow-xl {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            height: 100vh !important;
            overflow: hidden !important;
            position: relative !important;
            padding: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            margin: 0 !important;
          }

          /* Force Desktop Layout in Print */
          .flex-col.md\\:flex-row { flex-direction: row !important; }
          .md\\:flex-row { flex-direction: row !important; }
          .md\\:items-start { align-items: flex-start !important; }
          .md\\:text-left { text-align: left !important; }
          .md\\:text-right { text-align: right !important; }
          .md\\:mb-16 { margin-bottom: 4rem !important; }
          .md\\:mb-8 { margin-bottom: 2rem !important; }
          .md\\:p-12 { padding: 3rem !important; }
          .md\\:w-80 { width: 20rem !important; }
          .md\\:block { display: block !important; }
          .md\\:mx-0 { margin-left: 0 !important; margin-right: 0 !important; }
          
          /* Ensure table text colors are preserved in print */
          * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default InvoiceDetail;
