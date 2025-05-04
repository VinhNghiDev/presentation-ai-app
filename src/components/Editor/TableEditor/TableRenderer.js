import React from 'react';
import { Table } from 'react-bootstrap';

/**
 * TableRenderer Component để hiển thị bảng trong slide
 * @param {Object} props - Component props
 * @param {Object} props.tableData - Dữ liệu bảng để hiển thị
 * @param {Object} props.style - Style tùy chỉnh (tùy chọn)
 * @param {Function} props.onEdit - Callback khi cần chỉnh sửa (tùy chọn)
 */
const TableRenderer = ({ tableData, style = {}, onEdit }) => {
  if (!tableData || !tableData.data || !tableData.headers) {
    return (
      <div className="table-empty p-3 text-center border rounded">
        <p className="mb-0 text-muted">Không có dữ liệu bảng</p>
      </div>
    );
  }
  
  // Trích xuất các thuộc tính của bảng
  const {
    title,
    description,
    headers,
    data,
    style: tableStyle = 'bordered',
    headerType = 'top',
    isResponsive = true,
    isStriped = false,
    isHoverable = false,
    borderColor = '#dee2e6',
    headerBgColor = '#f8f9fa',
    headerTextColor = '#212529'
  } = tableData;
  
  // Tạo các class cho bảng
  const tableClasses = [
    'table',
    tableStyle === 'bordered' ? 'table-bordered' : '',
    tableStyle === 'borderless' ? 'table-borderless' : '',
    isStriped ? 'table-striped' : '',
    isHoverable ? 'table-hover' : '',
  ].filter(Boolean).join(' ');
  
  // Style cho bảng
  const tableStyles = {
    '--bs-table-border-color': borderColor,
    ...style
  };
  
  // Style cho header
  const headerStyles = {
    backgroundColor: headerBgColor,
    color: headerTextColor,
  };
  
  // Render số thứ tự hàng
  const renderRowNumber = (index) => {
    return <th className="text-center" style={{ width: '40px', ...headerStyles }}>{index + 1}</th>;
  };
  
  return (
    <div className="table-renderer">
      {title && <h5 className="mb-2">{title}</h5>}
      {description && <p className="text-muted mb-3 small">{description}</p>}
      
      <div className={isResponsive ? 'table-responsive' : ''}>
        <Table className={tableClasses} style={tableStyles}>
          {headerType !== 'none' && (
            <thead>
              <tr>
                {headerType === 'both' && <th style={headerStyles}>#</th>}
                {headers.map((header, index) => (
                  <th key={index} style={headerStyles}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {(headerType === 'left' || headerType === 'both') && renderRowNumber(rowIndex)}
                {row.map((cell, colIndex) => (
                  <td key={colIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      
      {onEdit && (
        <div className="text-end mt-2">
          <button 
            className="btn btn-sm btn-outline-secondary" 
            onClick={onEdit}
            title="Chỉnh sửa bảng"
          >
            <i className="bi bi-pencil me-1"></i>
            Chỉnh sửa
          </button>
        </div>
      )}
    </div>
  );
};

export default TableRenderer; 