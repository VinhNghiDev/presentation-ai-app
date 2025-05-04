import React, { useState, useEffect } from 'react';
import { 
  getAvailableIntegrations, 
  connectToService, 
  disconnectService,
  importFromService,
  exportToService,
  getRecentFiles
} from '../../services/integrationService';

/**
 * Component hiển thị bảng quản lý tích hợp với các dịch vụ bên ngoài
 * @param {Object} props - Props component
 * @param {function} props.onImport - Callback khi nhập bài thuyết trình
 * @param {Object} props.presentation - Dữ liệu bài thuyết trình hiện tại
 * @param {function} props.onClose - Callback khi đóng bảng
 */
const IntegrationPanel = ({ onImport, presentation, onClose }) => {
  // State
  const [activeTab, setActiveTab] = useState('connect');
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [recentFiles, setRecentFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [exportResult, setExportResult] = useState(null);
  
  // Tải danh sách tích hợp khi component được tạo
  useEffect(() => {
    loadIntegrations();
  }, []);
  
  // Tải lại dữ liệu khi chuyển tab
  useEffect(() => {
    if (activeTab === 'import' && selectedService) {
      loadRecentFiles(selectedService);
    }
  }, [activeTab, selectedService]);
  
  /**
   * Tải danh sách tích hợp
   */
  const loadIntegrations = async () => {
    setLoading(true);
    setError('');
    
    try {
      const integrationsData = await getAvailableIntegrations();
      setIntegrations(integrationsData);
    } catch (error) {
      console.error('Error loading integrations:', error);
      setError('Không thể tải danh sách tích hợp.');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Tải danh sách tệp gần đây từ dịch vụ
   * @param {string} serviceId - ID dịch vụ
   */
  const loadRecentFiles = async (serviceId) => {
    setLoadingFiles(true);
    setError('');
    
    try {
      const files = await getRecentFiles(serviceId);
      setRecentFiles(files);
    } catch (error) {
      console.error('Error loading recent files:', error);
      setError(`Không thể tải tệp từ dịch vụ: ${error.message}`);
      setRecentFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };
  
  /**
   * Xử lý khi kết nối với dịch vụ
   * @param {string} integrationId - ID tích hợp
   */
  const handleConnect = async (integrationId) => {
    setProcessing(true);
    setError('');
    
    try {
      // Kết nối với dịch vụ
      const success = await connectToService(integrationId);
      
      if (success) {
        loadIntegrations();
        setSelectedService(integrationId);
      } else {
        setError('Không thể kết nối với dịch vụ. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error connecting to service:', error);
      setError(error.message || 'Không thể kết nối với dịch vụ.');
    } finally {
      setProcessing(false);
    }
  };
  
  /**
   * Xử lý khi ngắt kết nối với dịch vụ
   * @param {string} integrationId - ID tích hợp
   */
  const handleDisconnect = async (integrationId) => {
    if (!window.confirm('Bạn có chắc chắn muốn ngắt kết nối với dịch vụ này?')) {
      return;
    }
    
    setProcessing(true);
    setError('');
    
    try {
      const success = await disconnectService(integrationId);
      
      if (success) {
        loadIntegrations();
        if (selectedService === integrationId) {
          setSelectedService(null);
        }
      } else {
        setError('Không thể ngắt kết nối với dịch vụ. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error disconnecting service:', error);
      setError(error.message || 'Không thể ngắt kết nối với dịch vụ.');
    } finally {
      setProcessing(false);
    }
  };
  
  /**
   * Xử lý khi nhập từ dịch vụ
   * @param {string} serviceId - ID dịch vụ
   * @param {string} fileId - ID tệp (nếu có)
   */
  const handleImport = async (serviceId, fileId = null) => {
    setProcessing(true);
    setError('');
    
    try {
      const presentationData = await importFromService(serviceId, fileId);
      
      if (presentationData) {
        onImport(presentationData);
        onClose();
      } else {
        setError('Không thể nhập bài thuyết trình. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error importing presentation:', error);
      setError(error.message || 'Không thể nhập bài thuyết trình.');
    } finally {
      setProcessing(false);
    }
  };
  
  /**
   * Xử lý khi xuất sang dịch vụ
   * @param {string} serviceId - ID dịch vụ
   */
  const handleExport = async (serviceId) => {
    setProcessing(true);
    setError('');
    setExportResult(null);
    
    try {
      const result = await exportToService(serviceId, presentation);
      
      if (result.success) {
        setExportResult(result);
      } else {
        setError('Không thể xuất bài thuyết trình. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error exporting presentation:', error);
      setError(error.message || 'Không thể xuất bài thuyết trình.');
    } finally {
      setProcessing(false);
    }
  };
  
  /**
   * Định dạng thời gian
   * @param {string} timestamp - Dấu thời gian
   * @returns {string} - Chuỗi thời gian định dạng
   */
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN');
  };
  
  /**
   * Lấy tên dịch vụ từ ID
   * @param {string} serviceId - ID dịch vụ
   * @returns {string} - Tên dịch vụ
   */
  const getServiceName = (serviceId) => {
    const service = integrations.find(i => i.id === serviceId);
    return service ? service.name : serviceId;
  };
  
  /**
   * Lấy biểu tượng dịch vụ từ ID
   * @param {string} serviceId - ID dịch vụ
   * @returns {string} - Class biểu tượng
   */
  const getServiceIcon = (serviceId) => {
    const service = integrations.find(i => i.id === serviceId);
    return service ? service.icon : 'bi-box';
  };
  
  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Tích hợp và Chia sẻ</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={processing}
            ></button>
          </div>
          
          <div className="modal-body">
            {/* Tab navigation */}
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'connect' ? 'active' : ''}`}
                  onClick={() => setActiveTab('connect')}
                >
                  <i className="bi bi-boxes me-1"></i> Kết nối dịch vụ
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'import' ? 'active' : ''}`}
                  onClick={() => setActiveTab('import')}
                  disabled={!integrations.some(i => i.connected)}
                >
                  <i className="bi bi-download me-1"></i> Nhập
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'export' ? 'active' : ''}`}
                  onClick={() => setActiveTab('export')}
                  disabled={!integrations.some(i => i.connected) || !presentation}
                >
                  <i className="bi bi-upload me-1"></i> Xuất
                </button>
              </li>
            </ul>
            
            {/* Hiển thị lỗi nếu có */}
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            
            {/* Hiển thị thông báo xuất thành công */}
            {exportResult && (
              <div className="alert alert-success" role="alert">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <i className="bi bi-check-circle me-2"></i>
                    {exportResult.message}
                  </div>
                  {exportResult.url && (
                    <a
                      href={exportResult.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-primary"
                    >
                      <i className="bi bi-box-arrow-up-right me-1"></i>
                      Mở
                    </a>
                  )}
                </div>
              </div>
            )}
            
            {/* Tab content */}
            <div className="tab-content mt-3">
              {/* Kết nối dịch vụ */}
              {activeTab === 'connect' && (
                <div className="tab-pane active">
                  {loading ? (
                    <div className="text-center py-3">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                      </div>
                      <p className="mt-2">Đang tải danh sách dịch vụ...</p>
                    </div>
                  ) : (
                    <div className="list-group">
                      {integrations.map(integration => (
                        <div
                          key={integration.id}
                          className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <div className="d-flex align-items-center">
                              <i className={`bi ${integration.icon} me-3 fs-4`}></i>
                              <div>
                                <h6 className="mb-0">{integration.name}</h6>
                                <small className="text-muted">{integration.description}</small>
                              </div>
                            </div>
                          </div>
                          <div>
                            {integration.connected ? (
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDisconnect(integration.id)}
                                disabled={processing}
                              >
                                {processing && selectedService === integration.id ? (
                                  <div className="spinner-border spinner-border-sm me-1" role="status">
                                    <span className="visually-hidden">Đang xử lý...</span>
                                  </div>
                                ) : (
                                  <i className="bi bi-x-circle me-1"></i>
                                )}
                                Ngắt kết nối
                              </button>
                            ) : (
                              <button
                                className="btn btn-primary"
                                onClick={() => handleConnect(integration.id)}
                                disabled={processing}
                              >
                                {processing && selectedService === integration.id ? (
                                  <div className="spinner-border spinner-border-sm me-1" role="status">
                                    <span className="visually-hidden">Đang xử lý...</span>
                                  </div>
                                ) : (
                                  <i className="bi bi-link-45deg me-1"></i>
                                )}
                                Kết nối
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Nhập từ dịch vụ */}
              {activeTab === 'import' && (
                <div className="tab-pane active">
                  {/* Chọn dịch vụ */}
                  <div className="mb-3">
                    <label className="form-label">Chọn dịch vụ</label>
                    <select
                      className="form-select"
                      value={selectedService || ''}
                      onChange={e => {
                        const value = e.target.value;
                        setSelectedService(value ? value : null);
                        if (value) {
                          loadRecentFiles(value);
                        } else {
                          setRecentFiles([]);
                        }
                      }}
                    >
                      <option value="">-- Chọn dịch vụ --</option>
                      {integrations
                        .filter(i => i.connected)
                        .map(integration => (
                          <option key={integration.id} value={integration.id}>
                            {integration.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  
                  {/* Hiển thị tệp gần đây */}
                  {selectedService && (
                    <div>
                      <h6>
                        <i className={`bi ${getServiceIcon(selectedService)} me-2`}></i>
                        Tệp gần đây từ {getServiceName(selectedService)}
                      </h6>
                      
                      {loadingFiles ? (
                        <div className="text-center py-3">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                          </div>
                          <p className="mt-2">Đang tải tệp...</p>
                        </div>
                      ) : recentFiles.length > 0 ? (
                        <div className="list-group mt-3">
                          {recentFiles.map(file => (
                            <div 
                              key={file.id}
                              className="list-group-item list-group-item-action d-flex align-items-center"
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleImport(selectedService, file.id)}
                            >
                              <div className="me-3" style={{ width: '120px' }}>
                                <img
                                  src={file.thumbnail}
                                  alt={file.name}
                                  className="img-thumbnail"
                                  style={{ maxWidth: '100px' }}
                                />
                              </div>
                              <div>
                                <h6 className="mb-0">{file.name}</h6>
                                <small className="text-muted">
                                  Chỉnh sửa lần cuối: {formatTime(file.lastModified)}
                                </small>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          Không có tệp nào gần đây.
                        </div>
                      )}
                      
                      {/* Tạo mới từ dịch vụ */}
                      <div className="mt-3">
                        <button
                          className="btn btn-primary w-100"
                          onClick={() => handleImport(selectedService)}
                          disabled={processing}
                        >
                          {processing ? (
                            <div className="spinner-border spinner-border-sm me-1" role="status">
                              <span className="visually-hidden">Đang xử lý...</span>
                            </div>
                          ) : (
                            <i className="bi bi-plus-circle me-1"></i>
                          )}
                          Tạo mới từ {getServiceName(selectedService)}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {!selectedService && (
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      Vui lòng chọn một dịch vụ để nhập bài thuyết trình.
                    </div>
                  )}
                </div>
              )}
              
              {/* Xuất sang dịch vụ */}
              {activeTab === 'export' && (
                <div className="tab-pane active">
                  <div className="mb-3">
                    <label className="form-label">Chọn dịch vụ để xuất</label>
                    
                    <div className="row mt-3">
                      {integrations
                        .filter(i => i.connected)
                        .map(integration => (
                          <div key={integration.id} className="col-md-6 mb-3">
                            <div className="card">
                              <div className="card-body">
                                <h5 className="card-title d-flex align-items-center">
                                  <i className={`bi ${integration.icon} me-2 fs-4`}></i>
                                  {integration.name}
                                </h5>
                                <p className="card-text small text-muted">
                                  {integration.description}
                                </p>
                                <button
                                  className="btn btn-primary w-100"
                                  onClick={() => handleExport(integration.id)}
                                  disabled={processing}
                                >
                                  {processing && selectedService === integration.id ? (
                                    <div className="spinner-border spinner-border-sm me-1" role="status">
                                      <span className="visually-hidden">Đang xử lý...</span>
                                    </div>
                                  ) : (
                                    <i className="bi bi-upload me-1"></i>
                                  )}
                                  Xuất sang {integration.name}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                    
                    {integrations.filter(i => i.connected).length === 0 && (
                      <div className="alert alert-info">
                        <i className="bi bi-info-circle me-2"></i>
                        Vui lòng kết nối với một dịch vụ trước khi xuất.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={processing}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationPanel; 