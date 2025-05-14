import React, { useState } from 'react';
import exportService from '../../services/exportService';
import { toast } from 'react-toastify';
import './ExportPanel.css';

/**
 * Component hiển thị panel xuất file với nhiều định dạng
 */
const ExportPanel = ({ presentation, slideElements, onClose }) => {
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const [exportError, setExportError] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [quality, setQuality] = useState('high');

  /**
   * Xử lý sự kiện xuất file
   */
  const handleExport = async () => {
    try {
      setExporting(true);
      setExportError('');
      setExportStatus(`Đang chuẩn bị xuất sang ${selectedFormat.toUpperCase()}...`);

      let result;
      switch (selectedFormat) {
        case 'pdf':
          setExportStatus('Đang tạo file PDF...');
          result = await exportService.exportToPDF(slideElements, presentation.title, quality);
          break;
        case 'png':
          setExportStatus('Đang tạo file PNG...');
          result = await exportService.exportToPNG(slideElements, presentation.title, quality);
          break;
        case 'pptx':
          setExportStatus('Đang tạo file PPTX...');
          result = await exportService.exportToPPTX(presentation, slideElements, quality);
          break;
        case 'html':
          setExportStatus('Đang tạo file HTML...');
          result = await exportService.exportToHTML(presentation);
          break;
        default:
          throw new Error('Định dạng không được hỗ trợ');
      }

      if (result.success) {
        setExportStatus(`Xuất thành công! File: ${result.fileName}`);
        toast.success('Xuất file thành công!');
      } else {
        throw new Error('Lỗi không xác định khi xuất file');
      }
    } catch (error) {
      console.error('Lỗi khi xuất file:', error);
      setExportError(error.message || 'Có lỗi xảy ra khi xuất file');
      setExportStatus('');
      toast.error('Có lỗi xảy ra khi xuất file: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const handleCloudSave = async (service) => {
    try {
      setExporting(true);
      setExportError('');
      setExportStatus(`Đang lưu lên ${service}...`);

      let result;
      switch (service) {
        case 'google':
          result = await exportService.saveToGoogleDrive(presentation);
          break;
        case 'dropbox':
          result = await exportService.saveToDropbox(presentation);
          break;
        case 'onedrive':
          result = await exportService.saveToOneDrive(presentation);
          break;
        default:
          throw new Error('Dịch vụ không được hỗ trợ');
      }

      if (result.success) {
        setExportStatus(`Đã lưu lên ${service} thành công!`);
        toast.success('Đã lưu lên cloud thành công!');
      } else {
        throw new Error('Lỗi không xác định khi lưu lên cloud');
      }
    } catch (error) {
      console.error('Lỗi khi lưu lên cloud:', error);
      setExportError(error.message || 'Có lỗi xảy ra khi lưu lên cloud');
      setExportStatus('');
      toast.error('Có lỗi xảy ra khi lưu lên cloud: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="export-panel">
      <h3>Xuất bài thuyết trình</h3>
      
      <div className="export-options">
        <div className="form-group">
          <label>Chọn định dạng:</label>
          <div className="format-options">
            <button 
              className={`format-option ${selectedFormat === 'pdf' ? 'selected' : ''}`}
              onClick={() => setSelectedFormat('pdf')}
              disabled={exporting}
            >
              <i className="format-icon pdf-icon"></i>
              <span>PDF</span>
            </button>
            
            <button 
              className={`format-option ${selectedFormat === 'pptx' ? 'selected' : ''}`}
              onClick={() => setSelectedFormat('pptx')}
              disabled={exporting}
            >
              <i className="format-icon pptx-icon"></i>
              <span>PowerPoint</span>
            </button>
            
            <button 
              className={`format-option ${selectedFormat === 'png' ? 'selected' : ''}`}
              onClick={() => setSelectedFormat('png')}
              disabled={exporting}
            >
              <i className="format-icon png-icon"></i>
              <span>PNG Images</span>
            </button>
            
            <button 
              className={`format-option ${selectedFormat === 'html' ? 'selected' : ''}`}
              onClick={() => setSelectedFormat('html')}
              disabled={exporting}
            >
              <i className="format-icon html-icon"></i>
              <span>HTML</span>
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Chất lượng:</label>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="quality-select"
            disabled={exporting}
          >
            <option value="low">Thấp</option>
            <option value="medium">Trung bình</option>
            <option value="high">Cao</option>
          </select>
        </div>
        
        <div className="format-description">
          {selectedFormat === 'pdf' && (
            <p>Xuất bài thuyết trình thành file PDF, phù hợp để chia sẻ và in ấn.</p>
          )}
          {selectedFormat === 'pptx' && (
            <p>Xuất thành file PowerPoint (.pptx), cho phép chỉnh sửa tiếp trong Microsoft PowerPoint.</p>
          )}
          {selectedFormat === 'png' && (
            <p>Xuất mỗi slide thành một hình ảnh PNG riêng biệt, đóng gói trong file ZIP.</p>
          )}
          {selectedFormat === 'html' && (
            <p>Xuất thành trang web HTML, có thể xem trên trình duyệt và dễ dàng chia sẻ trực tuyến.</p>
          )}
        </div>

        <div className="cloud-options">
          <h4>Lưu lên cloud</h4>
          <div className="cloud-buttons">
            <button
              onClick={() => handleCloudSave('google')}
              disabled={exporting}
              className="cloud-button google"
            >
              Google Drive
            </button>
            <button
              onClick={() => handleCloudSave('dropbox')}
              disabled={exporting}
              className="cloud-button dropbox"
            >
              Dropbox
            </button>
            <button
              onClick={() => handleCloudSave('onedrive')}
              disabled={exporting}
              className="cloud-button onedrive"
            >
              OneDrive
            </button>
          </div>
        </div>
      </div>

      {exportError && (
        <div className="export-error">
          <p>{exportError}</p>
        </div>
      )}

      {exportStatus && (
        <div className="export-status">
          <p>{exportStatus}</p>
        </div>
      )}

      <div className="export-actions">
        <button 
          className="btn-secondary"
          onClick={onClose}
          disabled={exporting}
        >
          Hủy
        </button>
        
        <button 
          className="btn-primary"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? 'Đang xuất...' : `Xuất sang ${selectedFormat.toUpperCase()}`}
        </button>
      </div>
    </div>
  );
};

export default ExportPanel; 