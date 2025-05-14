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
import { suggestImageKeywords } from './apiService';

// Template system for presentations
const PRESENTATION_TEMPLATES = {
    // ... existing templates ...
};

// Enhanced animation system
const ENHANCED_ANIMATIONS = {
    fade: {
        in: {
            duration: 500,
            easing: 'ease-in-out',
            properties: {
                opacity: [0, 1],
                transform: ['translateY(20px)', 'translateY(0)']
            }
        },
        out: {
            duration: 500,
            easing: 'ease-in-out',
            properties: {
                opacity: [1, 0],
                transform: ['translateY(0)', 'translateY(-20px)']
            }
        }
    },
    slide: {
        in: {
            duration: 700,
            easing: 'ease-out',
            properties: {
                transform: ['translateX(100%)', 'translateX(0)'],
                opacity: [0, 1]
            }
        },
        out: {
            duration: 700,
            easing: 'ease-in',
            properties: {
                transform: ['translateX(0)', 'translateX(-100%)'],
                opacity: [1, 0]
            }
        }
    },
    zoom: {
        in: {
            duration: 600,
            easing: 'ease-out',
            properties: {
                transform: ['scale(0.8)', 'scale(1)'],
                opacity: [0, 1]
            }
        },
        out: {
            duration: 600,
            easing: 'ease-in',
            properties: {
                transform: ['scale(1)', 'scale(1.2)'],
                opacity: [1, 0]
            }
        }
    },
    gradient: {
        in: {
            duration: 1000,
            easing: 'ease-in-out',
            properties: {
                backgroundPosition: ['0% 0%', '100% 100%'],
                opacity: [0, 1]
            }
        },
        out: {
            duration: 1000,
            easing: 'ease-in-out',
            properties: {
                backgroundPosition: ['100% 100%', '0% 0%'],
                opacity: [1, 0]
            }
        }
    },
    neon: {
        in: {
            duration: 800,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            properties: {
                textShadow: [
                    '0 0 0px currentColor',
                    '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor'
                ],
                opacity: [0, 1]
            }
        },
        out: {
            duration: 800,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            properties: {
                textShadow: [
                    '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
                    '0 0 0px currentColor'
                ],
                opacity: [1, 0]
            }
        }
    },
    float: {
        in: {
            duration: 1000,
            easing: 'ease-in-out',
            properties: {
                transform: ['translateY(20px)', 'translateY(0)'],
                opacity: [0, 1]
            }
        },
        out: {
            duration: 1000,
            easing: 'ease-in-out',
            properties: {
                transform: ['translateY(0)', 'translateY(-20px)'],
                opacity: [1, 0]
            }
        }
    },
    bounce: {
        in: {
            duration: 800,
            easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            properties: {
                transform: ['scale(0.3)', 'scale(1)'],
                opacity: [0, 1]
            }
        },
        out: {
            duration: 800,
            easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            properties: {
                transform: ['scale(1)', 'scale(0.3)'],
                opacity: [1, 0]
            }
        }
    }
};

// Export các hàm cần thiết
export const generatePresentation = async (params) => {
  try {
    const { topic, style, slideCount, purpose, audience, language, includeCharts, includeImages } = params;
    
    // Tạo nội dung cho từng slide
    const slides = [];
    for (let i = 0; i < slideCount; i++) {
      const slideContent = await generateSlideContent({
        topic,
        style,
        purpose,
        audience,
        language,
        slideNumber: i + 1,
        totalSlides: slideCount,
        includeCharts,
        includeImages
      });
      slides.push(slideContent);
    }
    
    return {
      slides,
      metadata: {
        topic,
        style,
        slideCount,
        purpose,
        audience,
        language,
        includeCharts,
        includeImages
      }
    };
  } catch (error) {
    console.error('Error generating presentation:', error);
    throw error;
  }
};

export const enhanceSlideContent = async (params) => {
  try {
    const { content, style, purpose, audience, language } = params;
    
    // Tăng cường nội dung slide
    const enhancedContent = await generateChatCompletion({
      messages: [
        {
          role: 'system',
          content: `Enhance the following slide content for a ${purpose} presentation targeting ${audience} audience. Use ${style} style and ${language} language.`
        },
        {
          role: 'user',
          content: content
        }
      ]
    });
    
    return enhancedContent;
  } catch (error) {
    console.error('Error enhancing slide content:', error);
    throw error;
  }
};

// Hàm tạo nội dung cho một slide
const generateSlideContent = async (params) => {
  try {
    const { topic, style, purpose, audience, language, slideNumber, totalSlides, includeCharts, includeImages } = params;
    
    // Tạo nội dung slide
    const content = await generateChatCompletion({
      messages: [
        {
          role: 'system',
          content: `Create content for slide ${slideNumber} of ${totalSlides} for a ${purpose} presentation about ${topic}. Use ${style} style and ${language} language. Target audience: ${audience}.`
        }
      ]
    });
    
    // Thêm biểu đồ nếu cần
    let chartData = null;
    if (includeCharts) {
      chartData = await generateChartData({
        topic,
        slideNumber,
        totalSlides
      });
    }
    
    // Thêm hình ảnh nếu cần
    let imageKeywords = null;
    if (includeImages) {
      imageKeywords = await suggestImageKeywords({
        content,
        topic,
        style
      });
    }
    
    return {
      content,
      chartData,
      imageKeywords
    };
  } catch (error) {
    console.error('Error generating slide content:', error);
    throw error;
  }
};

// Hàm tạo dữ liệu biểu đồ
const generateChartData = async (params) => {
  try {
    const { topic, slideNumber, totalSlides } = params;
    
    // Tạo dữ liệu biểu đồ
    const chartData = await generateChatCompletion({
      messages: [
        {
          role: 'system',
          content: `Generate chart data for slide ${slideNumber} of ${totalSlides} about ${topic}. Include labels, values, and chart type.`
        }
      ]
    });
    
    return chartData;
  } catch (error) {
    console.error('Error generating chart data:', error);
    throw error;
  }
};

// ... rest of the file content ... 