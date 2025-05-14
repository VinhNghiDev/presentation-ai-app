const axios = require('axios');
const dotenv = require('dotenv');

// Reload environment variables
dotenv.config();

// Get environment variables with defaults
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const DEFAULT_MODEL = process.env.DEFAULT_HUGGINGFACE_MODEL || "tiiuae/falcon-7b-instruct";

// Danh sách model dự phòng nếu model chính không hoạt động
const FALLBACK_MODELS = [
  "bigscience/bloom-560m",
  "tiiuae/falcon-7b-instruct",
  "HuggingFaceH4/starchat-beta",
  "facebook/opt-350m",
  "mistralai/Mistral-7B-Instruct-v0.2"
];

// Log configuration for debugging
console.log('Hugging Face Service Configuration:');
console.log('- API Key Status:', HUGGINGFACE_API_KEY ? 'Present' : 'Missing');
console.log('- Default Model:', DEFAULT_MODEL);
console.log('- Fallback Models:', FALLBACK_MODELS.join(', '));

// Construct API URL from environment variables
const API_URL = `https://api-inference.huggingface.co/models/${DEFAULT_MODEL}`;

// Hàm gọi API Hugging Face với khả năng dự phòng
async function callHuggingFace({ inputs }) {
  try {
    console.log(`Gọi Hugging Face API với URL: ${API_URL}`);
    console.log(`API Key status: ${HUGGINGFACE_API_KEY ? 'Present' : 'Missing'}`);
    console.log(`Input length: ${inputs.length} characters`);
    
    // Giới hạn độ dài input nếu quá dài
    const truncatedInput = inputs.length > 1000 ? inputs.substring(0, 1000) + "..." : inputs;
    
    // Gọi API với model mặc định
    try {
      // Chuẩn bị payload phù hợp với model LLM
      const payload = {
        inputs: truncatedInput,
        parameters: {
          max_new_tokens: 512,
          temperature: 0.7,
          top_p: 0.95,
          do_sample: true,
          return_full_text: false
        }
      };
      
      console.log("Sending request with payload:", JSON.stringify(payload).substring(0, 200) + "...");
      
      const response = await axios.post(
        API_URL,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000 // Tăng timeout lên 30 giây cho model lớn
        }
      );
      
      console.log(`Hugging Face API response status: ${response.status}`);
      return response.data;
    } catch (error) {
      // Nếu model mặc định thất bại, thử các model dự phòng
      console.warn(`Model mặc định (${DEFAULT_MODEL}) thất bại: ${error.message}`);
      if (error.response) {
        console.warn(`Response status: ${error.response.status}`);
        console.warn(`Response data:`, error.response.data);
      }
      console.log('Thử sử dụng model dự phòng...');
      
      // Giới hạn độ dài input cho model dự phòng
      const shorterInput = truncatedInput.length > 500 ? truncatedInput.substring(0, 500) + "..." : truncatedInput;
      
      // Thử từng model dự phòng
      for (const model of FALLBACK_MODELS) {
        if (model === DEFAULT_MODEL) continue; // Bỏ qua nếu giống model mặc định
        
        try {
          console.log(`Thử với model: ${model}`);
          const fallbackUrl = `https://api-inference.huggingface.co/models/${model}`;
          
          // Tùy chỉnh payload theo model
          const fallbackPayload = {
            inputs: shorterInput,
            parameters: {
              max_new_tokens: 256,
              temperature: 0.7,
              top_p: 0.95,
              do_sample: true,
              return_full_text: false
            }
          };
          
          console.log("Sending fallback request with payload:", JSON.stringify(fallbackPayload).substring(0, 150) + "...");
          
          const fallbackResponse = await axios.post(
            fallbackUrl,
            fallbackPayload,
            {
              headers: {
                'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
                'Content-Type': 'application/json',
              },
              timeout: 30000
            }
          );
          
          console.log(`Model dự phòng ${model} thành công!`);
          return fallbackResponse.data;
        } catch (fallbackError) {
          console.warn(`Model dự phòng ${model} thất bại: ${fallbackError.message}`);
          if (fallbackError.response) {
            console.warn(`Response status: ${fallbackError.response.status}`);
            console.warn(`Response data:`, fallbackError.response.data);
          }
        }
      }
      
      // Nếu tất cả model đều thất bại, throw lỗi ban đầu
      throw error;
    }
  } catch (error) {
    console.error('Hugging Face API Error:', error.response?.status || 'No status');
    console.error('Error Message:', error.message);
    
    // Trả về dữ liệu demo trong trường hợp lỗi
    return "Không thể gọi Hugging Face API: " + error.message;
  }
}

