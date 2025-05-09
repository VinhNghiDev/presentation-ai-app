require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Template = require('./models/Template');
const Presentation = require('./models/Presentation');
const { connectDB } = require('./config/dbConfig');

// Connect to database
connectDB();

// Dữ liệu mẫu cho users
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    isVerified: true
  },
  {
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'password',
    role: 'user',
    isVerified: true
  },
  {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password',
    role: 'user',
    isVerified: true
  }
];

// Dữ liệu mẫu cho templates
const templates = [
  {
    name: 'Business Modern',
    description: 'Template hiện đại dành cho thuyết trình doanh nghiệp, với thiết kế chuyên nghiệp và sạch sẽ.',
    thumbnail: 'https://via.placeholder.com/300x200?text=Business+Modern',
    category: 'business',
    styles: {
      primaryColor: '#1976d2',
      secondaryColor: '#f44336',
      backgroundColor: '#ffffff',
      fontFamily: 'Roboto, sans-serif',
      headerFontFamily: 'Montserrat, sans-serif',
      fontSize: 16
    },
    isPublic: true,
    isPremium: false
  },
  {
    name: 'Creative Pitch',
    description: 'Template sáng tạo và đầy màu sắc cho các bài thuyết trình giới thiệu sản phẩm hoặc ý tưởng.',
    thumbnail: 'https://via.placeholder.com/300x200?text=Creative+Pitch',
    category: 'creative',
    styles: {
      primaryColor: '#9c27b0',
      secondaryColor: '#4caf50',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Poppins, sans-serif',
      headerFontFamily: 'Poppins, sans-serif',
      fontSize: 17
    },
    isPublic: true,
    isPremium: false
  },
  {
    name: 'Academic Research',
    description: 'Template học thuật cho các bài thuyết trình nghiên cứu khoa học và giáo dục.',
    thumbnail: 'https://via.placeholder.com/300x200?text=Academic+Research',
    category: 'education',
    styles: {
      primaryColor: '#673ab7',
      secondaryColor: '#ff9800',
      backgroundColor: '#ffffff',
      fontFamily: 'Merriweather, serif',
      headerFontFamily: 'Montserrat, sans-serif',
      fontSize: 16
    },
    isPublic: true,
    isPremium: false
  },
  {
    name: 'Minimal Clean',
    description: 'Template tối giản với nhiều không gian trắng, tập trung vào nội dung.',
    thumbnail: 'https://via.placeholder.com/300x200?text=Minimal+Clean',
    category: 'minimal',
    styles: {
      primaryColor: '#212121',
      secondaryColor: '#757575',
      backgroundColor: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      headerFontFamily: 'Inter, sans-serif',
      fontSize: 16
    },
    isPublic: true,
    isPremium: false
  },
  {
    name: 'Marketing Pro',
    description: 'Template chuyên nghiệp cho các bài thuyết trình marketing và phân tích thị trường.',
    thumbnail: 'https://via.placeholder.com/300x200?text=Marketing+Pro',
    category: 'marketing',
    styles: {
      primaryColor: '#2196f3',
      secondaryColor: '#ff5722',
      backgroundColor: '#ffffff',
      fontFamily: 'Source Sans Pro, sans-serif',
      headerFontFamily: 'Montserrat, sans-serif',
      fontSize: 16
    },
    isPublic: true,
    isPremium: true
  }
];

