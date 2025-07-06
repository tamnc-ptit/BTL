# Hệ thống Quản lý Nhà hàng - Frontend

## Tổng quan

Đây là giao diện người dùng hiện đại cho hệ thống quản lý nhà hàng, được xây dựng bằng HTML, CSS và JavaScript thuần. Hệ thống hỗ trợ đầy đủ các chức năng CRUD cho tất cả các module và được thiết kế để tương thích với schema database SQL Server.

## Cấu trúc dự án

```
frontend/
├── index.html          # Trang chính với layout
├── style.css           # Styles toàn bộ ứng dụng
├── main.js             # Controller chính, routing
├── api.js              # Các hàm gọi API
├── utils.js            # Các hàm tiện ích
├── modules/            # Các module chức năng
│   ├── dashboard.js    # Trang tổng quan
│   ├── nhahang.js      # Quản lý nhà hàng
│   ├── nhanvien.js     # Quản lý nhân viên
│   ├── banan.js        # Quản lý bàn ăn
│   ├── khachhang.js    # Quản lý khách hàng
│   ├── thucdon.js      # Quản lý thực đơn
│   ├── hoadon.js       # Quản lý hóa đơn
│   └── danhgia.js      # Quản lý đánh giá
├── README.md           # File hướng dẫn này
└── database_schema.sql # Schema database
```

## Database Schema

Hệ thống sử dụng 9 bảng chính:

### 🏢 **NhaHang** (Nhà hàng)
- `MaNhaHang` (PK): Mã nhà hàng
- `TenNhaHang`: Tên nhà hàng
- `DiaChi`: Địa chỉ
- `SoDienThoai`: Số điện thoại

### 👥 **NhanVien** (Nhân viên)
- `MaNhanVien` (PK): Mã nhân viên
- `TenNhanVien`: Tên nhân viên
- `Luong`: Lương
- `ChucVu`: Chức vụ
- `CaLamViec`: Ca làm việc
- `TrangThai`: Trạng thái (0: Nghỉ, 1: Làm)
- `MaNhaHang` (FK): Tham chiếu đến NhaHang

### 🪑 **BanAn** (Bàn ăn)
- `MaBanAn` (PK): Mã bàn ăn
- `TrangThai`: Trạng thái (0: Không có người, 1: Có người)
- `SucChua`: Sức chứa
- `MaNhaHang` (FK): Tham chiếu đến NhaHang

### 👤 **KhachHang** (Khách hàng)
- `MaKhachHang` (PK): Mã khách hàng
- `TenKhachHang`: Tên khách hàng
- `SoDienThoai`: Số điện thoại

### 🍽️ **ThucDon** (Thực đơn)
- `TenMon` (PK): Tên món
- `Loai`: Loại món
- `GiaTien`: Giá tiền

### 🧾 **HoaDon** (Hóa đơn)
- `MaHoaDon` (PK): Mã hóa đơn
- `ThoiGianThanhToan`: Thời gian thanh toán
- `TongTien`: Tổng tiền
- `MaNhanVien` (FK): Tham chiếu đến NhanVien
- `MaBan` (FK): Tham chiếu đến BanAn
- `MaKhachHang` (FK): Tham chiếu đến KhachHang

### 📋 **ChiTietHoaDon** (Chi tiết hóa đơn)
- `MaHoaDon` (PK, FK): Tham chiếu đến HoaDon
- `TenMon` (PK, FK): Tham chiếu đến ThucDon
- `SoLuong`: Số lượng

### 🔗 **PhucVu** (Phục vụ)
- `MaNhanVien` (PK, FK): Tham chiếu đến NhanVien
- `MaBan` (PK, FK): Tham chiếu đến BanAn

### 🔗 **SuDung** (Sử dụng)
- `MaBan` (PK, FK): Tham chiếu đến BanAn
- `MaKhachHang` (PK, FK): Tham chiếu đến KhachHang

### ⭐ **DanhGia** (Đánh giá)
- `MaKhachHang` (PK, FK): Tham chiếu đến KhachHang
- `MaBan` (PK, FK): Tham chiếu đến BanAn
- `DanhGia`: Nội dung đánh giá

## Tính năng

### 🏠 Dashboard (Tổng quan)
- Hiển thị thống kê tổng quan
- Số liệu các module chính
- Biểu đồ và báo cáo nhanh

### 🏢 Quản lý Nhà hàng
- Thêm, sửa, xóa thông tin nhà hàng
- Quản lý địa chỉ, liên hệ
- Mã nhà hàng tự định danh

### 👥 Quản lý Nhân viên
- Quản lý thông tin nhân viên
- Chức vụ, lương, ca làm việc
- Liên kết với nhà hàng
- Trạng thái làm việc

