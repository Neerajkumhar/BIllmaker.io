import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Printer, ArrowLeft, Mail, Phone, MapPin, Pencil } from 'lucide-react';

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
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, ' / ');
  };

  const formatCurrency = (amount) => {
    return `₹${Math.floor(amount)}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 pb-12 px-2 md:px-0">
      {/* Action Bar - Hidden on Print */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-gray-100 no-print">
        <button 
          onClick={() => navigate('/invoices')}
          className="flex items-center text-sm font-bold text-gray-500 hover:text-teal-600 transition group"
        >
          <div className="p-1.5 bg-gray-50 rounded-lg mr-2 group-hover:bg-teal-50 transition-colors">
            <ArrowLeft size={16} />
          </div>
          Back to List
        </button>
        <div className="flex space-x-2">
          <button 
            onClick={() => navigate(`/invoices/${id}/edit`)}
            className="flex items-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 text-sm font-bold transition-all"
          >
            <Pencil size={16} className="mr-2" /> Edit Invoice
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 shadow-md text-sm font-bold transition-all"
          >
            <Printer size={16} className="mr-2" /> Print PDF
          </button>
        </div>
      </div>

      {/* Invoice Paper */}
      <div className="bg-white shadow-xl md:shadow-2xl rounded-sm overflow-hidden print:shadow-none print:rounded-none mx-auto w-full min-h-[1050px] flex flex-col relative border border-gray-100 font-sans text-black">
        
        {/* Paper Content */}
        <div className="p-8 md:p-16 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div className="flex flex-col">
              <img src="/logo-v.png" alt="VISUARK" className="h-[80px] object-contain mb-1" />
            </div>
            <div>
              <h2 className="text-5xl md:text-6xl font-normal text-black tracking-tight">INVOICE</h2>
            </div>
          </div>

          {/* Meta Info Grid */}
          <div className="flex justify-between mb-20">
            <div className="space-y-1">
              <p className="text-base font-bold mb-3">Invoice to:</p>
              <h3 className="text-xl font-bold leading-tight">{invoice.client?.companyName || invoice.client?.name}</h3>
              <p className="text-base text-gray-600 font-semibold">{invoice.client?.address}</p>
            </div>
            <div className="text-right">
              <div className="space-y-3">
                <p className="text-xl font-bold"><span className="mr-2">Invoice :</span> {invoice.invoiceId}</p>
                <p className="text-xl font-bold"><span className="mr-2">Date :</span> {formatDate(invoice.issueDate)}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="border-t-[2px] border-b-[2px] border-black">
                  <th className="py-4 text-sm font-bold">Item</th>
                  <th className="py-4 text-sm font-bold text-center">Quantity</th>
                  <th className="py-4 text-sm font-bold text-right pr-6">Unit Price</th>
                  <th className="py-4 text-sm font-bold text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.services.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-6 pr-4">
                      <p className="text-sm font-medium">{item.customName || item.service?.name}</p>
                    </td>
                    <td className="py-6 text-center text-sm font-medium">{item.quantity}</td>
                    <td className="py-6 text-right pr-6 text-sm font-medium">{formatCurrency(item.price)}</td>
                    <td className="py-6 text-right text-sm font-bold">{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Section */}
            <div className="flex justify-end mt-4">
              <div className="w-64 space-y-4">
                <div className="flex justify-between pr-4">
                   <span className="text-sm font-bold">Subtotal</span>
                   <span className="text-sm font-bold">{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.gstAmount > 0 && (
                  <div className="flex justify-between pr-4">
                    <span className="text-sm font-bold">Tax ({invoice.gstPercentage}%)</span>
                    <span className="text-sm font-bold">{formatCurrency(invoice.gstAmount)}</span>
                  </div>
                )}
                <div className="pt-4 border-t-[2px] border-black mr-0">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold uppercase">Total</span>
                    <span className="text-3xl font-extrabold">{formatCurrency(invoice.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method & Sign Off */}
          <div className="mt-12 flex justify-between items-end">
            <div className="space-y-8">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-tight mb-2">PAYMENT METHOD</h4>
                <p className="text-sm font-bold">UPI : 8619949455@naviaxis</p>
              </div>
              
              <div className="pt-20">
                <h3 className="text-2xl font-semibold text-gray-800 leading-tight max-w-[320px]">
                  Thank you for be a part of VISUARK!
                </h3>
              </div>
            </div>

            <div className="text-center w-64">
              <div className="h-[80px] flex items-center justify-center mb-0">
                <img src="/sign.png" alt="Signature" className="max-h-full object-contain" />
              </div>
              <div className="border-t border-black mb-1"></div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Authorized Signed</p>
            </div>
          </div>
        </div>

        {/* Bottom Gradient Footer Area */}
        <div className="h-16 w-full flex items-center justify-between px-12 text-white relative mt-auto bg-gradient" style={{
           background: 'linear-gradient(90deg, rgba(20,20,20,1) 0%, rgba(20,20,20,1) 40%, rgba(138,103,17,1) 100%)'
        }}>
            <div className="flex items-center space-x-2 text-[11px] font-medium tracking-wide">
                <Phone size={14} className="text-[#c19a27]" />
                <span>+91 8619949455</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] font-medium tracking-wide">
                <MapPin size={14} className="text-[#c19a27]" />
                <span>I Start Incubation Center, Jodhpur</span>
            </div>
        </div>
      </div>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        @media print {
          @page { 
            margin: 0; 
            size: A4;
          }
          html, body { 
            height: 100% !important;
            background: white !important; 
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          .bg-gradient {
             background: linear-gradient(90deg, #141414 0%, #141414 40%, #8a6711 100%) !important;
             -webkit-print-color-adjust: exact !important;
          }
        }
        
        * {
           font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>
    </div>
  );
};

export default InvoiceDetail;
