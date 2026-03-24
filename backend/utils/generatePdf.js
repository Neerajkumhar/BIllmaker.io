const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generatePdf(invoice) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();

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

  const servicesHtml = invoice.services.map(item => `
    <tr>
      <td class="py-4">
        <p class="text-sm font-bold text-gray-900">${item.customName || (item.service ? item.service.name : 'Service')}</p>
      </td>
      <td class="py-4 text-center text-sm font-medium text-gray-700">${item.quantity || 1}</td>
      <td class="py-4 text-right text-sm font-medium text-gray-700">${formatCurrency(item.price)}</td>
      <td class="py-4 text-right text-sm font-bold text-gray-900">${formatCurrency(item.price * (item.quantity || 1))}</td>
    </tr>
  `).join('');

  const logoPath = path.join(__dirname, '../../frontend/public/logo-v.png');
  let logoHtml = '';
  if (fs.existsSync(logoPath)) {
    const logoData = fs.readFileSync(logoPath);
    const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
    logoHtml = `<img src="${logoBase64}" alt="Company Logo" class="h-[75px] object-contain" />`;
  } else {
    logoHtml = `<h1 class="text-3xl font-bold text-gray-900 tracking-tight">VISUARK</h1>`;
  }

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; background: white; }
  </style>
</head>
<body class="bg-white">
  <div class="h-[1100px] w-full mx-auto flex flex-col relative bg-white overflow-hidden">
    <div class="p-12 flex-1 flex flex-col">
      <div class="flex justify-between items-start mb-16">
        <div class="flex flex-col">
          <div class="flex items-center mb-2">
            ${logoHtml}
          </div>
        </div>
        <div class="text-right">
          <h2 class="text-5xl font-light text-gray-400 opacity-60 mb-2">INVOICE</h2>
          <div class="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            invoice.status === 'Paid' ? 'bg-green-100 text-green-700' : 
            invoice.status === 'Overdue' ? 'bg-red-100 text-red-700' : 
            'bg-yellow-100 text-yellow-700'
          }">
            ${invoice.status}
          </div>
        </div>
      </div>

      <div class="flex justify-between mb-16">
        <div class="space-y-1">
          <p class="text-xs font-bold text-gray-400">Invoice to:</p>
          <h3 class="text-lg font-bold text-gray-900 leading-tight">${invoice.client?.companyName || invoice.client?.name}</h3>
          <p class="text-xs text-gray-500 max-w-[250px]">${invoice.client?.address || ''}</p>
        </div>
        <div class="text-right flex flex-col justify-end">
          <div class="grid grid-cols-2 gap-x-8 gap-y-2 text-left">
            <span class="text-xs font-bold text-gray-400 text-right">Invoice#</span>
            <span class="text-sm font-bold text-gray-900">${invoice.invoiceId}</span>
            <span class="text-xs font-bold text-gray-400 text-right">Date</span>
            <span class="text-sm font-bold text-gray-900">${formatDate(invoice.issueDate)}</span>
          </div>
        </div>
      </div>

      <hr class="border-gray-100 mb-8" />

      <div class="flex-1">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b-2 border-gray-900">
              <th class="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Item</th>
              <th class="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Quantity</th>
              <th class="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Unit Price</th>
              <th class="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            ${servicesHtml}
          </tbody>
        </table>
      </div>

      <div class="mt-12 flex justify-between items-start">
        <div class="space-y-4">
          <div>
            <h4 class="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Payment Details</h4>
            ${invoice.payments && invoice.payments.length > 0 ? `
              <div class="space-y-3">
                ${invoice.payments.map(p => `
                  <div class="text-[11px] text-gray-500 font-medium">
                    <p class="text-green-600 font-bold uppercase tracking-wider mb-1">Payment Received via ${p.method}</p>
                    <p>Amount: ${formatCurrency(p.amount)}</p>
                    <p>Date: ${formatDate(p.date)}</p>
                    ${p.referenceId ? `<p>Ref: ${p.referenceId}</p>` : ''}
                  </div>
                `).join('')}
                ${invoice.totalAmount > invoice.paidAmount ? `
                  <div class="pt-2 border-t border-gray-100">
                    <p class="text-xs font-bold text-red-600 uppercase tracking-wider">Balance Due: ${formatCurrency(invoice.totalAmount - invoice.paidAmount)}</p>
                  </div>
                ` : ''}
              </div>
            ` : `
              <div class="space-y-3 text-[11px] text-gray-500 leading-relaxed font-medium">
                <p class="text-indigo-600 font-bold uppercase tracking-wider mb-1">Rimberio Bank</p>
                <p>Account Name: Visuark Digital</p>
                <p>Account No.: 0123 4567 8901</p>
                <p>Pay by: ${formatDate(invoice.dueDate)}</p>
              </div>
            `}
          </div>
          
          <div class="pt-8">
            <p class="text-sm text-gray-500 italic max-w-xs">Thank you for being a part of VISUARK!</p>
          </div>
        </div>

        <div class="w-64 space-y-8">
          <div class="space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
              <span class="text-gray-900 font-bold">${formatCurrency(invoice.subtotal)}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Tax (${invoice.gstPercentage || 0}%)</span>
              <span class="text-gray-900 font-bold">${formatCurrency(invoice.gstAmount || 0)}</span>
            </div>
            <div class="border-t-2 border-gray-900 pt-3 flex justify-between items-center">
              <span class="text-xl font-bold text-gray-900 uppercase">Total</span>
              <span class="text-2xl font-bold text-gray-900">${formatCurrency(invoice.totalAmount)}</span>
            </div>
          </div>

          <div class="pt-8 text-center border-t border-gray-200">
            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Authorized Signed</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="absolute bottom-0 left-0 right-0 h-10 w-full flex overflow-hidden">
        <div class="w-1/2 bg-[#3b82f6] flex items-center px-12 text-white text-[10px] font-bold">
            +91 8859949455
        </div>
        <div class="w-1/2 bg-[#10b981] flex items-center justify-end px-12 text-white text-[10px] font-bold uppercase tracking-widest">
            I Start Incubation Center, Jodhpur
        </div>
    </div>
  </div>
</body>
</html>
  `;

  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();
  return pdfBuffer;
}

module.exports = generatePdf;



