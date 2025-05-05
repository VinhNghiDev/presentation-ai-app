// Dịch vụ AI cho tính năng tạo nội dung tự động
import { generatePresentation as generateOpenAIPresentation } from './openaiService';
import { 
  gatherKnowledgeForTopic, 
  generateReferences, 
  generateMarketAnalysis, 
  generateCaseStudyContent,
  generateTrendsContent
} from './knowledgeService';

// Cấu hình API key từ biến môi trường hoặc cấu hình
const SYSTEM_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || '';

/**
 * Tạo bài thuyết trình tự động dựa trên chủ đề và tùy chọn
 * @param {Object} options - Các tùy chọn cho bài thuyết trình
 * @returns {Promise<Object>} - Dữ liệu bài thuyết trình đã tạo
 */
export const generatePresentation = async (options) => {
    console.log("aiService.js: Bắt đầu tạo bài thuyết trình", options);
    const { topic, style, slides, language = 'vi', purpose = 'business', audience = 'general' } = options;
    
    try {
        console.log("aiService.js: Thu thập kiến thức cho chủ đề:", topic);
        // Thu thập kiến thức và dữ liệu liên quan đến chủ đề từ knowledgeService
        const knowledge = gatherKnowledgeForTopic(topic);
        console.log("aiService.js: Đã thu thập kiến thức:", knowledge.domain);
        
        console.log("aiService.js: Sử dụng OpenAI để tạo bài thuyết trình");
        
        // Gửi API key và kiến thức bổ sung tới dịch vụ OpenAI
        const optionsWithKnowledge = {
            ...options,
            apiKey: SYSTEM_API_KEY,
            knowledge: knowledge
        };
        
        // Gọi OpenAI API với kiến thức đã thu thập
        console.log("aiService.js: Đang gọi OpenAI API...");
        const presentationData = await generateOpenAIPresentation(optionsWithKnowledge, SYSTEM_API_KEY);
        console.log("aiService.js: Đã nhận được phản hồi từ OpenAI", presentationData?.slides?.length || 0, "slides");
        
        // Kiểm tra dữ liệu trả về để đảm bảo rằng slides là một mảng
        if (!presentationData || !presentationData.slides) {
            console.warn("aiService.js: Dữ liệu trả về không có thuộc tính slides");
            return createFallbackPresentation(options, knowledge);
        }
        
        if (!Array.isArray(presentationData.slides)) {
            console.warn("aiService.js: presentationData.slides không phải là mảng:", typeof presentationData.slides);
            return createFallbackPresentation(options, knowledge);
        }
        
        // Tăng cường nội dung cho các slide đặc biệt (market analysis, case studies, trends)
        const enhancedSlides = enhanceSpecializedSlides(presentationData.slides, topic, knowledge);
        
        // Đảm bảo có slide tài liệu tham khảo ở cuối
        ensureReferencesSlide(enhancedSlides, topic, knowledge);
        
        // Đảm bảo dữ liệu trả về có định dạng đúng và slides là một mảng
        return {
            title: presentationData.title || topic,
            description: presentationData.description || `Bài thuyết trình chuyên sâu về ${topic}`,
            slides: enhancedSlides
        };
    } catch (error) {
        console.error("aiService.js: Lỗi khi tạo bài thuyết trình:", error);
        
        // Khi có lỗi, tạo ra dữ liệu mẫu với cấu trúc đúng thay vì ném lỗi
        console.log("aiService.js: Tạo dữ liệu mẫu thay thế");
        const knowledge = gatherKnowledgeForTopic(topic);
        return createFallbackPresentation(options, knowledge);
    }
};

/**
 * Tạo bài thuyết trình mẫu khi không có API key hoặc OpenAI API bị lỗi
 * @param {Object} options - Các tùy chọn cho bài thuyết trình
 * @param {Object} knowledge - Kiến thức thu thập được về chủ đề (nếu có)
 * @returns {Object} - Dữ liệu bài thuyết trình mẫu
 */