// Dữ liệu mẫu cho presentations
const createPresentations = (userId) => [
  {
    title: 'Giới thiệu về Trí tuệ nhân tạo',
    description: 'Bài thuyết trình tổng quan về trí tuệ nhân tạo và các ứng dụng của nó',
    userId,
    template: 'Business Modern',
    isPublic: true,
    tags: ['AI', 'Technology', 'Innovation'],
    slides: [
      {
        id: 'slide-1',
        title: 'Trí tuệ nhân tạo',
        content: 'Tổng quan về AI và tác động của nó đối với thế giới hiện đại',
        type: 'cover',
        notes: 'Giới thiệu bản thân và chủ đề',
        order: 0
      },
      {
        id: 'slide-2',
        title: 'Nội dung chính',
        content: '1. Giới thiệu về AI\n2. Lịch sử phát triển\n3. Các loại AI\n4. Ứng dụng trong thực tế\n5. Tương lai của AI',
        type: 'table-of-contents',
        notes: 'Giới thiệu ngắn gọn về các phần sẽ trình bày',
        order: 1
      },
      {
        id: 'slide-3',
        title: 'AI là gì?',
        content: 'Trí tuệ nhân tạo (AI) là khả năng của máy tính hoặc robot được điều khiển bởi máy tính để thực hiện các nhiệm vụ thường đòi hỏi trí thông minh của con người.\n\nAI bao gồm các thuật toán học máy, xử lý ngôn ngữ tự nhiên, thị giác máy tính và nhiều lĩnh vực khác.',
        type: 'content',
        notes: 'Giải thích định nghĩa AI một cách đơn giản và dễ hiểu',
        order: 2
      },
      {
        id: 'slide-4',
        title: 'Lịch sử phát triển',
        content: '- 1950s: Alan Turing và "Bài kiểm tra Turing"\n- 1956: Hội nghị Dartmouth, thuật ngữ "Trí tuệ nhân tạo" ra đời\n- 1980s-1990s: Hệ thống chuyên gia và mạng neural\n- 2010s: Deep learning và bùng nổ AI\n- Hiện tại: Generative AI và Large Language Models',
        type: 'content',
        notes: 'Nhấn mạnh các mốc quan trọng trong lịch sử phát triển',
        order: 3
      },
      {
        id: 'slide-5',
        title: 'Ứng dụng của AI',
        content: '- Chăm sóc sức khỏe: Chẩn đoán bệnh, phát hiện thuốc mới\n- Tài chính: Phát hiện gian lận, giao dịch tự động\n- Giáo dục: Học cá nhân hóa, hệ thống đánh giá\n- Sản xuất: Tự động hóa, bảo trì dự đoán\n- Tiếp thị: Quảng cáo cá nhân hóa, phân tích dữ liệu',
        type: 'content',
        notes: 'Đưa ra các ví dụ cụ thể cho mỗi lĩnh vực',
        order: 4
      },
      {
        id: 'slide-6',
        title: 'Tương lai của AI',
        content: 'AI sẽ tiếp tục phát triển và tích hợp sâu hơn vào cuộc sống hàng ngày:\n\n- AI tổng quát (AGI)\n- Kết hợp với IoT và robotics\n- Giải quyết các thách thức toàn cầu\n- Đạo đức AI và quy định\n- Tác động đến việc làm và xã hội',
        type: 'content',
        notes: 'Thảo luận về cả cơ hội và thách thức',
        order: 5
      },
      {
        id: 'slide-7',
        title: 'Kết luận',
        content: 'AI đang và sẽ tiếp tục thay đổi cách chúng ta sống và làm việc.\n\nThách thức lớn nhất là đảm bảo AI phát triển một cách có trách nhiệm và mang lại lợi ích cho tất cả mọi người.',
        type: 'conclusion',
        notes: 'Tóm tắt các điểm chính và kết luận',
        order: 6
      }
    ]
  },
  {
    title: 'Kế hoạch marketing 2023',
    description: 'Chiến lược marketing cho năm 2023',
    userId,
    template: 'Marketing Pro',
    isPublic: false,
    tags: ['Marketing', 'Strategy', 'Business'],
    slides: [
      {
        id: 'slide-1',
        title: 'Kế hoạch Marketing 2023',
        content: 'Chiến lược và kế hoạch hành động',
        type: 'cover',
        notes: 'Giới thiệu về kế hoạch marketing tổng thể cho năm 2023',
        order: 0
      },
      {
        id: 'slide-2',
        title: 'Tổng quan thị trường',
        content: '- Thị trường tăng trưởng 12% trong năm 2022\n- Đối thủ cạnh tranh chính: Công ty A, B, C\n- Xu hướng mới: Tập trung vào bền vững và trách nhiệm xã hội\n- Thách thức: Chi phí tăng cao, cạnh tranh gay gắt',
        type: 'market-analysis',
        notes: 'Phân tích thị trường hiện tại và xu hướng',
        order: 1
      },
      {
        id: 'slide-3',
        title: 'Mục tiêu 2023',
        content: '1. Tăng doanh thu 20% so với năm 2022\n2. Đạt 15,000 khách hàng mới\n3. Tăng tỷ lệ giữ chân khách hàng lên 85%\n4. Mở rộng thị trường sang 2 khu vực mới\n5. Tăng nhận diện thương hiệu 30%',
        type: 'content',
        notes: 'Mục tiêu cụ thể và đo lường được',
        order: 2
      }
    ]
  }
];

// Hàm tạo dữ liệu mẫu
const importData = async () => {
  try {
    // Xóa dữ liệu hiện có
    await User.deleteMany();
    await Template.deleteMany();
    await Presentation.deleteMany();
    
    console.log('Đã xóa dữ liệu hiện có');
    
    // Tạo users
    const createdUsers = await User.create(users);
    console.log(`Đã tạo ${createdUsers.length} người dùng`);
    
    // Thêm createdBy cho templates
    const adminUser = createdUsers[0];
    const templatesWithUser = templates.map(template => ({
      ...template,
      createdBy: adminUser._id
    }));
    
    // Tạo templates
    const createdTemplates = await Template.create(templatesWithUser);
    console.log(`Đã tạo ${createdTemplates.length} templates`);
    
    // Tạo presentations cho mỗi user
    for (const user of createdUsers) {
      const userPresentations = createPresentations(user._id);
      await Presentation.create(userPresentations);
      console.log(`Đã tạo ${userPresentations.length} bài thuyết trình cho ${user.name}`);
    }
    
    console.log('Đã nhập dữ liệu thành công');
    process.exit();
  } catch (error) {
    console.error(`Lỗi: ${error.message}`);
    process.exit(1);
  }
};

// Hàm xóa dữ liệu mẫu
const destroyData = async () => {
  try {
    // Xóa dữ liệu hiện có
    await User.deleteMany();
    await Template.deleteMany();
    await Presentation.deleteMany();
    
    console.log('Đã xóa tất cả dữ liệu');
    process.exit();
  } catch (error) {
    console.error(`Lỗi: ${error.message}`);
    process.exit(1);
  }
};

// Chạy hàm tương ứng dựa trên tham số dòng lệnh
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
} 