### 🪑 Quản lý Bàn ăn
- Quản lý số bàn, sức chứa
- Trạng thái sử dụng
- Liên kết với nhà hàng

### 👤 Quản lý Khách hàng
- Thông tin khách hàng
- Lịch sử giao dịch
- Thông tin liên hệ

### 🍽️ Quản lý Thực đơn
- Danh sách món ăn
- Phân loại món
- Giá cả và mô tả

### 🧾 Quản lý Hóa đơn
- Tạo và quản lý hóa đơn
- Chi tiết đơn hàng
- Liên kết nhân viên, bàn, khách hàng
- Tính tổng tiền tự động

### ⭐ Quản lý Đánh giá
- Đánh giá từ khách hàng
- Liên kết với bàn ăn
- Nội dung phản hồi

## Cách sử dụng

### 1. Thiết lập Database
```sql
-- Chạy file database_schema.sql để tạo database
-- Hoặc import schema từ file database_schema.sql
```

### 2. Khởi chạy Frontend
```bash
# Mở file index.html trong trình duyệt
# Hoặc sử dụng live server
npx live-server frontend/
```

### 3. Kết nối API
- Đảm bảo backend đang chạy trên `http://localhost:8000`
- Có thể thay đổi URL API trong file `api.js`

### 4. Sử dụng giao diện
- Sử dụng sidebar để chuyển đổi giữa các module
- Mỗi module có các chức năng CRUD đầy đủ
- Responsive design, hoạt động tốt trên mobile

## Tính năng kỹ thuật

### 🎨 UI/UX
- Thiết kế hiện đại, responsive
- Sidebar navigation với icons
- Modal dialogs chuyên nghiệp
- Loading states và notifications
- Form validation

### 🔧 JavaScript
- Module pattern architecture
- ES6+ features (async/await, destructuring)
- Error handling robust
- API integration với mapping field names
- Dynamic content loading

### 📱 Responsive
- Mobile-first design
- Breakpoints: 768px, 1024px
- Touch-friendly interface
- Collapsible sidebar

### 🚀 Performance
- Lazy loading modules
- Optimized API calls
- Minimal DOM manipulation
- Efficient data mapping

## Cấu hình

### API Endpoint
Thay đổi trong file `api.js`:
```javascript
const API_BASE = 'http://your-api-url:port';
```

### Database Field Mapping
API functions tự động map giữa frontend field names và database column names:
- Frontend: `tenNhaHang` → Database: `TenNhaHang`
- Frontend: `maNhanVien` → Database: `MaNhanVien`
- etc.

### Customization
- Màu sắc: Chỉnh sửa CSS variables trong `style.css`
- Icons: Sử dụng Font Awesome
- Layout: Tùy chỉnh trong `index.html`

## Troubleshooting

### Lỗi thường gặp

1. **Không kết nối được API**
   - Kiểm tra backend có đang chạy không
   - Kiểm tra URL API trong `api.js`
   - Kiểm tra CORS settings

2. **Field mapping errors**
   - Đảm bảo database schema khớp với `database_schema.sql`
   - Kiểm tra API response format
   - Xem console errors

3. **Module không load**
   - Kiểm tra console errors
   - Đảm bảo tất cả file JS được import đúng
   - Kiểm tra network tab

### Debug
- Mở Developer Tools (F12)
- Kiểm tra Console tab cho errors
- Kiểm tra Network tab cho API calls
- Kiểm tra Application tab cho storage

## Phát triển

### Thêm module mới
1. Tạo file trong thư mục `modules/`
2. Export function `initModuleName()`
3. Import trong `main.js`
4. Thêm vào module registry
5. Thêm navigation item trong `index.html`
6. Cập nhật API mapping trong `api.js`

### Customization
- Styles: Chỉnh sửa `style.css`
- Components: Tạo trong `utils.js`
- API: Mở rộng `api.js`
- Database: Cập nhật `database_schema.sql`

## Changelog

### v2.0.0 (Current)
- ✅ Cập nhật schema database đúng
- ✅ Loại bỏ bảng thừa HoaDon_Ban
- ✅ Sửa field mapping giữa frontend và database
- ✅ Cải thiện error handling
- ✅ Thêm sample data

### v1.0.0
- ✅ Giao diện hiện đại với sidebar
- ✅ 8 module chức năng đầy đủ
- ✅ Responsive design
- ✅ CRUD operations

## License

MIT License - Xem file LICENSE để biết thêm chi tiết.

## Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra documentation này
2. Xem console errors
3. Đảm bảo database schema đúng
4. Tạo issue với thông tin chi tiết 