function createFallbackPresentation(options, knowledge = null) {
    const { topic, style, slides = 5, language = 'vi' } = options;
    
    // Thu thập kiến thức nếu chưa có
    const topicKnowledge = knowledge || gatherKnowledgeForTopic(topic);
    
    // Tạo tiêu đề bài thuyết trình
    const title = `${topic.charAt(0).toUpperCase() + topic.slice(1)}`;
    
    // Tạo mảng slide
    const presentationSlides = [];
    
    // Slide đầu tiên (trang bìa)
    presentationSlides.push({
      title: title,
      content: `Bài thuyết trình chuyên sâu về ${topic}`,
      notes: `Giới thiệu bản thân và mục tiêu của bài thuyết trình về ${topic}`,
      keywords: [topic, 'presentation', 'intro'],
      slideType: 'cover'
    });
    
    // Slide thứ hai (giới thiệu)
    presentationSlides.push({
      title: "Giới thiệu",
      content: `- Tổng quan về ${topic}\n- Tầm quan trọng trong bối cảnh hiện tại\n- Mục tiêu của bài thuyết trình\n- Những giá trị đạt được sau bài thuyết trình`,
      notes: "Giải thích ngắn gọn về chủ đề và lý do tại sao nó quan trọng",
      keywords: ["overview", topic, "introduction"],
      slideType: 'introduction'
    });
    
    // Slide mục lục
    presentationSlides.push({
      title: "Nội dung trình bày",
      content: createTableOfContents(topic, slides, topicKnowledge),
      notes: "Giới thiệu tổng quan cấu trúc bài thuyết trình để người nghe nắm được nội dung sắp được trình bày.",
      keywords: ["contents", "outline", "agenda"],
      slideType: 'outline'
    });
    
    // Các slide nội dung chính
    for (let i = 4; i <= slides - 3; i++) {
      // Xác định loại slide dựa trên vị trí
      let slideType = 'content';
      if (i === 4) slideType = 'background';
      else if (i === 5) slideType = 'analysis';
      else if (i === 6) slideType = 'statistics';
      else if (i === 7) slideType = 'caseStudy';
      else if (i === slides - 4) slideType = 'trends';
      else if (i === slides - 3) slideType = 'challenges';
      
      const slideTitle = getSpecializedSlideTitle(topic, i-3, slideType);
      const slideContent = getSpecializedSlideContent(topic, i-3, slideType, topicKnowledge);
      
      presentationSlides.push({
        title: slideTitle,
        content: slideContent,
        notes: `Trình bày về ${slideTitle}. Nhấn mạnh các điểm chính và kết nối với chủ đề tổng thể.`,
        keywords: getKeywordsForSlideType(topic, slideType),
        slideType: slideType
      });
    }
    
    // Slide kết luận
    presentationSlides.push({
      title: "Kết luận",
      content: `- Tóm tắt các điểm chính đã trình bày\n- Giá trị và ý nghĩa của ${topic}\n- Các bước tiếp theo\n- Cảm ơn và mở phần Q&A`,
      notes: "Tóm tắt những gì đã trình bày và mở phần hỏi đáp",
      keywords: ["conclusion", "summary", topic],
      slideType: 'conclusion'
    });
    
    // Slide tài liệu tham khảo
    presentationSlides.push({
      title: "Tài liệu tham khảo",
      content: generateReferences(topic),
      notes: "Cung cấp thông tin về nguồn dữ liệu và các báo cáo đã tham khảo.",
      keywords: ["references", "sources", "bibliography"],
      slideType: 'references'
    });
    
    // Trả về dữ liệu bài thuyết trình hoàn chỉnh
    return {
      title: title,
      description: `Bài thuyết trình chuyên sâu về ${topic}`,
      slides: presentationSlides
    };
}

/**
 * Tạo mục lục cho bài thuyết trình
 * @param {string} topic - Chủ đề bài thuyết trình
 * @param {number} totalSlides - Tổng số slide
 * @param {Object} knowledge - Kiến thức thu thập được
 * @returns {string} - Nội dung mục lục
 */
