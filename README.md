# Presentation AI App

Ứng dụng tạo bài thuyết trình tự động sử dụng AI để tạo nội dung chất lượng cao.

## Tính năng mới đã cải tiến

Ứng dụng đã được nâng cấp với các tính năng mới để tạo nội dung chất lượng cao hơn, chuyên sâu và đáng tin cậy:

1. **Knowledge Service** - Dịch vụ thu thập kiến thức chuyên sâu:
   - Dữ liệu thị trường và thống kê cập nhật từ các nguồn đáng tin cậy
   - Nghiên cứu trường hợp điển hình từ các công ty thành công trong nhiều lĩnh vực
   - Phân tích xu hướng ngành dựa trên dữ liệu thực tế
   - Tài liệu tham khảo tự động tạo với nguồn đáng tin cậy

2. **Cải thiện API OpenAI**:
   - Nâng cấp lên sử dụng GPT-4 thay vì GPT-3.5 để có nội dung sâu hơn
   - Prompt được cải thiện để tạo nội dung chất lượng cao hơn
   - Xử lý lỗi tốt hơn với fallback models khi cần thiết

3. **Cải tiến xử lý slide**:
   - Phân loại slide thông minh dựa trên tiêu đề và vị trí
   - Tăng cường nội dung cho các slide đặc biệt (thống kê, case study, xu hướng)
   - Tự động tạo slide tài liệu tham khảo với nguồn đáng tin cậy

4. **Giao diện người dùng cải tiến**:
   - Thêm thông báo tiến trình chi tiết khi tạo bài thuyết trình
   - Giao diện tạo bài thuyết trình được nâng cấp với các gợi ý
   - Xử lý lỗi tốt hơn và thông báo rõ ràng hơn

## Cấu trúc dịch vụ

Ứng dụng sử dụng 3 dịch vụ chính:

1. **aiService**: Điều phối quá trình tạo bài thuyết trình, thu thập kiến thức và tạo nội dung
2. **knowledgeService**: Cung cấp dữ liệu chuyên sâu từ nhiều nguồn đáng tin cậy
3. **openaiService**: Tương tác với API OpenAI để tạo nội dung

## Hướng dẫn sử dụng

1. Mở ứng dụng và nhấp vào "Tạo bài thuyết trình"
2. Nhập chủ đề chi tiết (càng cụ thể càng tốt)
3. Chọn các tùy chọn phù hợp (phong cách, số lượng slide, v.v.)
4. Nhấp vào "Tạo bài thuyết trình" và đợi quá trình hoàn tất

## Mẹo tạo nội dung chất lượng cao

- Sử dụng chủ đề cụ thể, chi tiết thay vì chung chung
  - Tốt: "Xu hướng digital marketing năm 2023 cho doanh nghiệp vừa và nhỏ" 
  - Kém: "Digital marketing"
- Chọn đối tượng phù hợp để nội dung được điều chỉnh phù hợp
- Sử dụng từ 8-12 slides để có nội dung cân đối
- Bật tùy chọn biểu đồ để tăng tính trực quan cho số liệu

## Các lĩnh vực tối ưu

Ứng dụng tạo nội dung chuyên sâu tốt nhất cho các lĩnh vực:
- Công nghệ và IT
- Kinh doanh và Khởi nghiệp
- Marketing và Truyền thông
- Giáo dục và Đào tạo
- Sức khỏe và Y tế

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
DEFAULT_MODEL=gpt-3.5-turbo
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
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
REACT_APP_USE_FALLBACK=true
```

Thay `your_openai_api_key_here` bằng API key của OpenAI của bạn.
* `REACT_APP_USE_FALLBACK=true`: Khi không có API key hoặc API không khả dụng, ứng dụng sẽ tạo dữ liệu mẫu.

4. Chạy ứng dụng:

```bash
npm start
```

Frontend sẽ chạy tại địa chỉ: http://localhost:3000

## Khắc phục lỗi chức năng tạo bài thuyết trình tự động

Nếu chức năng tạo bài thuyết trình tự động không hoạt động, hãy kiểm tra các điểm sau:

1. **API Key**: Đảm bảo bạn đã thiết lập API key cho OpenAI trong file `.env`:
   ```
   REACT_APP_OPENAI_API_KEY=your_actual_openai_key
   ```

2. **Cấu hình Fallback**: Nếu không muốn sử dụng API OpenAI (do chi phí hoặc giới hạn), bạn có thể thiết lập:
   ```
   REACT_APP_USE_FALLBACK=true
   ```
   Điều này sẽ khiến ứng dụng tạo dữ liệu mẫu thay vì gọi OpenAI API.

3. **Khởi động lại sau khi cập nhật môi trường**: Sau khi thay đổi file `.env`, khởi động lại ứng dụng:
   ```bash
   npm start
   ```

4. **Kiểm tra Console**: Mở Developer Tools trong trình duyệt (F12) và xem Console để tìm thông báo lỗi.

5. **Thử Model nhẹ hơn**: Nếu bạn gặp vấn đề về giới hạn hoặc token, hãy thử sử dụng model `gpt-3.5-turbo` thay vì `gpt-4`.

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
