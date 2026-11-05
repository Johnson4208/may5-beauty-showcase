# May5 — Your beauty, our care

Website giới thiệu sản phẩm và dịch vụ chăm sóc sắc đẹp của May5. Trang được viết bằng HTML, CSS và JavaScript thuần, có thể chạy trực tiếp trên GitHub Pages.

## Chạy trên GitHub Pages

1. Mở **Settings → Pages** trong repository.
2. Ở mục **Build and deployment**, chọn **GitHub Actions** làm nguồn triển khai.
3. Mỗi lần đẩy thay đổi lên nhánh `master`, workflow sẽ tự cập nhật website.

Sau lần chạy đầu tiên, địa chỉ website xuất hiện tại **Settings → Pages**.

## Xem trên máy

Mở `index.html` trong trình duyệt. Các đường dẫn ảnh đều nằm trong thư mục `assets`.

Các nút tư vấn mở email tới địa chỉ May5 hiển thị trên bao bì sản phẩm. Website không thu thập thanh toán hay dữ liệu khách hàng.

## Yêu cầu đặt dịch vụ và quản trị

Khách chọn gói, xác nhận giỏ và để lại thông tin liên hệ. Đây là yêu cầu để
May5 gọi xác nhận, thanh toán thực hiện sau. Quản trị viên xem đơn tại
`admin.html`, gọi trực tiếp và cập nhật trạng thái.

### Kết nối dữ liệu trước khi xuất bản

1. Tạo hoặc dùng dự án Supabase riêng cho May5. Chạy `supabase/orders.sql` trong
   SQL Editor bằng tài khoản quản trị dự án. Không đưa schema `may5_private`
   vào danh sách schema được Data API công khai.
2. Trong Authentication, tắt đăng ký công khai và tạo một người dùng Email
   đã xác nhận cho mỗi nhân viên được cấp quyền. Nhân viên tự đặt hoặc nhận
   mật khẩu qua kênh riêng. Lấy ID người dùng từ trang Authentication.
3. Cấp quyền cho từng ID bằng SQL Editor:
   `insert into may5_private.admins (user_id) values ('USER_UUID') on conflict do nothing;`
   Thu hồi quyền bằng cách xóa ID tương ứng khỏi bảng này.
4. Điền URL HTTPS của dự án và **publishable key** vào `order-api.js`. Không
   dùng service-role key, secret key hoặc mật khẩu trong mã nguồn.
5. Trước khi mở nhận đơn, dùng dữ liệu kiểm thử để gửi một yêu cầu, xác nhận
   yêu cầu xuất hiện ở trang quản trị, cập nhật trạng thái và thử đăng nhập
   bằng tài khoản không có quyền. Xóa dữ liệu thử trong SQL Editor.

Giỏ chỉ lưu mã dịch vụ trong trình duyệt. Hồ sơ khách hàng nằm trong schema
riêng. Khách ẩn danh chỉ có quyền gửi yêu cầu. Backend có giới hạn ba yêu
cầu mới mỗi mười phút cho một số điện thoại và dùng mã gửi để chống trùng khi
thử lại. Nếu bị spam từ nhiều số, cần bổ sung CAPTCHA ở phía máy chủ.
