# Backend Server cho Presentation AI App

Backend server cho ứng dụng tạo bài thuyết trình bằng AI, hỗ trợ nhiều nền tảng AI khác nhau.

## Tính năng

- API Endpoint cho tạo bài thuyết trình
- Hỗ trợ đa nền tảng AI: OpenAI, Claude, Gemini
- Xử lý và phân tích cú pháp phản hồi AI
- Chức năng nâng cao nội dung
- Chế độ demo fallback khi không có API key

## Cài đặt

1. Cài đặt các dependencies:

```bash
npm install
```

2. Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

3. Cập nhật file `.env` với API key của bạn:

```
# Cấu hình server
PORT=5000
NODE_ENV=development

# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here  # Thay thế bằng API key của bạn
OPENAI_API_URL=https://api.openai.com/v1
DEFAULT_MODEL=gpt-4o

# Claude API
CLAUDE_API_KEY=your_claude_api_key_here  # Thay thế bằng API key của bạn
CLAUDE_API_URL=https://api.anthropic.com/v1/messages
DEFAULT_CLAUDE_MODEL=claude-3-haiku-20240307

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here  # Thay thế bằng API key của bạn
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models
DEFAULT_GEMINI_MODEL=gemini-pro

# Cấu hình fallback
USE_FALLBACK=false
```

Nếu bạn không có API key, server sẽ chạy ở chế độ demo, trả về dữ liệu mẫu.

## Chạy server

### Chế độ phát triển (với nodemon):

```bash
npm run dev
```

### Chế độ sản xuất:

```bash
npm start
```

Server sẽ chạy tại cổng đã cấu hình trong file `.env` (mặc định là 5000).

## API Endpoints

### Kiểm tra trạng thái server

```
GET /api/health
```

Trả về trạng thái server và thông tin về các API có sẵn.

### Tạo bài thuyết trình

```
POST /api/presentation/generate
```

Body:

```json
{
  "topic": "Chủ đề bài thuyết trình",
  "style": "professional",
  "slides": 10,
  "language": "vi",
  "purpose": "business",
  "audience": "general",
  "includeCharts": true,
  "includeImages": true,
  "provider": "OPENAI"  // Có thể là "OPENAI", "CLAUDE", "GEMINI"
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
  "type": "improve",
  "provider": "OPENAI"  // Có thể là "OPENAI", "CLAUDE", "GEMINI"
}
```

### Gọi AI API chung

```
POST /api/ai/completion
```

Body:

```json
{
  "options": {
    "model": "gpt-4o",
    "messages": [
      {
        "role": "system",
        "content": "Bạn là trợ lý AI hữu ích."
      },
      {
        "role": "user",
        "content": "Prompt cho AI"
      }
    ],
    "temperature": 0.7,
    "maxTokens": 3000
  },
  "provider": "OPENAI",  // Có thể là "OPENAI", "CLAUDE", "GEMINI" 
  "apiKey": "optional_api_key"  // Tùy chọn, nếu không cung cấp, sẽ sử dụng key từ biến môi trường
}
```

## Hỗ trợ đa nền tảng AI

Server hỗ trợ 3 nền tảng AI chính:

1. **OpenAI** - Dùng các model của OpenAI như GPT-3.5 Turbo, GPT-4, GPT-4o
2. **Claude** - Dùng các model của Anthropic như Claude 3 Haiku, Sonnet, và Opus
3. **Gemini** - Dùng các model của Google như Gemini Pro

Bạn có thể chọn nền tảng AI thông qua tham số `provider` trong yêu cầu API. Nếu không chỉ định, server sẽ sử dụng OpenAI làm mặc định.

## Fallback tự động

Nếu API key không hợp lệ hoặc gọi API thất bại, server sẽ:

1. Thử lại với model dự phòng (ví dụ: từ GPT-4 xuống GPT-3.5 Turbo)
2. Thử API khác nếu được cấu hình
3. Trả về dữ liệu mẫu nếu tất cả đều thất bại

## Biến môi trường

| Biến                | Mô tả                                      | Mặc định                                     |
| ------------------- | ------------------------------------------ | -------------------------------------------- |
| PORT                | Cổng chạy server                          | 5000                                         |
| NODE_ENV            | Môi trường chạy                           | development                                  |
| OPENAI_API_KEY      | API key cho OpenAI                        | (không có mặc định)                          |
| OPENAI_API_URL      | URL gốc cho API OpenAI                    | https://api.openai.com/v1                    |
| DEFAULT_MODEL       | Model mặc định của OpenAI                 | gpt-4o                                       |
| CLAUDE_API_KEY      | API key cho Claude                        | (không có mặc định)                          |
| CLAUDE_API_URL      | URL gốc cho API Claude                    | https://api.anthropic.com/v1/messages        |
| DEFAULT_CLAUDE_MODEL| Model mặc định của Claude                 | claude-3-haiku-20240307                      |
| GEMINI_API_KEY      | API key cho Gemini                        | (không có mặc định)                          |
| GEMINI_API_URL      | URL gốc cho API Gemini                    | https://generativelanguage.googleapis.com/v1beta/models |
| DEFAULT_GEMINI_MODEL| Model mặc định của Gemini                 | gemini-pro                                   |
| USE_FALLBACK        | Dùng dữ liệu mẫu khi không có API key     | false                                        |

## Cấu hình frontend

Để frontend có thể kết nối với backend, hãy tạo file `.env` trong thư mục gốc của project (presentation-ai-app) với nội dung:

```
REACT_APP_API_URL=http://localhost:5000/api
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