// Dịch vụ AI cho tính năng tạo nội dung tự động
import { generateCompletion, generateChatCompletion, callAiApi } from './multiAiService';
import { 
  AI_CONFIG, 
  AI_PROVIDERS, 
  getDefaultModel, 
  getFallbackModel,
  hasValidApiKey
} from './aiConfig';
import { 
  gatherKnowledgeForTopic, 
  generateReferences, 
  generateMarketAnalysis, 
  generateCaseStudyContent,
  generateTrendsContent
} from './knowledgeService';

/**
 * Tạo bài thuyết trình tự động dựa trên chủ đề và tùy chọn
 * @param {Object} options - Các tùy chọn cho bài thuyết trình
 * @returns {Promise<Object>} - Dữ liệu bài thuyết trình đã tạo
 */
export const generatePresentation = async (options) => {
    console.log("aiService.js: Bắt đầu tạo bài thuyết trình", options);
    const { 
      topic, 
      style, 
      slides, 
      language = 'vi', 
      purpose = 'business', 
      audience = 'general',
      provider = AI_CONFIG.defaultProvider 
    } = options;
    
    try {
        console.log("aiService.js: Thu thập kiến thức cho chủ đề:", topic);
        // Thu thập kiến thức và dữ liệu liên quan đến chủ đề từ knowledgeService
        const knowledge = gatherKnowledgeForTopic(topic);
        console.log("aiService.js: Đã thu thập kiến thức:", knowledge.domain);
        
        // Tạo prompt cho AI để tạo bài thuyết trình
        const prompt = createPresentationPrompt({
          ...options,
          knowledge
        });
        
        // Cấu hình system message
        const systemMessage = `Bạn là trợ lý AI chuyên tạo nội dung bài thuyết trình chuyên nghiệp, chất lượng cao. 
Bạn có kiến thức sâu rộng về nhiều lĩnh vực và hiểu rõ nguyên tắc thiết kế bài thuyết trình hiệu quả. 
Bạn tạo nội dung phân tích sâu, sử dụng dữ liệu thực tế, case studies, và xu hướng hiện tại. 
Luôn trả về JSON theo định dạng yêu cầu, không thêm bất kỳ văn bản giải thích nào trước hoặc sau JSON.`;
        
        // Xác định model dựa trên provider
        const model = options.model || getDefaultModel(provider);
        
        // Sử dụng multiAiService để gọi AI API
        console.log(`aiService.js: Gọi AI API (${provider}, model: ${model})...`);
        
        // Chuẩn bị messages cho API
        const messages = [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ];
        
        // Gọi AI API qua multiAiService
        const aiResponse = await generateChatCompletion(messages, {
          model,
          temperature: 0.7,
          maxTokens: 4000,
          provider
        });
        
        console.log("aiService.js: Đã nhận được phản hồi từ AI");
        
        // Phân tích JSON từ phản hồi
        let presentationData;
        try {
            // Phân tích cú pháp JSON từ phản hồi
            const jsonStartIndex = aiResponse.indexOf('{');
            const jsonEndIndex = aiResponse.lastIndexOf('}') + 1;
            
            if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
                const jsonContent = aiResponse.substring(jsonStartIndex, jsonEndIndex);
                try {
                    presentationData = JSON.parse(jsonContent);
                } catch (parseError) {
                    console.error("aiService.js: Lỗi phân tích JSON:", parseError);
                    console.log("aiService.js: JSON không hợp lệ, sử dụng dữ liệu mẫu");
                    return createFallbackPresentation(options, knowledge);
                }
            } else {
                console.warn("aiService.js: Không tìm thấy JSON trong phản hồi");
                console.log("aiService.js: Phản hồi nhận được:", aiResponse);
                return createFallbackPresentation(options, knowledge);
            }
        } catch (jsonError) {
            console.error("aiService.js: Lỗi phân tích JSON:", jsonError);
            return createFallbackPresentation(options, knowledge);
        }
        
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
            slides: enhancedSlides,
            metadata: {
                created: new Date().toISOString(),
                provider,
                model,
                topic,
                slides: slides || enhancedSlides.length
            }
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
 * Nâng cao nội dung slide
 * @param {string} content - Nội dung slide cần nâng cao
 * @param {string} type - Loại nâng cao (improve, concise, elaborate, professional, creative)
 * @param {string} provider - Provider AI để sử dụng
 * @returns {Promise<string>} - Nội dung đã được nâng cao
 */
export const enhanceSlideContent = async (content, type = 'improve', provider = AI_CONFIG.defaultProvider) => {
    try {
        console.log(`aiService.js: Nâng cao nội dung slide (${type})`);
        
        // Xây dựng prompt tùy thuộc vào loại nâng cao
        let prompt;
        let systemPrompt;
        
        switch (type) {
            case 'concise':
                systemPrompt = 'Bạn là chuyên gia tóm tắt và viết nội dung súc tích. Hãy giữ lại các thông tin quan trọng nhất.';
                prompt = `Hãy tóm tắt và làm súc tích nội dung sau đây, đảm bảo giữ lại những điểm quan trọng nhất và ý tưởng chính:\n\n${content}`;
                break;
            case 'elaborate':
                systemPrompt = 'Bạn là chuyên gia mở rộng và bổ sung chi tiết cho nội dung. Hãy làm nội dung phong phú và đầy đủ hơn.';
                prompt = `Hãy mở rộng và bổ sung chi tiết cho nội dung sau đây, làm cho nó phong phú và đầy đủ hơn với dữ liệu, ví dụ và thông tin bổ sung:\n\n${content}`;
                break;
            case 'professional':
                systemPrompt = 'Bạn là chuyên gia viết nội dung chuyên nghiệp. Hãy sử dụng ngôn ngữ trang trọng và chuyên nghiệp.';
                prompt = `Hãy viết lại nội dung sau đây theo phong cách chuyên nghiệp và trang trọng hơn, phù hợp với môi trường doanh nghiệp hoặc học thuật:\n\n${content}`;
                break;
            case 'creative':
                systemPrompt = 'Bạn là chuyên gia viết nội dung sáng tạo. Hãy sử dụng ngôn ngữ sinh động và hấp dẫn.';
                prompt = `Hãy viết lại nội dung sau đây theo phong cách sáng tạo và hấp dẫn hơn, sử dụng ngôn ngữ sinh động và thu hút người đọc:\n\n${content}`;
                break;
            default:
                systemPrompt = 'Bạn là chuyên gia cải thiện nội dung bài thuyết trình. Hãy nâng cao chất lượng nội dung.';
                prompt = `Hãy cải thiện nội dung sau đây, làm cho nó rõ ràng, dễ hiểu và có tính thuyết phục hơn mà không thay đổi ý nghĩa chính:\n\n${content}`;
        }
        
        // Sử dụng multiAiService để gọi AI API
        console.log(`aiService.js: Gọi AI API (${provider}) để nâng cao nội dung`);
        
        const enhancedContent = await generateCompletion(prompt, {
            systemPrompt,
            temperature: 0.7,
            maxTokens: 2000,
            provider
        });
        
        return enhancedContent;
    } catch (error) {
        console.error('Lỗi khi nâng cao nội dung slide:', error);
        // Trả về nội dung gốc nếu có lỗi
        return content;
    }
};

/**
 * Tạo prompt cho bài thuyết trình
 * @param {Object} options - Các tùy chọn cho bài thuyết trình
 * @returns {string} - Prompt hoàn chỉnh
 */
function createPresentationPrompt(options) {
  const { 
    topic, 
    style, 
    slides, 
    language = 'vi',
    purpose = 'business',
    audience = 'general',
    includeCharts = true,
    includeImages = true,
    knowledge = null // Dữ liệu bổ sung từ knowledgeService
  } = options;
  
  let styleDescription = '';
  switch (style) {
    case 'professional':
      styleDescription = 'Chuyên nghiệp, súc tích, rõ ràng, phù hợp trong môi trường doanh nghiệp';
      break;
    case 'creative':
      styleDescription = 'Sáng tạo, hấp dẫn, với ngôn ngữ sinh động và ý tưởng độc đáo';
      break;
    case 'minimal':
      styleDescription = 'Tối giản, chỉ những thông tin thiết yếu, trình bày đơn giản';
      break;
    case 'academic':
      styleDescription = 'Học thuật, chính xác, có trích dẫn và thuật ngữ chuyên ngành';
      break;
    case 'nature':
      styleDescription = 'Lấy cảm hứng từ thiên nhiên, thân thiện với môi trường, nhẹ nhàng';
      break;
    case 'tech':
      styleDescription = 'Định hướng công nghệ, hiện đại, đổi mới, tập trung vào xu hướng mới';
      break;
    default:
      styleDescription = 'Chuyên nghiệp và dễ hiểu';
  }
  
  let audienceDescription = '';
  switch (audience) {
    case 'executive':
      audienceDescription = 'Lãnh đạo và quản lý cấp cao, tập trung vào chiến lược và kết quả. Họ quan tâm đến tác động kinh doanh, ROI và định hướng dài hạn.';
      break;
    case 'technical':
      audienceDescription = 'Chuyên gia kỹ thuật, có kiến thức chuyên môn trong lĩnh vực. Họ đánh giá cao chi tiết kỹ thuật, dữ liệu cụ thể và phân tích sâu.';
      break;
    case 'student':
      audienceDescription = 'Học sinh và sinh viên, nội dung giáo dục và dễ tiếp cận. Họ cần các khái niệm được giải thích rõ ràng với ví dụ thực tế.';
      break;
    case 'client':
      audienceDescription = 'Khách hàng và đối tác, tập trung vào giá trị và lợi ích. Họ quan tâm đến giải pháp cho vấn đề của họ và ROI.';
      break;
    default:
      audienceDescription = 'Đối tượng đại chúng với nhiều cấp độ hiểu biết khác nhau, cần thông tin cân bằng giữa chuyên môn và khả năng tiếp cận.';
  }
  
  let purposeDescription = '';
  switch (purpose) {
    case 'education':
      purposeDescription = 'Giáo dục và đào tạo, truyền đạt kiến thức. Mục tiêu là làm cho người nghe hiểu rõ chủ đề và có thể áp dụng kiến thức.';
      break;
    case 'marketing':
      purposeDescription = 'Marketing và truyền thông, thuyết phục và thu hút. Mục tiêu là tạo ấn tượng và khuyến khích hành động cụ thể.';
      break;
    case 'academic':
      purposeDescription = 'Nghiên cứu học thuật, báo cáo khoa học. Mục tiêu là trình bày phát hiện, phương pháp nghiên cứu và đóng góp cho lĩnh vực.';
      break;
    case 'personal':
      purposeDescription = 'Sử dụng cá nhân, chia sẻ thông tin hoặc kỹ năng. Mục tiêu là kết nối với người nghe và truyền cảm hứng.';
      break;
    default:
      purposeDescription = 'Sử dụng trong môi trường doanh nghiệp và công việc. Mục tiêu là cung cấp thông tin, hỗ trợ quyết định và thúc đẩy kết quả kinh doanh.';
  }
  
  // Bổ sung thông tin về biểu đồ và hình ảnh
  const mediaGuidance = `
Hướng dẫn về phương tiện trực quan:
- ${includeCharts ? 'Đề xuất dữ liệu biểu đồ thống kê cụ thể cho các slide có nội dung phù hợp, đặc biệt cho các slide về so sánh, thị trường, xu hướng, kết quả nghiên cứu, bao gồm cả số liệu thực tế.' : 'Không đề xuất biểu đồ.'}
- ${includeImages ? 'Đề xuất từ khóa hình ảnh phù hợp cho mỗi slide, tập trung vào hình ảnh có tính biểu tượng và minh họa cao.' : 'Không đề xuất hình ảnh.'}
`;

  // Bổ sung yêu cầu về cấu trúc slide đặc biệt
  const specialSlideRequests = `
Yêu cầu về cấu trúc bài thuyết trình:
1. Slide đầu tiên: Trang bìa với tiêu đề thu hút, tên người trình bày, và statement ngắn về giá trị của bài thuyết trình.
2. Slide thứ hai: Outline/Mục lục rõ ràng với các phần chính của bài thuyết trình.
3. Slide giới thiệu: Đặt vấn đề, tạo sự quan tâm, và thiết lập bối cảnh.
4. Slide nội dung chính: Phân tích sâu với dữ liệu cụ thể, ví dụ thực tế, và so sánh.
5. Slide case study: Ít nhất một nghiên cứu trường hợp điển hình liên quan đến chủ đề.
6. Slide xu hướng: Phân tích xu hướng hiện tại và tương lai của lĩnh vực.
7. Slide thách thức & giải pháp: Thảo luận về thách thức và đề xuất giải pháp cụ thể.
8. Slide kết luận: Tóm tắt các điểm chính, tái khẳng định thông điệp chính.
9. Slide Call-to-Action: Các bước tiếp theo cụ thể mà người nghe nên thực hiện.
10. Slide Q&A: Chuẩn bị câu hỏi gợi ý để thảo luận.
11. Slide tài liệu tham khảo: Liệt kê nguồn thông tin đáng tin cậy đã sử dụng.
`;

  // Nếu có dữ liệu từ knowledgeService, thêm nó vào prompt
  let knowledgePrompt = '';
  if (knowledge) {
    knowledgePrompt = `
Thông tin bổ sung cho bài thuyết trình:

Thống kê thị trường:
${knowledge.statistics.map(stat => `- ${stat.metric}: ${stat.value} (Nguồn: ${stat.source})`).join('\n')}

Nghiên cứu trường hợp điển hình:
${knowledge.caseStudies.map(cs => `- ${cs.company} (${cs.industry}): ${cs.challenge} -> ${cs.solution} -> ${cs.results}`).join('\n')}

Xu hướng ngành hiện tại:
${knowledge.trends.map(trend => `- ${trend}`).join('\n')}

Nguồn tham khảo đáng tin cậy:
${knowledge.sources.map(source => `- ${source.name}: ${source.url}`).join('\n')}
`;
  }

  return `
Tạo một bài thuyết trình chuyên nghiệp, chi tiết và có chiều sâu về chủ đề "${topic}" với ${slides} slides.

Thông tin cơ bản:
- Phong cách: ${styleDescription}
- Đối tượng: ${audienceDescription}
- Mục đích: ${purposeDescription}
- Ngôn ngữ: ${language === 'vi' ? 'Tiếng Việt' : language === 'en' ? 'Tiếng Anh' : `${language}`}
${mediaGuidance}

${specialSlideRequests}

${knowledgePrompt}

Yêu cầu về chất lượng nội dung:
1. Độ sâu: Phân tích chuyên sâu từng khía cạnh của chủ đề, không chỉ dừng ở thông tin bề mặt.
2. Dữ liệu cụ thể: Sử dụng số liệu, thống kê và dữ liệu thực tế từ các nguồn đáng tin cậy.
3. Case studies: Cung cấp ít nhất 1-2 ví dụ thực tế điển hình liên quan đến chủ đề.
4. Phân tích xu hướng: Nêu bật các xu hướng hiện tại và dự đoán trong tương lai.
5. Thực tiễn: Tập trung vào ứng dụng thực tế và giá trị của chủ đề.
6. Ngắn gọn nhưng đầy đủ: Mỗi slide phải súc tích nhưng vẫn đủ thông tin.
7. Cấu trúc rõ ràng: Sắp xếp thông tin theo trình tự logic với liên kết giữa các phần.

Format JSON trả về như sau:
{
  "title": "Tiêu đề bài thuyết trình",
  "description": "Mô tả ngắn về bài thuyết trình",
  "slides": [
    {
      "title": "Tiêu đề slide",
      "content": "Nội dung slide với định dạng súc tích và dễ hiểu",
      "notes": "Ghi chú cho người thuyết trình (không hiển thị trong slide)",
      "keywords": ["từ_khóa_1", "từ_khóa_2"], // Từ khóa hình ảnh gợi ý nếu cần
      "slideType": "introduction|content|caseStudy|statistics|trends|conclusion|references" // Loại slide
    }
  ]
}

Hãy đảm bảo rằng bạn trả về CHÍNH XÁC định dạng JSON này, không thêm bất kỳ tiền tố hoặc hậu tố nào.
`;
}

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
 * @param {Array} slides - Mảng các slide
 * @param {string} topic - Chủ đề bài thuyết trình
 * @param {Object} knowledge - Kiến thức thu thập được
 * @returns {Array} - Mảng các slide đã tăng cường
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
 * Đảm bảo có slide tài liệu tham khảo
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