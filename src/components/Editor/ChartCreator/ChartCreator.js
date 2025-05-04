// src/components/Editor/ChartCreator/ChartCreator.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Nav, Tab } from 'react-bootstrap';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';

// Mảng màu sắc cho đồ thị
const CHART_COLORS = [
  '#2196F3', '#F44336', '#4CAF50', '#FF9800', '#9C27B0', 
  '#00BCD4', '#FFEB3B', '#795548', '#607D8B', '#E91E63'
];

/**
 * ChartCreator Component cho phép người dùng tạo và chỉnh sửa biểu đồ
 * @param {Object} props - Component props
 * @param {Function} props.onSelectChart - Callback khi chọn biểu đồ
 * @param {Function} props.onClose - Callback khi đóng modal
 * @param {Object} props.initialData - Dữ liệu biểu đồ ban đầu (nếu có)
 */
const ChartCreator = ({ onSelectChart, onClose, initialData }) => {
  // State cho loại biểu đồ
  const [chartType, setChartType] = useState(initialData?.type || 'bar');
  
  // State cho tiêu đề và mô tả
  const [chartTitle, setChartTitle] = useState(initialData?.title || 'Biểu đồ mới');
  const [chartDesc, setChartDesc] = useState(initialData?.description || '');
  
  // State cho tab hiện tại
  const [activeTab, setActiveTab] = useState('data');
  
  // State cho dữ liệu biểu đồ
  const [data, setData] = useState(initialData?.data || [
    { name: 'A', value: 400 },
    { name: 'B', value: 300 },
    { name: 'C', value: 300 },
    { name: 'D', value: 200 }
  ]);

  // State cho dữ liệu dạng bảng
  const [tableData, setTableData] = useState('');
  
  // State cho cài đặt biểu đồ
  const [showLegend, setShowLegend] = useState(initialData?.showLegend !== false);
  const [showGrid, setShowGrid] = useState(initialData?.showGrid !== false);
  const [aspectRatio, setAspectRatio] = useState(initialData?.aspectRatio || '16:9');
  const [customColors, setCustomColors] = useState(initialData?.colors || CHART_COLORS.slice(0, 5));
  
  // Khởi tạo dữ liệu dạng bảng từ data
  useEffect(() => {
    if (initialData?.data) {
      const tableText = initialData.data.map(item => {
        return `${item.name},${item.value}`;
      }).join('\n');
      setTableData(tableText);
    } else if (tableData === '') {
      // Set mẫu dữ liệu mặc định nếu không có dữ liệu
      setTableData('A,400\nB,300\nC,300\nD,200');
    }
  }, [initialData]);
  
  // Cập nhật dữ liệu từ dạng bảng
  const updateDataFromTable = () => {
    try {
      const rows = tableData.trim().split('\n');
      const newData = rows.map(row => {
        const [name, valueStr] = row.split(',');
        const value = parseFloat(valueStr);
        return { name, value: isNaN(value) ? 0 : value };
      });
      
      setData(newData);
      return true;
    } catch (error) {
      console.error('Error parsing table data:', error);
      return false;
    }
  };
  
  // Xử lý khi chuyển tab
  const handleTabChange = (key) => {
    if (activeTab === 'data' && key !== 'data') {
      // Cập nhật dữ liệu trước khi chuyển tab
      updateDataFromTable();
    }
    setActiveTab(key);
  };
  
  // Xử lý khi hoàn thành
  const handleComplete = () => {
    // Cập nhật dữ liệu từ bảng
    if (!updateDataFromTable()) {
      alert('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
      return;
    }
    
    // Tạo đối tượng chart để trả về
    const chartData = {
      type: chartType,
      title: chartTitle,
      description: chartDesc,
      data,
      showLegend,
      showGrid,
      aspectRatio,
      colors: customColors,
      // Thêm thuộc tính cho việc render/export
      createdAt: Date.now()
    };
    
    // Gọi callback
    if (onSelectChart) {
      onSelectChart(chartData);
    }
  };
  
  // Render chart dựa trên loại và dữ liệu
  const renderChartPreview = () => {
    const width = aspectRatio === '16:9' ? 600 : (aspectRatio === '4:3' ? 533 : 500);
    const height = aspectRatio === '16:9' ? 337 : (aspectRatio === '4:3' ? 400 : 500);
    
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {showLegend && <Legend />}
              <Bar dataKey="value" name={chartTitle || 'Giá trị'}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={customColors[index % customColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {showLegend && <Legend />}
              <Line 
                type="monotone" 
                dataKey="value" 
                name={chartTitle || 'Giá trị'} 
                stroke={customColors[0]} 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={customColors[index % customColors.length]} />
                ))}
              </Pie>
              <Tooltip />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );
        
      default:
        return (
          <div className="text-center py-5">
            <p>Loại biểu đồ không được hỗ trợ.</p>
          </div>
        );
    }
  };
  
  return (
    <Modal
      show={true}
      onHide={onClose}
      size="lg"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Tạo biểu đồ</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Tab.Container activeKey={activeTab} onSelect={handleTabChange}>
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="data">Dữ liệu</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="type">Loại biểu đồ</Nav.Link>
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
                  <Form.Label>Tiêu đề biểu đồ</Form.Label>
                  <Form.Control
                    type="text"
                    value={chartTitle}
                    onChange={(e) => setChartTitle(e.target.value)}
                    placeholder="Nhập tiêu đề biểu đồ"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Mô tả (tùy chọn)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={chartDesc}
                    onChange={(e) => setChartDesc(e.target.value)}
                    placeholder="Nhập mô tả cho biểu đồ (nếu cần)"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Dữ liệu (định dạng: tên, giá trị)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    value={tableData}
                    onChange={(e) => setTableData(e.target.value)}
                    placeholder="A,400&#10;B,300&#10;C,300&#10;D,200"
                  />
                  <Form.Text className="text-muted">
                    Mỗi dòng một mục, phân tách tên và giá trị bằng dấu phẩy.
                  </Form.Text>
                </Form.Group>
                
                <div className="d-flex justify-content-between">
                  <Button variant="outline-secondary" onClick={() => handleTabChange('type')}>
                    Tiếp theo &raquo;
                  </Button>
                </div>
              </Form>
            </Tab.Pane>
            
            {/* Tab loại biểu đồ */}
            <Tab.Pane eventKey="type">
              <Form>
                <Form.Group className="mb-4">
                  <Form.Label>Chọn loại biểu đồ</Form.Label>
                  <div className="chart-type-selector">
                    <Row className="g-3">
                      <Col md={4}>
                        <div 
                          className={`chart-type-item p-3 border rounded text-center ${chartType === 'bar' ? 'border-primary bg-light' : ''}`}
                          onClick={() => setChartType('bar')}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="chart-type-icon mb-2">
                            <i className="bi bi-bar-chart-fill fs-1"></i>
                          </div>
                          <div className="chart-type-name">
                            Biểu đồ cột
                          </div>
                        </div>
                      </Col>
                      
                      <Col md={4}>
                        <div 
                          className={`chart-type-item p-3 border rounded text-center ${chartType === 'line' ? 'border-primary bg-light' : ''}`}
                          onClick={() => setChartType('line')}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="chart-type-icon mb-2">
                            <i className="bi bi-graph-up fs-1"></i>
                          </div>
                          <div className="chart-type-name">
                            Biểu đồ đường
                          </div>
                        </div>
                      </Col>
                      
                      <Col md={4}>
                        <div 
                          className={`chart-type-item p-3 border rounded text-center ${chartType === 'pie' ? 'border-primary bg-light' : ''}`}
                          onClick={() => setChartType('pie')}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="chart-type-icon mb-2">
                            <i className="bi bi-pie-chart-fill fs-1"></i>
                          </div>
                          <div className="chart-type-name">
                            Biểu đồ tròn
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Form.Group>
                
                <div className="d-flex justify-content-between">
                  <Button variant="outline-secondary" onClick={() => handleTabChange('data')}>
                    &laquo; Quay lại
                  </Button>
                  <Button variant="outline-secondary" onClick={() => handleTabChange('style')}>
                    Tiếp theo &raquo;
                  </Button>
                </div>
              </Form>
            </Tab.Pane>
            
            {/* Tab tùy chỉnh */}
            <Tab.Pane eventKey="style">
              <Form>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        id="show-legend"
                        label="Hiển thị chú thích"
                        checked={showLegend}
                        onChange={(e) => setShowLegend(e.target.checked)}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        id="show-grid"
                        label="Hiển thị lưới"
                        checked={showGrid}
                        onChange={(e) => setShowGrid(e.target.checked)}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Tỷ lệ khung hình</Form.Label>
                      <Form.Select
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value)}
                      >
                        <option value="16:9">16:9</option>
                        <option value="4:3">4:3</option>
                        <option value="1:1">1:1</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Màu sắc</Form.Label>
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        {customColors.map((color, index) => (
                          <div key={index} className="color-picker-item">
                            <input
                              type="color"
                              value={color}
                              onChange={(e) => {
                                const newColors = [...customColors];
                                newColors[index] = e.target.value;
                                setCustomColors(newColors);
                              }}
                              className="form-control form-control-color"
                              title={`Màu ${index + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => {
                            if (customColors.length < 10) {
                              setCustomColors([...customColors, CHART_COLORS[customColors.length % CHART_COLORS.length]]);
                            }
                          }}
                          disabled={customColors.length >= 10}
                        >
                          <i className="bi bi-plus-lg"></i> Thêm màu
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            if (customColors.length > 1) {
                              setCustomColors(customColors.slice(0, -1));
                            }
                          }}
                          disabled={customColors.length <= 1}
                        >
                          <i className="bi bi-dash-lg"></i> Bớt màu
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
                
                <div className="d-flex justify-content-between">
                  <Button variant="outline-secondary" onClick={() => handleTabChange('type')}>
                    &laquo; Quay lại
                  </Button>
                  <Button variant="outline-secondary" onClick={() => handleTabChange('preview')}>
                    Tiếp theo &raquo;
                  </Button>
                </div>
              </Form>
            </Tab.Pane>
            
            {/* Tab xem trước */}
            <Tab.Pane eventKey="preview">
              <div className="preview-container border rounded p-3 mb-4">
                <h5 className="text-center mb-3">{chartTitle || 'Biểu đồ mới'}</h5>
                {chartDesc && <p className="text-center mb-4">{chartDesc}</p>}
                
                <div className="chart-preview-container">
                  {renderChartPreview()}
                </div>
              </div>
              
              <div className="d-flex justify-content-between">
                <Button variant="outline-secondary" onClick={() => handleTabChange('style')}>
                  &laquo; Quay lại
                </Button>
                <Button variant="success" onClick={handleComplete}>
                  Hoàn thành
                </Button>
              </div>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Hủy
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChartCreator;