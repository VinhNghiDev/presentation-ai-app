import React, { useState, useEffect } from 'react';
import presentationGenerator from '../../services/presentationGenerator';
import { toast } from 'react-toastify';
import './AIPresentation.css';

/**
 * Component cho việc tạo và quản lý bài thuyết trình AI
 */
const AIPresentation = ({ onGenerate, onClose, isVisible = false }) => {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('professional');
  const [slideCount, setSlideCount] = useState(5);
  const [purpose, setPurpose] = useState('education');
  const [audience, setAudience] = useState('general');
  const [language, setLanguage] = useState('vi');
  const [includeCharts, setIncludeCharts] = useState(false);
  const [includeImages, setIncludeImages] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!isVisible) {
      // Reset state when modal is closed
      setTopic('');
      setStyle('professional');
      setSlideCount(5);
      setPurpose('education');
      setAudience('general');
      setLanguage('vi');
      setIncludeCharts(false);
      setIncludeImages(false);
      setIsGenerating(false);
      setGenerationStatus('');
      setProgress(0);
      setPreview(null);
      presentationGenerator.clearCache();
    }
  }, [isVisible]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Vui lòng nhập chủ đề bài thuyết trình');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setGenerationStatus('Đang tạo outline...');

    try {
      const options = {
        style,
        slideCount,
        purpose,
        audience,
        language,
        includeCharts,
        includeImages
      };

      // Generate presentation
      const presentation = await presentationGenerator.generatePresentation(topic, options);
      
      // Validate presentation
      presentationGenerator.validatePresentation(presentation);

      // Update preview
      setPreview(presentation);
      setProgress(100);
      setGenerationStatus('Hoàn thành!');

      // Call onGenerate callback
      onGenerate(presentation);
    } catch (error) {
      console.error('Error generating presentation:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi tạo bài thuyết trình');
      setGenerationStatus('Lỗi: ' + (error.message || 'Không thể tạo bài thuyết trình'));
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Tạo bài thuyết trình với AI</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chủ đề bài thuyết trình
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Nhập chủ đề bài thuyết trình..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={isGenerating}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phong cách
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={isGenerating}
              >
                <option value="professional">Chuyên nghiệp</option>
                <option value="creative">Sáng tạo</option>
                <option value="minimal">Tối giản</option>
                <option value="academic">Học thuật</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng slide
              </label>
              <input
                type="number"
                value={slideCount}
                onChange={(e) => setSlideCount(parseInt(e.target.value))}
                min="1"
                max="20"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={isGenerating}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mục đích
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={isGenerating}
              >
                <option value="education">Giáo dục</option>
                <option value="marketing">Marketing</option>
                <option value="business">Kinh doanh</option>
                <option value="academic">Học thuật</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đối tượng
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={isGenerating}
              >
                <option value="general">Đại chúng</option>
                <option value="executives">Lãnh đạo</option>
                <option value="technical">Kỹ thuật</option>
                <option value="students">Học sinh/Sinh viên</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngôn ngữ
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={isGenerating}
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">Tiếng Anh</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="mr-2"
                  disabled={isGenerating}
                />
                <span className="text-sm font-medium text-gray-700">Bao gồm biểu đồ</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeImages}
                  onChange={(e) => setIncludeImages(e.target.checked)}
                  className="mr-2"
                  disabled={isGenerating}
                />
                <span className="text-sm font-medium text-gray-700">Bao gồm hình ảnh</span>
              </label>
            </div>
          </div>

          {isGenerating && (
            <div className="mt-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{generationStatus}</span>
                <span className="text-sm font-medium text-gray-700">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {preview && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium mb-2">Preview:</h3>
              <div className="text-sm text-gray-600">
                <p><strong>Tiêu đề:</strong> {preview.title}</p>
                <p><strong>Mô tả:</strong> {preview.description}</p>
                <p><strong>Số slide:</strong> {preview.slides.length}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              disabled={isGenerating}
            >
              Hủy
            </button>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isGenerating || !topic.trim()}
            >
              {isGenerating ? 'Đang tạo...' : 'Tạo bài thuyết trình'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPresentation;