import React, { useState, useEffect } from 'react';
import { generateCompletion, generateChatCompletion } from '../services/multiAiService';
import { AI_PROVIDERS, AI_CONFIG } from '../services/aiConfig';

/**
 * Component ví dụ để minh họa cách sử dụng multiAiService
 * Cho phép người dùng chọn nền tảng AI, model, và gửi prompt để nhận phản hồi
 */
function MultiAiServiceExample() {
  // State cho form
  const [provider, setProvider] = useState(AI_CONFIG.defaultProvider);
  const [model, setModel] = useState('');
  const [prompt, setPrompt] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('Bạn là trợ lý AI hữu ích, cung cấp thông tin chính xác và đầy đủ.');
  const [temperature, setTemperature] = useState(0.7);
  
  // State cho kết quả
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Lấy danh sách models dựa trên provider đã chọn
  const getModelsForProvider = (providerKey) => {
    if (!AI_PROVIDERS[providerKey]) return [];
    return Object.entries(AI_PROVIDERS[providerKey].models).map(([key, value]) => ({
      id: value,
      name: key.replace(/_/g, ' ') // Chuyển GPT_4 thành "GPT 4"
    }));
  };
  
  const models = getModelsForProvider(provider);
  
  // Cập nhật model mặc định khi thay đổi provider
  useEffect(() => {
    if (models.length > 0) {
      setModel(models[0].id);
    } else {
      setModel('');
    }
  }, [provider]);
  
  // Gửi prompt tới AI
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Vui lòng nhập prompt');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setResponse('');
    
    try {
      // Sử dụng hàm generateCompletion từ multiAiService
      const result = await generateCompletion(prompt, {
        systemPrompt,
        model,
        temperature: parseFloat(temperature),
        provider
      });
      
      setResponse(result);
    } catch (err) {
      setError(`Lỗi: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sử dụng Chat API với lịch sử hội thoại
  const handleChatExample = async () => {
    setIsLoading(true);
    setError('');
    setResponse('');
    
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Xin chào, bạn có thể giới thiệu về bản thân không?' },
      { role: 'assistant', content: 'Xin chào! Tôi là một trợ lý AI được thiết kế để hỗ trợ bạn với nhiều loại thông tin và nhiệm vụ khác nhau. Tôi có thể trả lời câu hỏi, cung cấp thông tin, giúp viết nội dung, và nhiều việc khác nữa. Bạn cần tôi giúp gì hôm nay?' },
      { role: 'user', content: prompt || 'Bạn có thể giúp tôi tạo một bài thuyết trình về công nghệ AI không?' }
    ];
    
    try {
      // Sử dụng hàm generateChatCompletion từ multiAiService
      const result = await generateChatCompletion(messages, {
        model,
        temperature: parseFloat(temperature),
        provider
      });
      
      setResponse(result);
    } catch (err) {
      setError(`Lỗi: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Ví dụ Sử dụng Đa Nền Tảng AI</h1>
      
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Tùy chọn AI</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="provider" className="form-label">Nền tảng AI</label>
                  <select 
                    id="provider" 
                    className="form-select"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                  >
                    {Object.entries(AI_PROVIDERS).map(([key, value]) => (
                      <option key={key} value={key}>{value.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="model" className="form-label">Model</label>
                  <select 
                    id="model" 
                    className="form-select"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  >
                    {models.map((model) => (
                      <option key={model.id} value={model.id}>{model.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="systemPrompt" className="form-label">System Prompt</label>
              <textarea
                id="systemPrompt"
                className="form-control"
                rows="2"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Hướng dẫn cho AI về vai trò và cách trả lời"
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="prompt" className="form-label">Prompt của bạn</label>
              <textarea
                id="prompt"
                className="form-control"
                rows="3"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Nhập prompt hoặc câu hỏi của bạn ở đây"
                required
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="temperature" className="form-label">
                Temperature: {temperature}
              </label>
              <input
                type="range"
                className="form-range"
                id="temperature"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
              />
              <div className="d-flex justify-content-between">
                <small>Chính xác hơn</small>
                <small>Sáng tạo hơn</small>
              </div>
            </div>
            
            <div className="d-flex gap-2">
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isLoading}
              >
                {isLoading ? 'Đang xử lý...' : 'Gửi Prompt'}
              </button>
              
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleChatExample}
                disabled={isLoading}
              >
                Chat với Lịch sử
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Phản hồi từ AI</h5>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}
          
          {isLoading ? (
            <div className="text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Đang chờ phản hồi từ {AI_PROVIDERS[provider]?.name || provider}...</p>
            </div>
          ) : response ? (
            <div className="response-container">
              <pre className="response-text bg-light p-3 rounded">
                {response}
              </pre>
            </div>
          ) : (
            <p className="text-muted">Phản hồi sẽ xuất hiện ở đây</p>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <h5>Hướng dẫn sử dụng:</h5>
        <ol>
          <li>Chọn nền tảng AI (OpenAI, Claude, Gemini)</li>
          <li>Chọn model phù hợp với nền tảng đã chọn</li>
          <li>Điều chỉnh system prompt nếu cần</li>
          <li>Nhập prompt của bạn</li>
          <li>Điều chỉnh temperature (0.0 - 1.0)</li>
          <li>Nhấn "Gửi Prompt" hoặc "Chat với Lịch sử"</li>
        </ol>
      </div>
    </div>
  );
}

export default MultiAiServiceExample; 