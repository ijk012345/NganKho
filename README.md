# Ngân Khố - Quản lý chi tiêu cá nhân cho sinh viên

Ứng dụng React + Vite chạy trên máy cá nhân. Dữ liệu được lưu bằng `localStorage` của trình duyệt, nên vẫn còn sau khi tắt tab hoặc khởi động lại trình duyệt trên cùng thiết bị/trình duyệt.

## Yêu cầu
- Node.js 18+ (khuyên dùng bản LTS)
- npm

## Chạy local
1. Giải nén thư mục dự án.
2. Mở terminal tại thư mục `quan-ly-chi-tieu-sinh-vien`.
3. Cài thư viện:
   ```bash
   npm install
   ```
4. Chạy website:
   ```bash
   npm run dev
   ```
5. Mở địa chỉ Vite hiển thị trong terminal, thường là `http://localhost:5173`.

## Chức năng
- Giao diện tổng quan với số dư, tổng thu, tổng chi, khoản cố định và giao dịch gần đây.
- Thêm khoản thu/chi; tự động cập nhật số dư.
- Lịch sử giao dịch theo tháng, lọc thu/chi và xóa giao dịch.
- Biểu đồ thu/chi, phân tích theo danh mục, tầm giá giao dịch, khoản chi cao/thấp nhất.
- Danh sách chi cố định, hạn thanh toán và đánh dấu đã trả. Các khoản đã trả tự chuyển xuống cuối danh sách.
- Dữ liệu mẫu để trình diễn, nút khôi phục dữ liệu mẫu.

## Lưu ý
- Đây là bản demo học tập, không có máy chủ hay đồng bộ giữa các thiết bị.
- `localStorage` gắn với trình duyệt và địa chỉ website. Nếu xóa dữ liệu trình duyệt, đổi trình duyệt hoặc đổi thiết bị thì dữ liệu có thể mất/không xuất hiện.
- Đăng nhập, liên kết ngân hàng và AI chưa được triển khai.
