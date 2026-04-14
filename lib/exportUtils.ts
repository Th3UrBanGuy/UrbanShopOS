
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
  document.body.removeChild(a);
}

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
  settings: { siteName: string; formatPrice: (n: number) => string };
}) {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title} - ${settings.siteName}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Inter', sans-serif; padding: 40px; color: #111; line-height: 1.5; }
        .header { margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
        .site-name { font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em; }
        .report-title { font-size: 14px; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px; }
        .report-subtitle { font-size: 11px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }
        
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .summary-card { padding: 16px; border: 1px solid #eee; border-radius: 12px; }
        .summary-label { font-size: 10px; font-weight: 800; color: #999; text-transform: uppercase; margin-bottom: 4px; }
        .summary-value { font-size: 18px; font-weight: 900; }

        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { text-align: left; padding: 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #666; border-bottom: 2px solid #eee; }
        td { padding: 12px; font-size: 12px; border-bottom: 1px solid #f5f5f5; vertical-align: top; }
        .font-mono { font-family: ui-monospace, monospace; font-size: 10px; }
        
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
          @page { margin: 2cm; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="site-name">${settings.siteName}</div>
        <div class="report-title">${title}</div>
        ${subtitle ? `<div class="report-subtitle">${subtitle}</div>` : ''}
        <div class="report-subtitle">Generated: ${new Date().toLocaleString()}</div>
      </div>

      ${summary ? `
        <div class="summary-grid">
          ${summary.map(s => `
            <div class="summary-card">
              <div class="summary-label">${s.label}</div>
              <div class="summary-value">${s.value}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <table>
        <thead>
          <tr>
            ${columns.map(c => `<th>${c.label}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${columns.map(c => {
                const val = row[c.key];
                const display = c.format ? c.format(val) : val;
                return `<td>${display}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>

      <script>
        window.onload = () => {
          setTimeout(() => { window.print(); window.close(); }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