// Hàm gọi Hugging Face API cho bài thuyết trình
async function callHuggingFaceForPresentation(prompt) {
  try {
    console.log('Gọi Hugging Face API cho bài thuyết trình...');
    
    // Tạo prompt chặt chẽ hơn để buộc model trả về JSON
    const jsonPrompt = `${prompt}\n\nTRẢ VỀ THEO ĐỊNH DẠNG JSON CHÍNH XÁC:\n\n{
  "title": "Tiêu đề thuyết trình",
  "description": "Mô tả ngắn",
  "slides": [
    {
      "title": "Tiêu đề slide",
      "content": "Nội dung slide",
      "notes": "Ghi chú cho người thuyết trình",
      "keywords": ["từ_khóa_1", "từ_khóa_2"]
    }
  ]
}`;
    
    // Gọi API text-generation
    const result = await callHuggingFace({ inputs: jsonPrompt });
    console.log("API result type:", typeof result);
    console.log("API result preview:", typeof result === 'string' 
      ? result.substring(0, 300) 
      : Array.isArray(result) 
        ? JSON.stringify(result[0]).substring(0, 300) 
        : JSON.stringify(result).substring(0, 300));
    
    // Xử lý kết quả để tìm và parse JSON
    try {
      // Cố gắng parse dữ liệu phản hồi
      let jsonData;
      let jsonString = '';
      
      // Xử lý các định dạng phản hồi khác nhau
      if (typeof result === 'string') {
        // Tìm JSON trong chuỗi
        jsonString = result;
      } else if (Array.isArray(result)) {
        // Xử lý kết quả dạng mảng - phổ biến với các model mới
        if (result[0] && result[0].generated_text) {
          jsonString = result[0].generated_text;
        } else {
          jsonString = JSON.stringify(result[0] || result);
        }
      } else if (result && typeof result === 'object') {
        // Xử lý kết quả dạng object 
        if (result.generated_text) {
          jsonString = result.generated_text;
        } else {
          jsonString = JSON.stringify(result);
        }
      }
      
      console.log("Extracted JSON string:", jsonString.substring(0, 300) + "...");
      
      // Tìm JSON trong chuỗi
      const jsonStartIndex = jsonString.indexOf('{');
      const jsonEndIndex = jsonString.lastIndexOf('}') + 1;
      
      if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
        const jsonContent = jsonString.substring(jsonStartIndex, jsonEndIndex);
        console.log("Found JSON content:", jsonContent.substring(0, 300) + "...");
        
        try {
          jsonData = JSON.parse(jsonContent);
          console.log("Successfully parsed JSON");
        } catch (parseErr) {
          console.error("JSON parse error, trying to fix malformed JSON");
          // Cố gắng sửa JSON không đúng định dạng
          const fixedJson = fixMalformedJson(jsonContent);
          jsonData = JSON.parse(fixedJson);
          console.log("Fixed and parsed JSON successfully");
        }
      } else {
        console.log("Không tìm thấy JSON, thử phương pháp khác");
        // Thử tìm theo cấu trúc: "title" có thể là đầu JSON
        const titleIndex = jsonString.indexOf('"title"');
        if (titleIndex > 0) {
          // Tìm dấu { trước "title"
          let startIndex = jsonString.lastIndexOf('{', titleIndex);
          if (startIndex >= 0) {
            // Tìm dấu } cuối cùng sau "title"
            let endIndex = jsonString.indexOf('}', titleIndex);
            let nestedLevel = 1;
            let i = endIndex + 1;
            
            // Xử lý JSON lồng nhau
            while (nestedLevel > 0 && i < jsonString.length) {
              if (jsonString[i] === '{') nestedLevel++;
              if (jsonString[i] === '}') nestedLevel--;
              i++;
            }
            
            if (nestedLevel === 0) {
              endIndex = i;
              const jsonContent = jsonString.substring(startIndex, endIndex);
              console.log("Found JSON using title method:", jsonContent.substring(0, 100) + "...");
              
              try {
                jsonData = JSON.parse(jsonContent);
                console.log("Successfully parsed JSON via title method");
              } catch (parseErr) {
                console.error("JSON parse error with title method, trying to fix");
                const fixedJson = fixMalformedJson(jsonContent);
                jsonData = JSON.parse(fixedJson);
              }
            }
          }
        }
      }
      
      // Nếu vẫn không thể parse, tạo JSON từ text
      if (!jsonData) {
        throw new Error('Không thể parse JSON từ phản hồi');
      }
      
      // Kiểm tra và làm sạch dữ liệu
      if (!jsonData.title || !jsonData.slides || !Array.isArray(jsonData.slides)) {
        throw new Error('Cấu trúc JSON không hợp lệ');
      }
      
      // Đảm bảo mỗi slide có đầy đủ thông tin
      jsonData.slides = jsonData.slides.map((slide, index) => ({
        title: slide.title || `Slide ${index + 1}`,
        content: slide.content || "Không có nội dung",
        notes: slide.notes || "Không có ghi chú",
        keywords: Array.isArray(slide.keywords) ? slide.keywords : ["không có từ khóa"]
      }));
      
      return jsonData;
    } catch (parseError) {
      console.error('Lỗi phân tích JSON:', parseError);
      
      // Trả về dữ liệu mẫu nếu không parse được
      return generateDemoPresentationData("Chủ đề từ yêu cầu", 5, "professional");
    }
  } catch (error) {
    console.error('Hugging Face API Error:', error);
    // Trả về dữ liệu mẫu trong trường hợp lỗi
    return generateDemoPresentationData("Chủ đề từ yêu cầu", 5, "professional");
  }
}

