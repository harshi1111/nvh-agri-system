'use client';

import React from 'react';

interface ExportButtonProps {
  data: any[];
  fileName?: string;
  buttonText?: string;
}

const ExportToExcelButton: React.FC<ExportButtonProps> = ({
  data,
  fileName = 'transactions_export',
  buttonText = 'Export to Excel'
}) => {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert("No data available to export.");
      return;
    }

    // Convert data to CSV format
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        let value = row[header];
        if (value === undefined || value === null) value = '';
        // Wrap in quotes if contains comma or newline
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('\n')) {
          return `"${stringValue}"`;
        }
        return stringValue;
      });
      csvRows.push(values.join(','));
    }
    
    // Create CSV file
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert(`Exported ${data.length} transactions successfully!`);
  };

  return (
    <button
      onClick={handleExport}
      className="w-full bg-green-600 text-white rounded-lg px-3 py-1.5 text-sm hover:bg-green-700 transition flex items-center justify-center gap-2"
    >
      📊 {buttonText} {data.length > 0 && `(${data.length})`}
    </button>
  );
};

export default ExportToExcelButton;
