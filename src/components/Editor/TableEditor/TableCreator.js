import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Nav, Tab, Table, InputGroup, Dropdown } from 'react-bootstrap';

/**
 * TableCreator Component cho phép người dùng tạo và chỉnh sửa bảng
 * @param {Object} props - Component props
 * @param {Function} props.onSelectTable - Callback khi chọn bảng
 * @param {Function} props.onClose - Callback khi đóng modal
 * @param {Object} props.initialData - Dữ liệu bảng ban đầu (nếu có)
 */
const TableCreator = ({ onSelectTable, onClose, initialData }) => {
  // State cho tiêu đề và mô tả
  const [tableTitle, setTableTitle] = useState(initialData?.title || 'Bảng mới');
  const [tableDesc, setTableDesc] = useState(initialData?.description || '');
  
  // State cho tab hiện tại
  const [activeTab, setActiveTab] = useState('data');
  
  // State cho kích thước bảng
  const [rows, setRows] = useState(initialData?.rows || 3);
  const [columns, setColumns] = useState(initialData?.columns || 3);
  
  // State cho dữ liệu bảng
  const [tableData, setTableData] = useState(initialData?.data || []);
  
  // State cho header của bảng
  const [headers, setHeaders] = useState(initialData?.headers || []);
  
  // State cho cài đặt bảng
  const [tableStyle, setTableStyle] = useState(initialData?.style || 'bordered');
  const [headerType, setHeaderType] = useState(initialData?.headerType || 'top');
  const [isResponsive, setIsResponsive] = useState(initialData?.isResponsive !== false);
  const [isStriped, setIsStriped] = useState(initialData?.isStriped || false);
  const [isHoverable, setIsHoverable] = useState(initialData?.isHoverable || false);
  const [tableBorderColor, setTableBorderColor] = useState(initialData?.borderColor || '#dee2e6');
  const [tableHeaderBgColor, setTableHeaderBgColor] = useState(initialData?.headerBgColor || '#f8f9fa');
  const [tableHeaderTextColor, setTableHeaderTextColor] = useState(initialData?.headerTextColor || '#212529');
  
  // Khởi tạo dữ liệu bảng
  useEffect(() => {
    if (initialData?.data) {
      setTableData(initialData.data);
      setHeaders(initialData.headers || []);
    } else {
      initializeTable();
    }
  }, []);
  
  // Khởi tạo bảng với kích thước mặc định
  const initializeTable = () => {
    // Tạo headers mặc định
    const defaultHeaders = Array(columns).fill('').map((_, index) => `Cột ${index + 1}`);
    setHeaders(defaultHeaders);
    
    // Tạo dữ liệu mặc định
    const defaultData = Array(rows).fill('').map((_, rowIndex) => {
      return Array(columns).fill('').map((_, colIndex) => `Dữ liệu ${rowIndex + 1}-${colIndex + 1}`);
    });
    
    setTableData(defaultData);
  };
  
  // Cập nhật kích thước bảng
  const updateTableSize = (newRows, newColumns) => {
    const currentRows = tableData.length;
    const currentColumns = tableData[0]?.length || 0;
    
    let newData = [...tableData];
    let newHeaders = [...headers];
    
    // Cập nhật số cột
    if (newColumns !== currentColumns) {
      // Cập nhật headers
      if (newColumns > currentColumns) {
        // Thêm cột mới
        for (let i = currentColumns; i < newColumns; i++) {
          newHeaders.push(`Cột ${i + 1}`);
        }
      } else {
        // Xóa cột thừa
        newHeaders = newHeaders.slice(0, newColumns);
      }
      
      // Cập nhật dữ liệu theo số cột mới
      newData = newData.map(row => {
        if (newColumns > currentColumns) {
          // Thêm ô dữ liệu mới
          return [...row, ...Array(newColumns - currentColumns).fill('')];
        } else {
          // Xóa ô dữ liệu thừa
          return row.slice(0, newColumns);
        }
      });
    }
    
    // Cập nhật số hàng
    if (newRows !== currentRows) {
      if (newRows > currentRows) {
        // Thêm hàng mới
        for (let i = currentRows; i < newRows; i++) {
          newData.push(Array(newColumns).fill(''));
        }
      } else {
        // Xóa hàng thừa
        newData = newData.slice(0, newRows);
      }
    }
    
    setRows(newRows);
    setColumns(newColumns);
    setHeaders(newHeaders);
    setTableData(newData);
  };
  
  // Cập nhật giá trị ô
  const updateCellValue = (rowIndex, colIndex, value) => {
    const newData = [...tableData];
    newData[rowIndex][colIndex] = value;
    setTableData(newData);
  };
  
  // Cập nhật giá trị header
  const updateHeaderValue = (colIndex, value) => {
    const newHeaders = [...headers];
    newHeaders[colIndex] = value;
    setHeaders(newHeaders);
  };
  
  // Xử lý khi hoàn thành
  const handleComplete = () => {
    // Kiểm tra và xử lý dữ liệu
    if (tableData.length === 0 || headers.length === 0) {
      alert('Bảng cần phải có ít nhất một hàng và một cột dữ liệu.');
      return;
    }
    
    // Tạo đối tượng bảng để trả về
    const tableObj = {
      title: tableTitle,
      description: tableDesc,
      rows,
      columns,
      headers,
      data: tableData,
      style: tableStyle,
      headerType,
      isResponsive,
      isStriped,
      isHoverable,
      borderColor: tableBorderColor,
      headerBgColor: tableHeaderBgColor,
      headerTextColor: tableHeaderTextColor,
      createdAt: Date.now()
    };
    
    // Gọi callback
    if (onSelectTable) {
      onSelectTable(tableObj);
    }
  };
  
  // Đánh số thứ tự hàng
  const renderRowNumber = (index) => {
    return <th className="text-center" style={{ width: '40px' }}>{index + 1}</th>;
  };
  
  // Render bảng với dữ liệu hiện tại
  const renderTablePreview = () => {
    const tableClasses = [
      'table',
      tableStyle === 'bordered' ? 'table-bordered' : '',
      tableStyle === 'borderless' ? 'table-borderless' : '',
      isStriped ? 'table-striped' : '',
      isHoverable ? 'table-hover' : '',
    ].filter(Boolean).join(' ');
    
    const tableStyles = {
      '--bs-table-border-color': tableBorderColor,
    };
    
    const headerStyles = {
      backgroundColor: tableHeaderBgColor,
      color: tableHeaderTextColor,
    };
    
    return (
      <div className={isResponsive ? 'table-responsive' : ''}>
        <Table className={tableClasses} style={tableStyles}>
          {headerType !== 'none' && (
            <thead>
              <tr>
                {headerType === 'both' && <th style={headerStyles}></th>}
                {headers.map((header, index) => (
                  <th key={index} style={headerStyles}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {tableData.map((row, rowIndex) => (
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
    );
  };
  
  return (
    <Modal
      show={true}
      onHide={onClose}
      size="xl"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Tạo Bảng</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Tab.Container activeKey={activeTab} onSelect={(key) => setActiveTab(key)}>
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="data">Dữ liệu</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="style">Tùy chỉnh</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="preview">Xem trước</Nav.Link>
            </Nav.Item>
          </Nav>
          
          <Tab.Content>
            {/* Tab dữ liệu */}
            <Tab.Pane eventKey="data">
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Tiêu đề bảng</Form.Label>
                  <Form.Control
                    type="text"
                    value={tableTitle}
                    onChange={(e) => setTableTitle(e.target.value)}
                    placeholder="Nhập tiêu đề bảng"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Mô tả (tùy chọn)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={tableDesc}
                    onChange={(e) => setTableDesc(e.target.value)}
                    placeholder="Nhập mô tả cho bảng (nếu cần)"
                  />
                </Form.Group>
                
                <Row className="mb-3 align-items-center">
                  <Col md={3}>
                    <Form.Label>Kích thước bảng:</Form.Label>
                  </Col>
                  <Col md={4}>
                    <InputGroup>
                      <InputGroup.Text>Hàng</InputGroup.Text>
                      <Form.Control
                        type="number"
                        min="1"
                        max="20"
                        value={rows}
                        onChange={(e) => updateTableSize(parseInt(e.target.value) || 1, columns)}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={4}>
                    <InputGroup>
                      <InputGroup.Text>Cột</InputGroup.Text>
                      <Form.Control
                        type="number"
                        min="1"
                        max="10"
                        value={columns}
                        onChange={(e) => updateTableSize(rows, parseInt(e.target.value) || 1)}
                      />
                    </InputGroup>
                  </Col>
                </Row>
                
                <div className="mb-3">
                  <Form.Label>Chỉnh sửa header:</Form.Label>
                  <div className="d-flex mb-2" style={{ overflowX: 'auto' }}>
                    {headerType !== 'none' && headers.map((header, index) => (
                      <div key={index} className="me-2" style={{ minWidth: '120px' }}>
                        <Form.Control
                          type="text"
                          size="sm"
                          value={header}
                          onChange={(e) => updateHeaderValue(index, e.target.value)}
                          placeholder={`Cột ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-3">
                  <Form.Label>Chỉnh sửa dữ liệu:</Form.Label>
                  <div className="table-editor" style={{ overflowX: 'auto' }}>
                    <Table bordered size="sm">
                      <thead>
                        <tr>
                          {headerType === 'both' && <th style={{ width: '40px' }}>#</th>}
                          {headers.map((header, index) => (
                            <th key={index}>{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {(headerType === 'left' || headerType === 'both') && renderRowNumber(rowIndex)}
                            {row.map((cell, colIndex) => (
                              <td key={colIndex}>
                                <Form.Control
                                  type="text"
                                  size="sm"
                                  value={cell}
                                  onChange={(e) => updateCellValue(rowIndex, colIndex, e.target.value)}
                                  placeholder={`Dữ liệu ${rowIndex + 1}-${colIndex + 1}`}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
                
                <Row className="mt-3">
                  <Col>
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => updateTableSize(rows + 1, columns)}
                    >
                      <i className="bi bi-plus-circle me-1"></i> Thêm hàng
                    </Button>{' '}
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => updateTableSize(rows, columns + 1)}
                      disabled={columns >= 10}
                    >
                      <i className="bi bi-plus-circle me-1"></i> Thêm cột
                    </Button>
                  </Col>
                  <Col className="text-end">
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => updateTableSize(rows - 1, columns)}
                      disabled={rows <= 1}
                    >
                      <i className="bi bi-dash-circle me-1"></i> Xóa hàng
                    </Button>{' '}
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => updateTableSize(rows, columns - 1)}
                      disabled={columns <= 1}
                    >
                      <i className="bi bi-dash-circle me-1"></i> Xóa cột
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Tab.Pane>
            
            {/* Tab tùy chỉnh */}
            <Tab.Pane eventKey="style">
              <Form>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Kiểu bảng</Form.Label>
                      <Form.Select 
                        value={tableStyle}
                        onChange={(e) => setTableStyle(e.target.value)}
                      >
                        <option value="bordered">Có viền</option>
                        <option value="borderless">Không viền</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Vị trí tiêu đề</Form.Label>
                      <Form.Select 
                        value={headerType}
                        onChange={(e) => setHeaderType(e.target.value)}
                      >
                        <option value="top">Chỉ phía trên</option>
                        <option value="left">Chỉ bên trái</option>
                        <option value="both">Cả trên và trái</option>
                        <option value="none">Không hiển thị tiêu đề</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Check 
                      type="switch"
                      id="responsive-switch"
                      label="Responsive (cuộn ngang)"
                      checked={isResponsive}
                      onChange={(e) => setIsResponsive(e.target.checked)}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Check 
                      type="switch"
                      id="striped-switch"
                      label="Nền sọc (Striped)"
                      checked={isStriped}
                      onChange={(e) => setIsStriped(e.target.checked)}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Check 
                      type="switch"
                      id="hover-switch"
                      label="Hiệu ứng hover"
                      checked={isHoverable}
                      onChange={(e) => setIsHoverable(e.target.checked)}
                    />
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Màu viền</Form.Label>
                      <div className="d-flex">
                        <Form.Control 
                          type="color" 
                          value={tableBorderColor}
                          onChange={(e) => setTableBorderColor(e.target.value)}
                          style={{ width: '50px', height: '38px' }}
                        />
                        <Form.Control 
                          type="text"
                          value={tableBorderColor}
                          onChange={(e) => setTableBorderColor(e.target.value)}
                          className="ms-2"
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Màu nền tiêu đề</Form.Label>
                      <div className="d-flex">
                        <Form.Control 
                          type="color" 
                          value={tableHeaderBgColor}
                          onChange={(e) => setTableHeaderBgColor(e.target.value)}
                          style={{ width: '50px', height: '38px' }}
                        />
                        <Form.Control 
                          type="text"
                          value={tableHeaderBgColor}
                          onChange={(e) => setTableHeaderBgColor(e.target.value)}
                          className="ms-2"
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Màu chữ tiêu đề</Form.Label>
                      <div className="d-flex">
                        <Form.Control 
                          type="color" 
                          value={tableHeaderTextColor}
                          onChange={(e) => setTableHeaderTextColor(e.target.value)}
                          style={{ width: '50px', height: '38px' }}
                        />
                        <Form.Control 
                          type="text"
                          value={tableHeaderTextColor}
                          onChange={(e) => setTableHeaderTextColor(e.target.value)}
                          className="ms-2"
                        />
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
                
                <div className="p-3 border rounded bg-light mb-3">
                  <h6>Mẫu khác</h6>
                  <div className="d-flex flex-wrap gap-2">
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => {
                        setTableStyle('bordered');
                        setTableBorderColor('#dee2e6');
                        setTableHeaderBgColor('#f8f9fa');
                        setTableHeaderTextColor('#212529');
                        setIsStriped(false);
                        setIsHoverable(false);
                      }}
                    >
                      Mặc định
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => {
                        setTableStyle('bordered');
                        setTableBorderColor('#90caf9');
                        setTableHeaderBgColor('#2196f3');
                        setTableHeaderTextColor('#ffffff');
                        setIsStriped(true);
                        setIsHoverable(true);
                      }}
                    >
                      Blue
                    </Button>
                    <Button 
                      variant="outline-success" 
                      size="sm"
                      onClick={() => {
                        setTableStyle('bordered');
                        setTableBorderColor('#a5d6a7');
                        setTableHeaderBgColor('#4caf50');
                        setTableHeaderTextColor('#ffffff');
                        setIsStriped(true);
                        setIsHoverable(true);
                      }}
                    >
                      Green
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => {
                        setTableStyle('bordered');
                        setTableBorderColor('#ef9a9a');
                        setTableHeaderBgColor('#f44336');
                        setTableHeaderTextColor('#ffffff');
                        setIsStriped(false);
                        setIsHoverable(true);
                      }}
                    >
                      Red
                    </Button>
                    <Button 
                      variant="outline-dark" 
                      size="sm"
                      onClick={() => {
                        setTableStyle('bordered');
                        setTableBorderColor('#424242');
                        setTableHeaderBgColor('#212121');
                        setTableHeaderTextColor('#ffffff');
                        setIsStriped(false);
                        setIsHoverable(true);
                      }}
                    >
                      Dark
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => {
                        setTableStyle('borderless');
                        setTableBorderColor('#ffffff');
                        setTableHeaderBgColor('#ffffff');
                        setTableHeaderTextColor('#212529');
                        setIsStriped(true);
                        setIsHoverable(true);
                      }}
                    >
                      Borderless
                    </Button>
                  </div>
                </div>
              </Form>
            </Tab.Pane>
            
            {/* Tab xem trước */}
            <Tab.Pane eventKey="preview">
              <div className="preview-container p-3">
                <h5 className="mb-3">{tableTitle || 'Bảng mới'}</h5>
                {tableDesc && <p className="text-muted mb-3">{tableDesc}</p>}
                
                {renderTablePreview()}
              </div>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleComplete}>
          Tạo Bảng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TableCreator; 