from fastapi import FastAPI # thư viện chính để xây dựng REST API.
from fastapi.middleware.cors import CORSMiddleware # cho phép frontend (HTML/JS) truy cập dữ liệu từ backend ở địa chỉ khác.
from app.routes import ( # Import các router từ thư mục routes
    nhahang_route,
    nhanvien_route,
    khachhang_route,
    thucdon_route,
    banan_route,
    hoadon_route,
    chitiethoadon_route,
    hoadon_ban_route,
    phucvu_route,
    sudung_route,
    danhgia_route
)

app = FastAPI(title="QUẢN LÝ NHÀ HÀNG API", version="1.0.0") # Tạo một ứng dụng FastAPI với tiêu đề và phiên bản

app.add_middleware(
    CORSMiddleware, # Thêm middleware CORS để cho phép các trang web khác truy cập API này.
    # CORS (Cross-Origin Resource Sharing) là một cơ chế bảo mật của trình duyệt web,
    # cho phép hoặc từ chối các yêu cầu từ các nguồn gốc khác nhau.
    # Trong trường hợp này, chúng ta cho phép tất cả các nguồn gốc.
    # Điều này có nghĩa là bất kỳ trang web nào cũng có thể gọi đến API này
    # mà không bị chặn bởi chính sách CORS.
    # Điều này hữu ích trong quá trình phát triển và thử nghiệm,
    # nhưng trong môi trường sản xuất, bạn nên giới hạn các nguồn gốc được phép để bảo mật hơn.
    # Cấu hình CORS: 
    # - allow_origins: Danh sách các nguồn gốc được phép truy cập API.
    #   Ở đây, chúng ta cho phép tất cả các nguồn gốc bằng cách
    #   sử dụng dấu sao (*). Điều này có nghĩa là bất kỳ trang web nào cũng có thể gọi đến API này.
    # - allow_credentials: Cho phép gửi cookie và thông tin xác thực khác trong các yêuc cầu CORS.
    # - allow_methods: Danh sách các phương thức HTTP được phép (GET, POST, PUT, DELETE, v.v.).
    #   Ở đây, chúng ta cho phép tất cả các phương thức bằng cách sử dụng dấu sao (*).
    # - allow_headers: Danh sách các tiêu đề HTTP được phép trong yêu cầu C ORS.
    #   Ở đây, chúng ta cho phép tất cả các tiêu đề bằng cách sửng dấu sao (*).
    #   Điều này có nghĩa là bất kỳ tiêu đề nào cũng có thể được gửi trong  # yêu cầu CORS.
    #   Điều này hữu ích khi bạn cần gửi các tiêu đề tùy chỉnh trong yêu cầu CORS.
    #   Tuy nhiên, trong môi trường sản xuất, bạn nên giới hạn các tiêu đề  # được phép để bảo mật hơn.
    allow_origins=["*"], 
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"],
)
# Đăng ký tất cả các router tương ứng với bảng
# Các router này sẽ xử lý các yêu cầu HTTP đến các endpoint tương ứng với các bảng trong cơ sở dữ liệu.

app.include_router(nhahang_route.router, prefix="/nhahang", tags=["NhaHang"])
app.include_router(nhanvien_route.router, prefix="/nhanvien", tags=["NhanVien"])
app.include_router(khachhang_route.router, prefix="/khachhang", tags=["KhachHang"])
app.include_router(thucdon_route.router, prefix="/thucdon", tags=["ThucDon"])
app.include_router(banan_route.router, prefix="/banan", tags=["BanAn"])
app.include_router(hoadon_route.router, prefix="/hoadon", tags=["HoaDon"])
app.include_router(chitiethoadon_route.router, prefix="/chitiethoadon", tags=["ChiTietHoaDon"])
app.include_router(hoadon_ban_route.router, prefix="/hoadonban", tags=["HoaDon_Ban"])
app.include_router(phucvu_route.router, prefix="/phucvu", tags=["PhucVu"])
app.include_router(sudung_route.router, prefix="/sudung", tags=["SuDung"])
app.include_router(danhgia_route.router, prefix="/danhgia", tags=["DanhGia"])

@app.get("/")
def root():
    return {"message": "Hello World"}


