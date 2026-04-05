'use client';

import React from 'react';
import useExportExcel from 'use-export-excel';

interface ExportButtonProps {
  data: any[];
  fileName?: string;
  buttonText?: string;
}

const ExportToExcelButton: React.FC<ExportButtonProps> = ({
  data,
  fileName = 'my_data_export',
  buttonText = 'Export to Excel'
}) => {
  const { exportExcel } = useExportExcel();

  const handleExport = () => {
    if (!data || data.length === 0) {
      alert("No data available to export.");
      return;
    }
    exportExcel(data, {
      sheetName: 'Transactions', // Name of the sheet in Excel
      bookType: 'xlsx',          // File type: .xlsx
      filename: `${fileName}.xlsx`,
    });
  };

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
    >
      📊 {buttonText}
    </button>
  );
};

export default ExportToExcelButton;
