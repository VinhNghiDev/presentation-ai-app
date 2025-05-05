# Backend Server cho Presentation AI App

Backend server này xử lý các gọi API tới OpenAI, giúp tăng cường bảo mật bằng cách giữ API key ở phía server thay vì yêu cầu người dùng cung cấp.

## Tính năng

- API tạo bài thuyết trình tự động
- API nâng cao nội dung slide
- API gợi ý từ khóa hình ảnh
- Bảo vệ API key của OpenAI

## Yêu cầu

- Node.js (v14.0.0 trở lên)
- npm (v6.0.0 trở lên)
- API key của OpenAI

## Cài đặt

1. Clone project và chuyển đến thư mục server:

```bash
cd presentation-ai-app/server
```

2. Cài đặt các dependencies:

```bash
npm install
```

3. Tạo file `.env` trong thư mục server với nội dung sau:

```
PORT=5000
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_API_URL=https://api.openai.com/v1
DEFAULT_MODEL=gpt-4
NODE_ENV=development
```

Thay `your_openai_api_key_here` bằng API key của OpenAI của bạn. Bạn có thể lấy API key từ [OpenAI Platform](https://platform.openai.com/api-keys).

## Chạy server

1. Chạy server trong chế độ development:

```bash
npm run dev
```

2. Hoặc chạy server trong chế độ production:

```bash
npm start
```

Server sẽ chạy tại địa chỉ mặc định: http://localhost:5000

## Cấu hình frontend

Để frontend có thể kết nối với backend, hãy tạo file `.env` trong thư mục gốc của project (presentation-ai-app) với nội dung:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## API Endpoints

### Kiểm tra trạng thái server

```
GET /api/health
```

### Tạo bài thuyết trình

```
POST /api/presentation/generate
```

Body:
```json
{
  "topic": "Chủ đề bài thuyết trình",
  "style": "professional",
  "slides": 5,
  "language": "vi",
  "purpose": "business",
  "audience": "general",
  "includeCharts": true,
  "includeImages": true
}
```

### Nâng cao nội dung slide

```
POST /api/presentation/enhance
```

Body:
```json
{
  "content": "Nội dung cần nâng cao",
  "type": "improve" // Có thể là: improve, concise, elaborate, professional, creative
}
```

### Gợi ý từ khóa hình ảnh

```
POST /api/presentation/image-keywords
```

Body:
```json
{
  "slideContent": "Nội dung slide để gợi ý từ khóa hình ảnh"
}
```

## Bảo mật

- API key của OpenAI được lưu trong biến môi trường và chỉ được sử dụng ở phía server
- Người dùng không cần cung cấp API key khi sử dụng ứng dụng
- Nếu triển khai lên production, hãy đảm bảo file `.env` không được commit lên git
- Nên cấu hình CORS cho phép chỉ các domain cụ thể được phép gọi API

## Nhắc nhở

- Sử dụng API của OpenAI sẽ phát sinh chi phí. Hãy kiểm tra [pricing của OpenAI](https://openai.com/pricing) để biết thêm chi tiết.
- Nên thiết lập giới hạn sử dụng (rate limiting) nếu triển khai ứng dụng cho nhiều người dùng.
- Trong môi trường production, nên sử dụng HTTPS để bảo vệ dữ liệu truyền tải.

## Hỗ trợ

Nếu bạn gặp vấn đề trong quá trình cài đặt hoặc sử dụng server, vui lòng tạo issue trên GitHub hoặc liên hệ với đội phát triển. 