function createTableOfContents(topic, totalSlides, knowledge) {
    let toc = "Phần 1: Giới thiệu và tổng quan\n";
    toc += `Phần 2: Phân tích ${topic}\n`;
    toc += `Phần 3: Số liệu và thống kê thị trường\n`;
    toc += `Phần 4: Nghiên cứu trường hợp điển hình\n`;
    
    // Thêm các mục tùy thuộc vào lĩnh vực
    if (knowledge && knowledge.domain) {
        switch (knowledge.domain) {
            case 'technology':
                toc += `Phần 5: Xu hướng công nghệ và phát triển\n`;
                toc += `Phần 6: Thách thức và giải pháp kỹ thuật\n`;
                break;
            case 'business':
                toc += `Phần 5: Chiến lược kinh doanh và mô hình\n`;
                toc += `Phần 6: Thách thức thị trường và cơ hội\n`;
                break;
            case 'marketing':
                toc += `Phần 5: Chiến lược và kênh marketing\n`;
                toc += `Phần 6: Phân tích ROI và KPI\n`;
                break;
            default:
                toc += `Phần 5: Xu hướng và triển vọng tương lai\n`;
                toc += `Phần 6: Thách thức và cơ hội\n`;
        }
    } else {
        toc += `Phần 5: Xu hướng và triển vọng tương lai\n`;
        toc += `Phần 6: Thách thức và cơ hội\n`;
    }
    
    toc += `Phần 7: Kết luận và bước tiếp theo\n`;
    toc += `Phần 8: Tài liệu tham khảo`;
    
    return toc;
}

/**
 * Tạo tiêu đề cho slide dựa trên loại slide
 * @param {string} topic - Chủ đề bài thuyết trình
 * @param {number} index - Chỉ số của slide
 * @param {string} slideType - Loại slide
 * @returns {string} - Tiêu đề slide
 */
function getSpecializedSlideTitle(topic, index, slideType) {
    switch (slideType) {
        case 'background':
            return `Tổng quan về ${topic}`;
        case 'analysis':
            return `Phân tích chuyên sâu: ${topic}`;
        case 'statistics':
            return `Số liệu thống kê & Thị trường`;
        case 'caseStudy':
            return `Nghiên cứu trường hợp điển hình`;
        case 'trends':
            return `Xu hướng và triển vọng trong ${topic}`;
        case 'challenges':
            return `Thách thức và Giải pháp`;
        default:
            return `Phần ${index}: ${getContentTitle(topic, index)}`;
    }
}

/**
 * Tạo nội dung cho slide dựa trên loại slide và kiến thức thu thập được
 * @param {string} topic - Chủ đề bài thuyết trình
 * @param {number} index - Chỉ số của slide
 * @param {string} slideType - Loại slide
 * @param {Object} knowledge - Kiến thức thu thập được
 * @returns {string} - Nội dung slide
 */
function getSpecializedSlideContent(topic, index, slideType, knowledge) {
    switch (slideType) {
        case 'background':
            return `- Định nghĩa và phạm vi của ${topic}\n- Lịch sử phát triển và các mốc quan trọng\n- Tầm quan trọng trong bối cảnh hiện tại\n- Các khái niệm cơ bản và thuật ngữ chuyên ngành`;
        
        case 'analysis':
            return `- Phân tích SWOT về ${topic}\n- Các yếu tố then chốt quyết định thành công\n- So sánh với các giải pháp/phương pháp thay thế\n- Đánh giá tác động đến các bên liên quan`;
        
        case 'statistics':
            if (knowledge && knowledge.statistics) {
                return generateMarketAnalysis(topic);
            }
            return `- Quy mô thị trường hiện tại và dự báo tăng trưởng\n- Phân tích thị phần và đối thủ cạnh tranh\n- Tỷ lệ chấp nhận và áp dụng công nghệ/giải pháp\n- ROI và các chỉ số đánh giá hiệu quả`;
        
        case 'caseStudy':
            if (knowledge && knowledge.caseStudies) {
                return generateCaseStudyContent(topic);
            }
            return `- Case Study 1: Thách thức, giải pháp và kết quả\n- Case Study 2: Bài học kinh nghiệm\n- So sánh và phân tích các yếu tố thành công\n- Các kết luận và áp dụng thực tế`;
        
        case 'trends':
            if (knowledge && knowledge.trends) {
                return generateTrendsContent(topic);
            }
            return `- Xu hướng chính trong lĩnh vực ${topic}\n- Dự báo phát triển trong 5 năm tới\n- Tác động của công nghệ mới\n- Cơ hội và thách thức trong tương lai`;
        
        case 'challenges':
            return `- Các thách thức chính hiện tại\n- Giải pháp và phương pháp tiếp cận\n- Kế hoạch hành động cụ thể\n- Các yếu tố cần cân nhắc khi triển khai`;
        
        default:
            return getContentForSlide(topic, index);
    }
}

/**
 * Tạo từ khóa cho slide dựa trên loại slide
 * @param {string} topic - Chủ đề bài thuyết trình
 * @param {string} slideType - Loại slide
 * @returns {Array} - Mảng từ khóa
 */
function getKeywordsForSlideType(topic, slideType) {
    const baseKeywords = [topic];
    
    switch (slideType) {
        case 'background':
            return [...baseKeywords, "overview", "introduction", "concept", "history"];
        case 'analysis':
            return [...baseKeywords, "analysis", "SWOT", "comparison", "evaluation"];
        case 'statistics':
            return [...baseKeywords, "statistics", "market data", "metrics", "figures"];
        case 'caseStudy':
            return [...baseKeywords, "case study", "example", "success story", "implementation"];
        case 'trends':
            return [...baseKeywords, "trends", "future", "forecast", "innovation"];
        case 'challenges':
            return [...baseKeywords, "challenges", "solutions", "obstacles", "strategies"];
        default:
            return getKeywordsForSlide(topic, Math.floor(Math.random() * 5));
    }
}

/**
 * Tạo tiêu đề nội dung dựa trên chủ đề và số thứ tự
 * @param {string} topic - Chủ đề
 * @param {number} index - Số thứ tự
 * @returns {string} - Tiêu đề nội dung
 */
function getContentTitle(topic, index) {
  const titles = [
    "Tổng quan",
    "Lợi ích chính",
    "Các yếu tố cần thiết",
    "Phương pháp tiếp cận",
    "Ứng dụng thực tế",
    "Xu hướng mới nhất",
    "Thách thức và giải pháp",
    "Nghiên cứu trường hợp",
    "So sánh và đánh giá",
    "Triển vọng tương lai"
  ];
  
  return titles[index % titles.length];
}

/**
 * Tạo nội dung cho slide dựa trên chủ đề và số thứ tự
 * @param {string} topic - Chủ đề
 * @param {number} index - Số thứ tự
 * @returns {string} - Nội dung slide
 */
function getContentForSlide(topic, index) {
  switch (index % 5) {
    case 0:
      return `- Định nghĩa và phạm vi của ${topic}\n- Lịch sử phát triển và các mốc quan trọng\n- Tầm quan trọng trong bối cảnh hiện tại\n- Các khái niệm cơ bản và thuật ngữ chuyên ngành`;
    case 1:
      return `- Lợi ích chính của ${topic}\n- Tác động tích cực đến hiệu suất và kết quả\n- ROI và giá trị kinh tế\n- Các nghiên cứu và số liệu minh chứng`;
    case 2:
      return `- Các thành phần chính và yếu tố cốt lõi\n- Mối quan hệ giữa các thành phần\n- Các yếu tố then chốt quyết định thành công\n- Tiêu chí đánh giá hiệu quả`;
    case 3:
      return `- Chiến lược triển khai ${topic}\n- Quy trình và phương pháp thực hiện\n- Công cụ và kỹ thuật hỗ trợ\n- Best practices và bài học kinh nghiệm`;
    case 4:
      return `- Ví dụ thực tế về triển khai ${topic}\n- Kết quả và tác động đo lường được\n- Phân tích thành công và thất bại\n- Hướng phát triển và cải tiến`;
    default:
      return `- Thông tin chuyên sâu về ${topic}\n- Phân tích và đánh giá\n- Đề xuất và khuyến nghị\n- Tài liệu tham khảo thêm`;
  }
}

/**
 * Tạo từ khóa cho slide dựa trên chủ đề và số thứ tự
 * @param {string} topic - Chủ đề
 * @param {number} index - Số thứ tự
 * @returns {Array} - Mảng từ khóa
 */
function getKeywordsForSlide(topic, index) {
  const baseKeywords = [topic];
  
  switch (index % 5) {
    case 0:
      return [...baseKeywords, "overview", "introduction", "concept", "definition"];
    case 1:
      return [...baseKeywords, "benefits", "advantages", "ROI", "value"];
    case 2:
      return [...baseKeywords, "elements", "components", "structure", "framework"];
    case 3:
      return [...baseKeywords, "methods", "approach", "implementation", "process"];
    case 4:
      return [...baseKeywords, "examples", "case study", "results", "impact"];
    default:
      return [...baseKeywords, "information", "analysis", "insights", "recommendations"];
  }
}

/**
 * Tạo bài thuyết trình mẫu khi không có API key hoặc OpenAI API bị lỗi
 */
