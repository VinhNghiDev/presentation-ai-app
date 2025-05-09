const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import các models
const User = require('../models/User');
const Presentation = require('../models/Presentation');
const Template = require('../models/Template');
const Subscription = require('../models/Subscription');

// Kết nối đến MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Đã kết nối đến MongoDB'))
  .catch(err => {
    console.error('Lỗi kết nối MongoDB:', err);
    process.exit(1);
  });

// Hàm tạo mật khẩu đã mã hóa
async function createHashedPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Dữ liệu mẫu
const sampleData = {
  users: [
    {
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
      subscription: 'enterprise',
      preferences: {
        language: 'vi',
        theme: 'light'
      }
    },
    {
      name: 'Premium User',
      email: 'premium@example.com',
      password: 'premium123',
      role: 'premium',
      isVerified: true,
      subscription: 'premium',
      preferences: {
        language: 'en',
        theme: 'dark'
      }
    },
    {
      name: 'Normal User',
      email: 'user@example.com',
      password: 'user123',
      role: 'user',
      isVerified: true,
      subscription: 'free',
      preferences: {
        language: 'vi',
        theme: 'light'
      }
    }
  ],
  templates: [
    {
      name: 'Business Proposal',
      description: 'Template cho đề xuất kinh doanh chuyên nghiệp',
      category: 'business',
      thumbnail: '/templates/business-proposal.jpg',
      slides: [
        {
          type: 'text',
          content: {
            title: 'Đề xuất kinh doanh',
            subtitle: 'Công ty ABC'
          },
          order: 1,
          style: {
            backgroundColor: '#ffffff',
            textColor: '#000000'
          }
        }
      ],
      theme: 'professional',
      isPremium: false,
      tags: ['business', 'proposal', 'professional']
    },
    {
      name: 'Educational Presentation',
      description: 'Template cho bài giảng và thuyết trình giáo dục',
      category: 'education',
      thumbnail: '/templates/education.jpg',
      slides: [
        {
          type: 'text',
          content: {
            title: 'Bài giảng',
            subtitle: 'Môn học XYZ'
          },
          order: 1,
          style: {
            backgroundColor: '#f0f0f0',
            textColor: '#333333'
          }
        }
      ],
      theme: 'education',
      isPremium: true,
      price: 99000,
      tags: ['education', 'lecture', 'teaching']
    }
  ]
};

// Hàm khởi tạo dữ liệu
async function initializeDatabase() {
  try {
    // Xóa dữ liệu cũ
    await User.deleteMany({});
    await Template.deleteMany({});
    await Subscription.deleteMany({});
    await Presentation.deleteMany({});

    console.log('Đã xóa dữ liệu cũ');

    // Tạo users
    const users = [];
    for (const userData of sampleData.users) {
      // Tạo user mới
      const user = new User(userData);
      // Lưu user để trigger middleware hash password
      await user.save();
      users.push(user);
      console.log(`Đã tạo tài khoản: ${user.email} với mật khẩu: ${userData.password}`);
    }
    console.log('Đã tạo users');

    // Tạo templates
    const templates = await Template.create(sampleData.templates);
    console.log('Đã tạo templates');

    // Tạo subscriptions cho mỗi user
    const now = new Date();
    const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

    for (const user of users) {
      let plan, features;
      
      switch (user.role) {
        case 'admin':
          plan = 'enterprise';
          features = {
            maxPresentations: -1,
            maxSlides: -1,
            aiGenerations: 1000,
            customTemplates: true,
            collaboration: true,
            exportFormats: ['pdf', 'pptx', 'html', 'image']
          };
          break;
        case 'premium':
          plan = 'premium';
          features = {
            maxPresentations: 50,
            maxSlides: 100,
            aiGenerations: 100,
            customTemplates: true,
            collaboration: true,
            exportFormats: ['pdf', 'pptx', 'html']
          };
          break;
        default:
          plan = 'free';
          features = {
            maxPresentations: 5,
            maxSlides: 20,
            aiGenerations: 10,
            customTemplates: false,
            collaboration: false,
            exportFormats: ['pdf']
          };
      }

      await Subscription.create({
        user: user._id,
        plan: plan,
        status: 'active',
        startDate: now,
        endDate: oneYearLater,
        features: features,
        payment: {
          amount: plan === 'free' ? 0 : plan === 'premium' ? 99000 : 299000,
          currency: 'VND'
        },
        autoRenew: true
      });
    }
    console.log('Đã tạo subscriptions');

    // Tạo presentations mẫu cho mỗi user
    for (const user of users) {
      await Presentation.create({
        title: `Presentation của ${user.name}`,
        description: 'Presentation mẫu',
        owner: user._id,
        slides: [
          {
            type: 'text',
            content: {
              title: 'Slide đầu tiên',
              content: 'Nội dung mẫu'
            },
            order: 1,
            style: {
              backgroundColor: '#ffffff',
              textColor: '#000000'
            }
          }
        ],
        theme: 'default',
        status: 'draft',
        isPublic: false,
        tags: ['sample']
      });
    }
    console.log('Đã tạo presentations mẫu');

    console.log('\nThông tin đăng nhập:');
    console.log('-------------------');
    sampleData.users.forEach(user => {
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${user.password}`);
      console.log('-------------------');
    });

    console.log('\nKhởi tạo dữ liệu thành công!');
  } catch (error) {
    console.error('Lỗi khi khởi tạo dữ liệu:', error);
  } finally {
    // Đóng kết nối
    mongoose.connection.close();
  }
}

// Chạy hàm khởi tạo
initializeDatabase(); 