# Presentation AI App

Ứng dụng tạo và quản lý bài thuyết trình thông minh sử dụng AI để tự động hóa nội dung, tiết kiệm thời gian và công sức cho người dùng.

## Tính năng

- Tạo bài thuyết trình tự động dựa trên AI
- Nâng cao nội dung slide với các kiểu tùy chỉnh
- Đề xuất hình ảnh, biểu đồ phù hợp với nội dung
- Hỗ trợ nhiều template, phong cách thiết kế
- Có khả năng tùy chỉnh linh hoạt (kéo thả, chỉnh sửa)
- Xuất file dưới nhiều định dạng (PDF, PNG)
- Hỗ trợ trình chiếu trực tiếp từ phần mềm

## Kiến trúc

Dự án gồm hai phần chính:
1. **Frontend**: Ứng dụng React
2. **Backend**: Server Node.js/Express xử lý các gọi API đến OpenAI

## Cài đặt và Chạy

### Yêu cầu

- Node.js (v14.0.0 trở lên)
- npm (v6.0.0 trở lên)
- API key của OpenAI (cho backend)

### Cài đặt Backend

1. Chuyển đến thư mục server:

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

Thay `your_openai_api_key_here` bằng API key của OpenAI của bạn.

4. Chạy server:

```bash
npm run dev
```

Backend sẽ chạy tại địa chỉ: http://localhost:5000

### Cài đặt Frontend

1. Từ thư mục gốc của dự án:

```bash
cd presentation-ai-app
```

2. Cài đặt các dependencies:

```bash
npm install
```

3. Tạo file `.env` trong thư mục gốc với nội dung:

```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Chạy ứng dụng:

```bash
npm start
```

Frontend sẽ chạy tại địa chỉ: http://localhost:3000

## Sử dụng ứng dụng

1. Truy cập vào ứng dụng qua trình duyệt tại http://localhost:3000
2. Đăng nhập hoặc sử dụng dưới dạng khách
3. Tại trang chính, chọn "Tạo bài thuyết trình bằng AI"
4. Nhập chủ đề, chọn phong cách và cấu hình khác
5. Nhấn "Tạo bài thuyết trình" và đợi AI xử lý
6. Chỉnh sửa bài thuyết trình đã tạo theo ý muốn
7. Xuất bài thuyết trình dưới dạng PDF hoặc hình ảnh PNG

## Tính năng AI

Ứng dụng sử dụng OpenAI API để:
- Tạo nội dung bài thuyết trình từ chủ đề
- Nâng cao và cải thiện nội dung các slide
- Đề xuất từ khóa hình ảnh phù hợp
- Tạo dữ liệu biểu đồ minh họa

## Môi trường phát triển

- React.js cho Frontend
- Node.js/Express cho Backend
- OpenAI API cho dịch vụ AI
- Bootstrap và CSS tùy chỉnh cho giao diện

## Giấy phép

[MIT](LICENSE)

## Thông tin thêm

Để biết thêm chi tiết về API Backend, xem [README trong thư mục server](./server/README.md).

## Liên hệ

Nếu bạn có câu hỏi hoặc góp ý, vui lòng tạo issue trên GitHub hoặc liên hệ với đội phát triển.