function createMinimalPresentation(topic, style, slides) {
    const minimalSlides = [];
    
    // Slide tiêu đề
    minimalSlides.push({
        id: Date.now(),
        title: topic,
        content: "Bài thuyết trình",
        elements: [
            {
                id: 'element-minimal-title',
                type: 'text',
                content: topic,
                position: { x: 100, y: 150 },
                size: { width: 600, height: 80 },
                style: { fontWeight: 'bold', fontSize: '32px', textAlign: 'center' }
            }
        ],
        template: style || 'default'
    });
    
    // Slide nội dung
    minimalSlides.push({
        id: Date.now() + 1,
        title: "Nội dung",
        content: "Nội dung bài thuyết trình",
        elements: [
            {
                id: 'element-minimal-content',
                type: 'text',
                content: `Nội dung về ${topic}`,
                position: { x: 100, y: 150 },
                size: { width: 600, height: 200 }
            }
        ],
        template: style || 'default'
    });
    
    return minimalSlides;
}

/**
 * Tăng cường nội dung cho các slide đặc biệt
 * @param {Array} slides - Mảng các slide cần tăng cường
 * @param {string} topic - Chủ đề bài thuyết trình
 * @param {Object} knowledge - Kiến thức thu thập được
 * @returns {Array} - Mảng các slide đã được tăng cường
 */
function enhanceSpecializedSlides(slides, topic, knowledge) {
    return slides.map(slide => {
        const slideType = slide.slideType || '';
        
        // Tăng cường nội dung cho các slide thống kê
        if (slideType === 'statistics' || slide.title.toLowerCase().includes('thống kê') || slide.title.toLowerCase().includes('số liệu')) {
            slide.content = generateMarketAnalysis(topic);
        }
        
        // Tăng cường nội dung cho các slide case study
        if (slideType === 'caseStudy' || slide.title.toLowerCase().includes('nghiên cứu') || slide.title.toLowerCase().includes('case study')) {
            slide.content = generateCaseStudyContent(topic);
        }
        
        // Tăng cường nội dung cho các slide xu hướng
        if (slideType === 'trends' || slide.title.toLowerCase().includes('xu hướng') || slide.title.toLowerCase().includes('trend')) {
            slide.content = generateTrendsContent(topic);
        }
        
        return slide;
    });
}

/**
 * Đảm bảo có slide tài liệu tham khảo trong bài thuyết trình
 * @param {Array} slides - Mảng các slide
 * @param {string} topic - Chủ đề bài thuyết trình
 * @param {Object} knowledge - Kiến thức thu thập được
 */
function ensureReferencesSlide(slides, topic, knowledge) {
    // Kiểm tra xem đã có slide tài liệu tham khảo chưa
    const hasReferencesSlide = slides.some(slide => 
        slide.slideType === 'references' || 
        slide.title.toLowerCase().includes('tài liệu') || 
        slide.title.toLowerCase().includes('references')
    );
    
    // Nếu chưa có, thêm vào cuối
    if (!hasReferencesSlide) {
        slides.push({
            title: "Tài liệu tham khảo",
            content: generateReferences(topic),
            notes: "Cung cấp thông tin về nguồn dữ liệu và các báo cáo đã tham khảo.",
            keywords: ["references", "sources", "bibliography"],
            slideType: 'references'
        });
    }
}

// Các hàm hỗ trợ
function getSubtitle(purpose) {
    switch (purpose) {
        case 'education': return 'Tài liệu giáo dục';
        case 'marketing': return 'Chiến lược marketing';
        case 'academic': return 'Báo cáo học thuật';
        case 'personal': return 'Thuyết trình cá nhân';
        default: return 'Thuyết trình doanh nghiệp';
    }
}

function generateTableOfContents(topic, contentSlides) {
    let toc = "";
    for (let i = 1; i <= contentSlides; i++) {
        toc += `${i}. ${generateSlideTitle(topic, i)}\n`;
    }
    toc += `${contentSlides + 1}. Kết luận`;
    return toc;
}

function shouldIncludeChart(topic, index) {
    // Xác định một số slide sẽ có biểu đồ (ví dụ: các slide số 4, 7...)
    return index % 3 === 0;
}

function getRandomChartType() {
    const types = ['bar', 'line', 'pie'];
    return types[Math.floor(Math.random() * types.length)];
}

function generateSlideTitle(topic, index) {
    const titleTemplates = [
        `Tổng quan về ${topic}`,
        `Lịch sử phát triển của ${topic}`,
        `Các thách thức với ${topic}`,
        `${topic} trong bối cảnh hiện tại`,
        `Xu hướng phát triển của ${topic}`,
        `Giải pháp cho ${topic}`,
        `Nghiên cứu mới về ${topic}`,
        `Ứng dụng của ${topic}`,
        `${topic} và tương lai`,
        `Phân tích dữ liệu về ${topic}`
    ];
    
    // Đảm bảo luôn lấy được một tiêu đề trong mảng
    return titleTemplates[(index - 1) % titleTemplates.length];
}

function generateSlideContent(topic, index) {
    const contents = [
        `${topic} là một chủ đề quan trọng trong bối cảnh hiện nay. Có nhiều yếu tố cần cân nhắc khi nghiên cứu về chủ đề này:\n• Yếu tố con người\n• Yếu tố công nghệ\n• Yếu tố thị trường`,
        
        `Khi phân tích ${topic}, chúng ta cần xem xét lịch sử phát triển qua các giai đoạn:\n• Giai đoạn hình thành\n• Giai đoạn phát triển\n• Giai đoạn hiện tại`,
        
        `Các nghiên cứu gần đây về ${topic} đã chỉ ra những xu hướng mới:\n• Xu hướng 1: Ứng dụng công nghệ AI\n• Xu hướng 2: Phát triển bền vững\n• Xu hướng 3: Tối ưu hóa quy trình`,
        
        `Để thành công với ${topic}, các doanh nghiệp cần có chiến lược rõ ràng bao gồm:\n• Xây dựng tầm nhìn dài hạn\n• Áp dụng giải pháp sáng tạo\n• Đầu tư vào nghiên cứu và phát triển`,
        
        `Tương lai của ${topic} sẽ phụ thuộc vào các yếu tố sau:\n• Đổi mới công nghệ\n• Thay đổi nhu cầu thị trường\n• Chính sách và quy định mới\n• Sự phát triển của các ngành liên quan`
    ];
    
    return contents[(index - 1) % contents.length];
}

function generateSpeakerNotes(title, content) {
    return `Trong phần này, hãy giải thích chi tiết về ${title} và nhấn mạnh tầm quan trọng của các điểm trong slide. Đề cập đến ví dụ thực tế để minh họa.`;
}

function generateConclusion(topic) {
    return `Tóm lại, ${topic} đóng vai trò quan trọng trong bối cảnh hiện tại. Chúng ta đã tìm hiểu về:\n\n• Các khía cạnh chính của chủ đề\n• Thách thức và cơ hội hiện tại\n• Xu hướng phát triển trong tương lai\n\nViệc tiếp tục nghiên cứu và ứng dụng sẽ mang lại nhiều giá trị cho tổ chức và cá nhân.`;
}

/**
 * Tạo bài thuyết trình mẫu khi không có API key hoặc OpenAI API bị lỗi
 */
function createSamplePresentation(topic, style, slides, language, purpose, audience, includeCharts, includeImages) {
    console.log("aiService.js: Bắt đầu tạo bài thuyết trình mẫu", {
        topic, style, slides, language, purpose, audience, includeCharts, includeImages
    });
    
    // Giả lập thời gian xử lý
    return new Promise(async (resolve) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Tạo các slide mẫu dựa trên chủ đề
        const generatedSlides = [];
        
        // Slide giới thiệu
        generatedSlides.push({
            id: Date.now(),
            title: topic,
            content: `Giới thiệu về ${topic}`,
            elements: [
                {
                    id: 'element-title-1',
                    type: 'text',
                    content: topic,
                    position: { x: 100, y: 50 },
                    size: { width: 600, height: 80 },
                    style: { fontWeight: 'bold', fontSize: '32px', textAlign: 'center' }
                },
                {
                    id: 'element-subtitle-1',
                    type: 'text',
                    content: getSubtitle(purpose),
                    position: { x: 100, y: 150 },
                    size: { width: 600, height: 50 },
                    style: { fontSize: '18px', textAlign: 'center', fontStyle: 'italic' }
                }
            ],
            notes: `Bài thuyết trình về ${topic}. Giới thiệu bản thân và mục tiêu của bài thuyết trình.`,
            template: style || 'default'
        });
        
        // Thêm hình ảnh nếu được yêu cầu
        if (includeImages) {
            generatedSlides[0].elements.push({
                id: 'element-image-1',
                type: 'image',
                content: `https://placehold.co/600x300?text=${encodeURIComponent(topic)}`,
                imageKeywords: [topic],
                position: { x: 200, y: 220 },
                size: { width: 400, height: 250 }
            });
        }
        
        // Slide mục lục
        generatedSlides.push({
            id: Date.now() + 1,
            title: "Mục lục",
            content: "Các nội dung chính",
            elements: [
                {
                    id: 'element-title-2',
                    type: 'text',
                    content: "Mục lục",
                    position: { x: 100, y: 50 },
                    size: { width: 600, height: 50 },
                    style: { fontWeight: 'bold', fontSize: '24px' }
                },
                {
                    id: 'element-content-2',
                    type: 'text',
                    content: generateTableOfContents(topic, slides - 3),
                    position: { x: 100, y: 120 },
                    size: { width: 600, height: 300 }
                }
            ],
            notes: "Giới thiệu các phần chính của bài thuyết trình để người nghe nắm được cấu trúc.",
            template: style || 'default'
        });
        
        // Các slide nội dung
        for (let i = 3; i <= slides - 1; i++) {
            const slideTitle = generateSlideTitle(topic, i - 2);
            const slideContent = generateSlideContent(topic, i - 2);
            const hasChart = includeCharts && shouldIncludeChart(topic, i);
            
            const elements = [
                {
                    id: `element-title-${i}`,
                    type: 'text',
                    content: slideTitle,
                    position: { x: 100, y: 50 },
                    size: { width: 600, height: 50 },
                    style: { fontWeight: 'bold', fontSize: '24px' }
                },
                {
                    id: `element-content-${i}`,
                    type: 'text',
                    content: slideContent,
                    position: { x: 100, y: 120 },
                    size: { width: 400, height: 200 }
                }
            ];
            
            // Thêm hình ảnh hoặc biểu đồ
            if (hasChart) {
                elements.push({
                    id: `element-chart-${i}`,
                    type: 'chart',
                    chartType: getRandomChartType(),
                    title: `Dữ liệu về ${topic}`,
                    labels: 'Mục 1, Mục 2, Mục 3, Mục 4',
                    values: '25, 40, 20, 35',
                    position: { x: 500, y: 150 },
                    size: { width: 300, height: 250 }
                });
            } else if (includeImages) {
                elements.push({
                    id: `element-image-${i}`,
                    type: 'image',
                    content: `https://placehold.co/300x200?text=${encodeURIComponent(slideTitle)}`,
                    imageKeywords: [topic, slideTitle],
                    position: { x: 520, y: 150 },
                    size: { width: 250, height: 180 }
                });
            }
            
            generatedSlides.push({
                id: Date.now() + i,
                title: slideTitle,
                content: slideContent,
                elements: elements,
                notes: `Slide ${i-2}: ${slideTitle}. ${generateSpeakerNotes(slideTitle, slideContent)}`,
                template: style || 'default'
            });
        }
        
        // Slide kết luận
        generatedSlides.push({
            id: Date.now() + slides,
            title: 'Kết luận',
            content: `Tóm tắt về ${topic}`,
            elements: [
                {
                    id: `element-conclusion-title`,
                    type: 'text',
                    content: 'Kết luận',
                    position: { x: 100, y: 50 },
                    size: { width: 600, height: 50 },
                    style: { fontWeight: 'bold', fontSize: '24px' }
                },
                {
                    id: `element-summary`,
                    type: 'text',
                    content: generateConclusion(topic),
                    position: { x: 100, y: 120 },
                    size: { width: 600, height: 200 }
                },
                {
                    id: `element-thank-you`,
                    type: 'text',
                    content: 'Cảm ơn quý vị đã lắng nghe!',
                    position: { x: 100, y: 350 },
                    size: { width: 600, height: 50 },
                    style: { fontWeight: 'bold', fontSize: '20px', textAlign: 'center' }
                }
            ],
            notes: "Tóm tắt lại các điểm chính và kết thúc bài thuyết trình.",
            template: style || 'default'
        });
        
        console.log("aiService.js: Đã tạo bài thuyết trình mẫu với", generatedSlides.length, "slides");
        resolve(generatedSlides);
    });
}