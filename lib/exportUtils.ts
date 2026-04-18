export function printReport({ 
  title, 
  subtitle,
  data, 
  columns, 
  summary,
  settings 
}: { 
  title: string; 
  subtitle?: string;
  data: any[]; 
  columns: { key: string; label: string; format?: (val: any) => string }[];
  summary?: { label: string; value: string }[];
  settings: { 
    siteName: string; 
    formatPrice: (n: number) => string;
    billDesign?: {
      reportHeader: string;
      reportFooter: string;
      showSerial: boolean;
      reportAccentColor: string;
    }
  };
}) {
  const printWindow = window.open('', '_blank', 'width=1000,height=900');
  if (!printWindow) return;

  const { billDesign } = settings;
  const showSerial = billDesign?.showSerial ?? true;
  const reportAccent = billDesign?.reportAccentColor ?? '#1e3a8a';
  const reportHeader = billDesign?.reportHeader ?? title;
  const reportFooter = billDesign?.reportFooter ?? 'This document is electronically verified and proprietary to the issuing organization.';

  const formatBrandName = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `<span class="brand-first">${parts[0]}</span> <span class="brand-rest">${parts.slice(1).join(' ')}</span>`;
    }
    return `<span class="brand-first">${name}</span>`;
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title} - ${settings.siteName}</title>
      <meta charset="utf-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
      <style>
        :root {
          --accent: ${reportAccent};
          --accent-soft: ${reportAccent}15;
          --bg-color: #ffffff;
          --text-main: #0a1128;
          --text-muted: #64748b;
          --border: #e2e8f0;
          --table-header: #f1f5f9;
          --table-stripe: #f8fafc;
        }

        @media print {
          @page { margin: 12mm; size: A4 portrait; }
          body { background: #fff !important; }
          .no-print { display: none !important; }
          .document-container { box-shadow: none !important; margin: 0 !important; width: 100% !important; }
        }

        body { 
          font-family: 'Inter', sans-serif; 
          background: #f1f5f9; 
          margin: 0; padding: 40px 0;
          color: var(--text-main);
          -webkit-print-color-adjust: exact;
        }

        .document-container {
          background: #fff;
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          position: relative;
          box-shadow: 0 40px 100px -20px rgba(0,0,0,0.15);
          overflow: hidden;
        }

        /* Security Elements */
        .security-strip {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 6px;
          background: repeating-linear-gradient(45deg, var(--accent), var(--accent) 10px, transparent 10px, transparent 20px);
          opacity: 0.8;
        }

        .hologram-seal {
          position: absolute;
          top: 40px; right: 40px;
          width: 80px; height: 80px;
          border: 1px solid var(--accent);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.1;
          pointer-events: none;
        }

        .hologram-seal::after {
          content: 'VERIFIED';
          font-family: 'Space Grotesk';
          font-weight: 900;
          font-size: 8px;
          color: var(--accent);
          letter-spacing: 0.2em;
        }

        .content { padding: 60px 70px; }

        /* Header Design */
        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid var(--text-main);
          padding-bottom: 30px;
          margin-bottom: 40px;
        }

        .brand-box .brand-first {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: 32px;
          color: var(--accent);
          letter-spacing: -0.04em;
        }

        .brand-box .brand-rest {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 300;
          font-size: 32px;
          color: var(--text-main);
          letter-spacing: -0.04em;
        }

        .meta-box { text-align: right; }
        .meta-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          margin-bottom: 8px;
        }
        .meta-subtitle {
          font-size: 11px;
          font-weight: 600;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        /* Technical Info */
        .tech-info {
          display: flex;
          gap: 40px;
          margin-bottom: 40px;
          font-size: 9px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .tech-info b { color: var(--text-main); }

        /* Summary Stats */
        .summary-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .summary-item {
          padding: 20px;
          background: var(--table-header);
          border-radius: 16px;
          border: 1px solid var(--border);
        }

        .summary-label {
          font-size: 9px;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 6px;
        }

        .summary-val {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: var(--text-main);
        }

        /* Table Design */
        .main-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-bottom: 50px;
        }

        .main-table th {
          background: var(--text-main);
          color: #fff;
          text-align: left;
          padding: 14px 16px;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .main-table th:first-child { border-top-left-radius: 8px; }
        .main-table th:last-child { border-top-right-radius: 8px; }

        .main-table td {
          padding: 12px 16px;
          font-size: 11px;
          font-weight: 500;
          border-bottom: 1px solid var(--border);
        }

        .main-table tr:nth-child(even) td { background: var(--table-stripe); }
        .sl-no { font-weight: 800; color: var(--accent); width: 30px; }

        /* Footer */
        .doc-footer {
          margin-top: 60px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-top: 30px;
          border-top: 1px solid var(--border);
        }

        .verification-box {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .mock-qr {
          width: 50px; height: 50px;
          background: #000;
          padding: 4px; border-radius: 6px;
        }

        .qr-inner {
          width: 100%; height: 100%;
          border: 2px solid #fff;
          background: repeating-linear-gradient(45deg, #000, #000 2px, #fff 2px, #fff 4px);
        }

        .footer-note {
          text-align: right;
          font-size: 9px;
          color: var(--text-muted);
          font-weight: 600;
          line-height: 1.6;
        }

        .footer-note b { color: var(--text-main); display: block; margin-bottom: 4px; font-size: 10px; }

        .print-fab {
          position: fixed;
          bottom: 30px; right: 30px;
          background: var(--accent);
          color: #fff;
          border: none;
          padding: 16px 32px;
          border-radius: 50px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          z-index: 100;
        }
      </style>
    </head>
    <body>
      <button class="print-fab no-print" onclick="window.print()">PRINT DOCUMENT</button>

      <div class="document-container">
        <div class="security-strip"></div>
        <div class="hologram-seal"></div>

        <div class="content">
          <div class="header">
            <div class="brand-box">
              <div class="site-name">${formatBrandName(settings.siteName)}</div>
              <div style="font-size: 9px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
                Advanced Ledger Interface // Build 7.2.1<br>
                Secure Enterprise Reporting
              </div>
            </div>
            <div class="meta-box">
              <div class="meta-title">${reportHeader}</div>
              <div class="meta-subtitle">${subtitle || 'Protocol: Standard'}</div>
            </div>
          </div>

          <div class="tech-info">
            <div>DOC ID: <b>AERO-${Math.random().toString(36).substr(2, 6).toUpperCase()}</b></div>
            <div>STATUS: <b>VERIFIED</b></div>
            <div>ENCRYPTION: <b>AES-256</b></div>
            <div>VER: <b>3.4.1</b></div>
          </div>

          ${summary ? `
            <div class="summary-row">
              ${summary.map(s => `
                <div class="summary-item">
                  <div class="summary-label">${s.label}</div>
                  <div class="summary-val">${s.value}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <table class="main-table">
            <thead>
              <tr>
                ${showSerial ? '<th style="width: 40px">ID</th>' : ''}
                ${columns.map(c => `<th>${c.label}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map((row, idx) => `
                <tr>
                  ${showSerial ? `<td class="sl-no">${String(idx + 1).padStart(2, '0')}</td>` : ''}
                  ${columns.map(c => {
                    const val = row[c.key];
                    const display = c.format ? c.format(val) : val;
                    return `<td>${display || '-'}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="doc-footer">
            <div class="verification-box">
              <div class="mock-qr"><div class="qr-inner"></div></div>
              <div style="font-size: 8px; font-weight: 700; color: var(--text-muted); line-height: 1.4;">
                SCAN TO VERIFY AUTHENTICITY<br>
                DIGITAL SIGNATURE ATTACHED<br>
                SECURE AUTH RECORD #REF-${Math.floor(Math.random() * 900000 + 100000)}
              </div>
            </div>
            <div class="footer-note">
              <b>${reportFooter}</b>
              REF: ${new Date().toISOString()} // GENERATED BY SYSTEM ROOT
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export function exportToCSV(data: any[], fileName: string) {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row)
      .map(val => {
        if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
        return val;
      })
      .join(',')
  ).join('\n');
  
  const csv = `${headers}\n${rows}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