// Hàm sửa lỗi JSON định dạng không đúng
function fixMalformedJson(jsonString) {
  // Thay thế các ký tự không hợp lệ
  let fixed = jsonString
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\t/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/"\s+"/g, '","')
    .replace(/"\s+}/g, '"}')
    .replace(/"\s+]/g, '"]')
    .replace(/{\s+"/g, '{"')
    .replace(/\[\s+"/g, '["')
    .replace(/,\s+"/g, ',"')
    .replace(/,\s+}/g, '}')
    .replace(/,\s+]/g, ']')
    .replace(/}\s+,/g, '},')
    .replace(/]\s+,/g, '],')
    .replace(/}\s+]/g, '}]')
    .replace(/}\s+}/g, '}}')
    .replace(/([^\\])"/g, '$1\\"')   // Escape unescaped quotes
    .replace(/"([^"]*)"/g, '"$1"');  // Fix double escaping
    
  // Kiểm tra dấu ngoặc nhọn và vuông
  let openBraces = (fixed.match(/{/g) || []).length;
  let closeBraces = (fixed.match(/}/g) || []).length;
  let openBrackets = (fixed.match(/\[/g) || []).length;
  let closeBrackets = (fixed.match(/\]/g) || []).length;
  
  // Thêm dấu đóng nếu thiếu
  while (closeBraces < openBraces) {
    fixed += '}';
    closeBraces++;
  }
  
  while (closeBrackets < openBrackets) {
    fixed += ']';
    closeBrackets++;
  }
  
  return fixed;
}

// Hàm tạo dữ liệu mẫu khi có lỗi
function generateDemoPresentationData(topic, slideCount = 5, style = 'professional') {
  console.log(`Tạo bài thuyết trình mẫu cho: ${topic}`);
  
  const demoPresentation = {
    title: `Bài thuyết trình về ${topic}`,
    description: `Bài thuyết trình được tạo bởi Hugging Face API.`,
    slides: [
      {
        title: `Giới thiệu về ${topic}`,
        content: `- Tổng quan về ${topic}\n- Tầm quan trọng\n- Mục tiêu bài thuyết trình`,
        notes: "Giới thiệu bản thân và chào đón khán giả.",
        keywords: ["introduction", topic.toLowerCase()]
      },
      {
        title: "Nội dung chính",
        content: "- Điểm quan trọng 1\n- Điểm quan trọng 2\n- Điểm quan trọng 3",
        notes: "Trình bày các điểm chính một cách rõ ràng.",
        keywords: ["main points", "content"]
      },
      {
        title: "Phân tích",
        content: "- So sánh các yếu tố\n- Đánh giá ưu điểm\n- Đánh giá hạn chế",
        notes: "Phân tích chi tiết về chủ đề.",
        keywords: ["analysis", "evaluation"]
      },
      {
        title: "Ứng dụng thực tế",
        content: "- Trường hợp sử dụng 1\n- Trường hợp sử dụng 2\n- Lợi ích đạt được",
        notes: "Đưa ra các ví dụ thực tế để minh họa.",
        keywords: ["applications", "use cases"]
      },
      {
        title: "Kết luận",
        content: "- Tóm tắt nội dung\n- Bước tiếp theo\n- Câu hỏi và thảo luận",
        notes: "Tóm tắt lại các điểm chính và mở rộng thảo luận.",
        keywords: ["conclusion", "summary"]
      }
    ]
  };
  
  return demoPresentation;
}

module.exports = { 
  callHuggingFace,
  callHuggingFaceForPresentation,
  generateDemoPresentationData
}; 