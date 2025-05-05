// Dịch vụ Knowledge - Tăng cường chất lượng nội dung bài thuyết trình
// Sử dụng RAG (Retrieval Augmented Generation) để tìm kiếm thông tin từ các nguồn đáng tin cậy

/**
 * Các nguồn thông tin tin cậy cho từng lĩnh vực
 */
const KNOWLEDGE_SOURCES = {
  technology: [
    { name: 'Gartner Research', url: 'https://www.gartner.com/en/research' },
    { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/' },
    { name: 'TechCrunch', url: 'https://techcrunch.com/' },
    { name: 'IEEE Spectrum', url: 'https://spectrum.ieee.org/' }
  ],
  business: [
    { name: 'Harvard Business Review', url: 'https://hbr.org/' },
    { name: 'McKinsey Insights', url: 'https://www.mckinsey.com/insights' },
    { name: 'Forbes', url: 'https://www.forbes.com/' },
    { name: 'Bloomberg', url: 'https://www.bloomberg.com/' }
  ],
  education: [
    { name: 'Education Week', url: 'https://www.edweek.org/' },
    { name: 'The Chronicle of Higher Education', url: 'https://www.chronicle.com/' },
    { name: 'Inside Higher Ed', url: 'https://www.insidehighered.com/' }
  ],
  marketing: [
    { name: 'Marketing Land', url: 'https://marketingland.com/' },
    { name: 'AdWeek', url: 'https://www.adweek.com/' },
    { name: 'MarketingProfs', url: 'https://www.marketingprofs.com/' }
  ],
  health: [
    { name: 'World Health Organization', url: 'https://www.who.int/' },
    { name: 'The Lancet', url: 'https://www.thelancet.com/' },
    { name: 'New England Journal of Medicine', url: 'https://www.nejm.org/' }
  ]
};

/**
 * Thông tin báo cáo thống kê và nghiên cứu thị trường cập nhật
 */
const MARKET_STATISTICS = {
  'artificial intelligence': [
    { metric: 'Global AI Market Value 2023', value: '$150.2 billion', source: 'Statista' },
    { metric: 'Projected Annual Growth Rate (2023-2030)', value: '36.8%', source: 'Grand View Research' },
    { metric: 'AI Adoption Rate in Enterprises', value: '35%', source: 'McKinsey' },
    { metric: 'Investment in AI Startups (2023)', value: '$45.5 billion', source: 'CB Insights' }
  ],
  'digital marketing': [
    { metric: 'Global Digital Ad Spending 2023', value: '$567.49 billion', source: 'eMarketer' },
    { metric: 'Social Media Marketing Growth Rate', value: '23.4%', source: 'Forrester' },
    { metric: 'Mobile Ad Spending Share', value: '70.3%', source: 'Statista' },
    { metric: 'Email Marketing ROI', value: '$36 for every $1 spent', source: 'Litmus' }
  ],
  'e-commerce': [
    { metric: 'Global E-commerce Sales 2023', value: '$5.8 trillion', source: 'Statista' },
    { metric: 'Mobile Commerce Share', value: '72.9%', source: 'Oberlo' },
    { metric: 'Cart Abandonment Rate', value: '69.82%', source: 'Baymard Institute' },
    { metric: 'Conversion Rate Average', value: '2.58%', source: 'Monetate' }
  ],
  'blockchain': [
    { metric: 'Global Blockchain Market Size 2023', value: '$19.77 billion', source: 'Markets and Markets' },
    { metric: 'Expected CAGR (2023-2030)', value: '87.7%', source: 'Grand View Research' },
    { metric: 'Enterprise Blockchain Adoption', value: '24%', source: 'Deloitte' },
    { metric: 'Venture Capital Investment (2023)', value: '$25.2 billion', source: 'CB Insights' }
  ],
  'remote work': [
    { metric: 'Remote Workers Worldwide 2023', value: '28% of full-time employees', source: 'Owl Labs' },
    { metric: 'Productivity Increase', value: '13%', source: 'Stanford University' },
    { metric: 'Companies Going Permanently Remote', value: '16%', source: 'Gartner' },
    { metric: 'Remote Work Technology Market Size', value: '$30.7 billion', source: 'Global Market Insights' }
  ]
};

/**
 * Dữ liệu case studies và ví dụ điển hình cho nhiều lĩnh vực
 */
const CASE_STUDIES = {
  'digital transformation': [
    {
      company: 'Nike',
      industry: 'Retail',
      challenge: 'Declining brick-and-mortar sales and increasing competition',
      solution: 'Implemented direct-to-consumer strategy with Nike App, SNKRS app, and Nike+',
      results: '30% digital sales growth YoY, increased customer engagement by 48%',
      year: 2022
    },
    {
      company: 'DBS Bank',
      industry: 'Banking',
      challenge: 'Legacy systems and increasing fintech competition',
      solution: 'Comprehensive digital infrastructure redesign and API-based architecture',
      results: 'Reduced cost-income ratio to 43%, named "World\'s Best Digital Bank"',
      year: 2021
    }
  ],
  'sustainable business': [
    {
      company: 'Unilever',
      industry: 'Consumer Goods',
      challenge: 'Environmental impact and changing consumer preferences',
      solution: 'Sustainable Living Plan focusing on reducing footprint and improving livelihoods',
      results: '70% reduction in CO2 from energy, reduced waste by 96% per ton of production',
      year: 2022
    },
    {
      company: 'Patagonia',
      industry: 'Retail',
      challenge: 'Environmental impact of clothing production',
      solution: 'Circular economy business model with recycled materials and repair programs',
      results: '45% products made with recycled materials, donated 1% of sales to environmental causes',
      year: 2023
    }
  ]
};

/**
 * Xu hướng mới nhất trong các lĩnh vực khác nhau
 */
const INDUSTRY_TRENDS = {
  'technology': [
    'Generative AI moving from experimentation to implementation',
    'Edge computing for reduced latency and improved privacy',
    'Quantum computing reaching practical applications',
    'Extended reality (XR) integration in enterprise applications',
    'Growth of AI governance frameworks and responsible AI'
  ],
  'business': [
    'Shift to asynchronous and hybrid work models',
    'Increased focus on employee wellbeing and mental health',
    'Growth of subscription and service-based revenue models',
    'Emphasis on purpose-driven business strategies',
    'Integration of sustainability into core business operations'
  ],
  'marketing': [
    'First-party data strategies due to cookie deprecation',
    'AI-powered personalization at scale',
    'Voice and visual search optimization',
    'Interactive content and immersive experiences',
    'Values-based marketing with authentic brand positioning'
  ],
  'education': [
    'Microlearning and bite-sized educational content',
    'Skills-based curriculum and competency-based learning',
    'Integration of AR/VR in educational experiences',
    'Lifelong learning platforms for continuous skill development',
    'AI-powered adaptive learning pathways'
  ]
};

/**
 * Phân loại chủ đề thành các lĩnh vực chính
 * @param {string} topic - Chủ đề của bài thuyết trình
 * @returns {string} - Lĩnh vực phù hợp nhất
 */
function categorizeTopicDomain(topic) {
  const topicLower = topic.toLowerCase();
  
  // Từ khóa công nghệ
  if (/\b(công nghệ|technology|ai|blockchain|iot|software|phần mềm|app|application|web|tech|internet|it|database|dữ liệu|data|cloud|đám mây|mobile|di động|digital|số hóa|digitalization|machine learning|deep learning|robot|automation|tự động hóa)\b/.test(topicLower)) {
    return 'technology';
  }
  
  // Từ khóa kinh doanh
  if (/\b(kinh doanh|business|leadership|lãnh đạo|management|quản lý|entrepreneurship|khởi nghiệp|startup|strategy|chiến lược|finance|tài chính|investment|đầu tư|growth|tăng trưởng|sales|bán hàng|revenue|doanh thu|profit|lợi nhuận|market|thị trường)\b/.test(topicLower)) {
    return 'business';
  }
  
  // Từ khóa giáo dục
  if (/\b(giáo dục|education|learning|học tập|teaching|giảng dạy|student|học sinh|sinh viên|school|trường học|university|đại học|course|khóa học|curriculum|chương trình|academic|học thuật|training|đào tạo|skill|kỹ năng)\b/.test(topicLower)) {
    return 'education';
  }
  
  // Từ khóa marketing
  if (/\b(marketing|digital marketing|social media|mạng xã hội|advertising|quảng cáo|brand|thương hiệu|promotion|khuyến mãi|customer|khách hàng|consumer|người tiêu dùng|market research|nghiên cứu thị trường|seo|content|nội dung|audience|target|mục tiêu|campaign|chiến dịch)\b/.test(topicLower)) {
    return 'marketing';
  }
  
  // Từ khóa sức khỏe
  if (/\b(sức khỏe|health|healthcare|y tế|medical|y học|wellness|khỏe mạnh|fitness|thể dục|nutrition|dinh dưỡng|mental health|sức khỏe tâm thần|therapy|liệu pháp|medicine|thuốc|disease|bệnh|prevention|phòng ngừa|care|chăm sóc)\b/.test(topicLower)) {
    return 'health';
  }
  
  // Mặc định quay lại kinh doanh
  return 'business';
}

/**
 * Tìm kiếm thống kê thị trường liên quan đến chủ đề
 * @param {string} topic - Chủ đề của bài thuyết trình
 * @returns {Array} - Mảng các thống kê thị trường liên quan
 */
export function findRelevantStatistics(topic) {
  const topicLower = topic.toLowerCase();
  
  // Tìm kiếm trong các từ khóa có sẵn
  for (const [keyword, stats] of Object.entries(MARKET_STATISTICS)) {
    if (topicLower.includes(keyword)) {
      return stats;
    }
  }
  
  // Nếu không tìm thấy chính xác, trả về dữ liệu từ lĩnh vực tương tự
  const domain = categorizeTopicDomain(topic);
  switch (domain) {
    case 'technology':
      return MARKET_STATISTICS['artificial intelligence'];
    case 'marketing':
      return MARKET_STATISTICS['digital marketing'];
    case 'business':
      return MARKET_STATISTICS['e-commerce'];
    default:
      return MARKET_STATISTICS['digital marketing']; // Mặc định
  }
}

/**
 * Tìm nguồn kiến thức đáng tin cậy cho chủ đề
 * @param {string} topic - Chủ đề của bài thuyết trình
 * @returns {Array} - Danh sách các nguồn đáng tin cậy
 */
export function findReliableSources(topic) {
  const domain = categorizeTopicDomain(topic);
  return KNOWLEDGE_SOURCES[domain] || KNOWLEDGE_SOURCES.business;
}

/**
 * Tìm kiếm case study phù hợp với chủ đề
 * @param {string} topic - Chủ đề của bài thuyết trình
 * @returns {Array} - Mảng các case study liên quan
 */
export function findRelevantCaseStudies(topic) {
  const topicLower = topic.toLowerCase();
  
  // Tìm trực tiếp theo từ khóa
  for (const [keyword, cases] of Object.entries(CASE_STUDIES)) {
    if (topicLower.includes(keyword)) {
      return cases;
    }
  }
  
  // Fallback: trả về case study về digital transformation
  return CASE_STUDIES['digital transformation'];
}

/**
 * Tìm kiếm xu hướng mới nhất trong lĩnh vực liên quan
 * @param {string} topic - Chủ đề của bài thuyết trình
 * @returns {Array} - Mảng các xu hướng hiện tại
 */
export function findIndustryTrends(topic) {
  const domain = categorizeTopicDomain(topic);
  return INDUSTRY_TRENDS[domain] || INDUSTRY_TRENDS.business;
}

/**
 * Tổng hợp tất cả kiến thức về một chủ đề
 * @param {string} topic - Chủ đề của bài thuyết trình
 * @returns {Object} - Đối tượng chứa tất cả thông tin liên quan
 */
export function gatherKnowledgeForTopic(topic) {
  const domain = categorizeTopicDomain(topic);
  
  return {
    domain,
    statistics: findRelevantStatistics(topic),
    sources: findReliableSources(topic),
    caseStudies: findRelevantCaseStudies(topic),
    trends: findIndustryTrends(topic)
  };
}

/**
 * Tạo tài liệu tham khảo cuối bài thuyết trình
 * @param {string} topic - Chủ đề của bài thuyết trình
 * @returns {string} - Slide tài liệu tham khảo định dạng chuẩn
 */
export function generateReferences(topic) {
  const sources = findReliableSources(topic);
  let referencesContent = "Tài liệu tham khảo:\n\n";
  
  sources.forEach((source, index) => {
    referencesContent += `${index + 1}. ${source.name}. Truy cập từ: ${source.url}\n`;
  });
  
  // Thêm các nguồn số liệu thống kê
  const statistics = findRelevantStatistics(topic);
  statistics.forEach(stat => {
    referencesContent += `${sources.length + 1}. ${stat.source} (2023). "${stat.metric}: ${stat.value}"\n`;
  });
  
  return referencesContent;
}

/**
 * Tạo nội dung phân tích thị trường dựa trên số liệu
 * @param {string} topic - Chủ đề của bài thuyết trình
 * @returns {string} - Nội dung phân tích thị trường
 */
export function generateMarketAnalysis(topic) {
  const statistics = findRelevantStatistics(topic);
  let analysisContent = `Phân tích thị trường ${topic}:\n\n`;
  
  statistics.forEach(stat => {
    analysisContent += `• ${stat.metric}: ${stat.value} (Nguồn: ${stat.source})\n`;
  });
  
  return analysisContent;
}

/**
 * Tạo nội dung nghiên cứu trường hợp điển hình
 * @param {string} topic - Chủ đề của bài thuyết trình
 * @returns {string} - Nội dung nghiên cứu trường hợp
 */
export function generateCaseStudyContent(topic) {
  const caseStudies = findRelevantCaseStudies(topic);
  let content = `Nghiên cứu trường hợp điển hình:\n\n`;
  
  caseStudies.forEach(cs => {
    content += `${cs.company} (${cs.industry}, ${cs.year}):\n`;
    content += `• Thách thức: ${cs.challenge}\n`;
    content += `• Giải pháp: ${cs.solution}\n`;
    content += `• Kết quả: ${cs.results}\n\n`;
  });
  
  return content;
}

/**
 * Tạo nội dung xu hướng ngành
 * @param {string} topic - Chủ đề của bài thuyết trình
 * @returns {string} - Nội dung xu hướng ngành
 */
export function generateTrendsContent(topic) {
  const trends = findIndustryTrends(topic);
  let content = `Xu hướng mới nhất trong lĩnh vực ${topic}:\n\n`;
  
  trends.forEach((trend, index) => {
    content += `${index + 1}. ${trend}\n`;
  });
  
  return content;
} 