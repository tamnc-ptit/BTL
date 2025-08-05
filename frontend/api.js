const API_BASE = 'http://localhost:8000';

// Base API functions with better error handling
export const api = {
    getAll: async (endpoint) => {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return await res.json();
        } catch (error) {
            console.error(`Error fetching from ${endpoint}:`, error);
            throw new Error(`Không thể tải dữ liệu từ ${endpoint}`);
        }
    },

    getById: async (endpoint, id) => {
        try {
             const encodedId = encodeURIComponent(id);
            const res = await fetch(`${API_BASE}${endpoint}${encodedId}`);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return await res.json();
        } catch (error) {
            console.error(`Error fetching by ID from ${endpoint}:`, error);
            throw new Error(`Không thể tải dữ liệu từ ${endpoint}`);
        }
    },

    create: async (endpoint, data) => {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error('API Error Response:', errorData);
                throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${res.status}`);
            }
            return await res.json();
        } catch (error) {
            console.error(`Error creating in ${endpoint}:`, error);
            throw new Error(`Không thể tạo dữ liệu trong ${endpoint}: ${error.message}`);
        }
    },

    update: async (endpoint, id, data) => {
        try {
            const encodedId = encodeURIComponent(id);
            console.log(`Updating ${endpoint}${encodedId} with data:`, data);
            
            const res = await fetch(`${API_BASE}${endpoint}${encodedId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            console.log(`Response status: ${res.status}`);
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error('API Error Response:', errorData);
                
                // Handle 422 validation errors
                if (res.status === 422 && errorData.detail) {
                    const validationErrors = Array.isArray(errorData.detail) 
                        ? errorData.detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join(', ')
                        : errorData.detail;
                    throw new Error(`Dữ liệu không hợp lệ: ${validationErrors}`);
                }
                
                throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${res.status}`);
            }
            return await res.json();
        } catch (error) {
            console.error(`Error updating in ${endpoint}:`, error);
            throw new Error(`Không thể cập nhật dữ liệu trong ${endpoint}: ${error.message}`);
        }
    },

    delete: async (endpoint, id) => {
        try {
            const encodedId = encodeURIComponent(id);
            const res = await fetch(`${API_BASE}${endpoint}${encodedId}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json' }
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error('API Error Response:', errorData);
                throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${res.status}`);
            }
            return await res.json();
        } catch (error) {
            console.error(`Error deleting from ${endpoint}:`, error);
            throw new Error(`Không thể xóa dữ liệu từ ${endpoint}: ${error.message}`);
        }
    },

    updateByCompositeKey: (maKhachHang, maBan, data) => api.update(`/danhgia/${maKhachHang}/${maBan}`, '', data)
};

// === API cho từng bảng theo schema thực tế ===

export const nhaHangAPI = {
    getAll: () => api.getAll('/nhahang/'),
    getById: (id) => api.getById('/nhahang/', id),
    create: (data) => api.create('/nhahang/', {
        MaNhaHang: data.maNhaHang,
        TenNhaHang: data.tenNhaHang,
        DiaChi: data.diaChi,
        SoDienThoai: data.soDienThoai
    }),
    update: (id, data) => api.update('/nhahang/', id, {
        MaNhaHang: id,
        TenNhaHang: data.tenNhaHang,
        DiaChi: data.diaChi,
        SoDienThoai: data.soDienThoai
    }),
    delete: (id) => api.delete('/nhahang/', id)
};

export const nhanVienAPI = {
    getAll: () => api.getAll('/nhanvien/'),
    getById: (id) => api.getById('/nhanvien/', id),
    create: (data) => api.create('/nhanvien/', {
        MaNhanVien: data.maNhanVien,
        TenNhanVien: data.tenNhanVien,
        Luong: data.luong,
        ChucVu: data.chucVu,
        CaLamViec: data.caLamViec,
        TrangThai: data.trangThai,
        MaNhaHang: data.maNhaHang
    }),
    update: (id, data) => api.update('/nhanvien/', id, {
        MaNhanVien: id,
        TenNhanVien: data.tenNhanVien,
        Luong: data.luong,
        ChucVu: data.chucVu,
        CaLamViec: data.caLamViec,
        TrangThai: data.trangThai,
        MaNhaHang: data.maNhaHang
    }),
    delete: (id) => api.delete('/nhanvien/', id)
};

export const banAnAPI = {
    getAll: () => api.getAll('/banan/'),
    getById: (id) => api.getById('/banan/', id),
    create: (data) => api.create('/banan/', {
        MaBanAn: data.maBanAn,
        TrangThai: data.trangThai,
        SucChua: data.sucChua,
        MaNhaHang: data.maNhaHang
    }),
    update: (id, data) => api.update('/banan/', id, {
        MaBanAn: id,
        TrangThai: data.trangThai,
        SucChua: data.sucChua,
        MaNhaHang: data.maNhaHang
    }),
    delete: (id) => api.delete('/banan/', id)
};

export const khachHangAPI = {
    getAll: () => api.getAll('/khachhang/'),
    getById: (id) => api.getById('/khachhang/', id),
    create: (data) => api.create('/khachhang/', {
        MaKhachHang: data.maKhachHang,
        TenKhachHang: data.tenKhachHang,
        SoDienThoai: data.soDienThoai
    }),
    update: (id, data) => api.update('/khachhang/', id, {
        MaKhachHang: id,
        TenKhachHang: data.tenKhachHang,
        SoDienThoai: data.soDienThoai
    }),
    delete: (id) => api.delete('/khachhang/', id)
};

export const thucDonAPI = {
    getAll: () => api.getAll('/thucdon/'),
    getById: (id) => api.getById('/thucdon/', id),
    create: (data) => api.create('/thucdon/', {
        TenMon: data.tenMon,
        Loai: data.loai,
        GiaTien: data.giaTien
    }),
    update: (id, data) => api.update('/thucdon/', id, {
        TenMon: id,
        Loai: data.loai,
        GiaTien: data.giaTien
    }),
    delete: (id) => api.delete('/thucdon/', id)
};

export const hoaDonAPI = {
    getAll: () => api.getAll('/hoadon/'),
    getById: (id) => api.getById('/hoadon/', id),
    create: (data) => api.create('/hoadon/', {
        MaHoaDon: data.maHoaDon,
        ThoiGianThanhToan: data.thoiGianThanhToan,
        MaNhanVien: data.maNhanVien,
        MaKhachHang: data.maKhachHang
        // TongTien được tính tự động từ chi tiết hóa đơn
    }),
    update: (id, data) => api.update('/hoadon/', id, {
        MaHoaDon: id,
        ThoiGianThanhToan: data.thoiGianThanhToan,
        MaNhanVien: data.maNhanVien,
        MaKhachHang: data.maKhachHang
        // TongTien được tính tự động từ chi tiết hóa đơn
    }),
    delete: (id) => api.delete('/hoadon/', id)
};

export const hoaDonBanAPI = {
    getAll: () => api.getAll('/hoadonban/'),
    getByHoaDon: (maHoaDon) => api.getAll(`/hoadonban/hoadon/${maHoaDon}`),
    create: (data) => api.create('/hoadonban/', {
        MaHoaDon: data.maHoaDon,
        MaBanAn: data.maBanAn
    }),
    update: (maHoaDon, data) => api.update('/hoadonban/', maHoaDon, {
        MaHoaDon: maHoaDon,
        MaBanAn: data.maBanAn
    }),
    delete: (maHoaDon) => api.delete('/hoadonban/', maHoaDon)
};

export const chiTietHoaDonAPI = {
    getAll: () => api.getAll('/chitiethoadon/'),
    getById: (id) => api.getById('/chitiethoadon/', id),
    getByHoaDon: (maHoaDon) => api.getAll(`/chitiethoadon/hoadon/${maHoaDon}`),
    create: (data) => api.create('/chitiethoadon/', {
        MaHoaDon: data.maHoaDon,
        TenMon: data.tenMon,
        SoLuong: data.soLuong
    }),
    update: (id, data) => api.update('/chitiethoadon/', id, {
        MaHoaDon: data.maHoaDon,
        TenMon: data.tenMon,
        SoLuong: data.soLuong
    }),
    delete: (id) => api.delete('/chitiethoadon/', id)
};

export const phucVuAPI = {
    getAll: () => api.getAll('/phucvu/'),
    getById: (id) => api.getById('/phucvu/', id),
    create: (data) => api.create('/phucvu/', {
        MaNhanVien: data.maNhanVien,
        MaBan: data.maBan,
        NgayPhucVu: data.ngayPhucVu
    }),
    update: (id, data) => api.update('/phucvu/', id, {
        MaNhanVien: data.maNhanVien,
        MaBan: data.maBan,
        NgayPhucVu: data.ngayPhucVu
    }),
    delete: (id) => api.delete('/phucvu/', id)
};

export const suDungAPI = {
    getAll: () => api.getAll('/sudung/'),
    getById: (id) => api.getById('/sudung/', id),
    create: (data) => api.create('/sudung/', {
        MaBan: data.maBan,
        MaKhachHang: data.maKhachHang,
        ThoiGianVao: data.thoiGianVao,
        ThoiGianRa: data.thoiGianRa
    }),
    update: (id, data) => api.update('/sudung/', id, {
        MaBan: data.maBan,
        MaKhachHang: data.maKhachHang,
        ThoiGianRa: data.thoiGianRa
    }),
    delete: (id) => api.delete('/sudung/', id)
};

export const danhGiaAPI = {
    getAll: () => api.getAll('/danhgia/'),
    getById: (id) => api.getById('/danhgia/', id),
    getByCompositeKey: (maKhachHang, maBan) => api.getAll(`/danhgia/${maKhachHang}/${maBan}`),
    create: (data) => api.create('/danhgia/', {
        MaKhachHang: data.maKhachHang,
        MaBan: data.maBan,
        DanhGia: data.danhGia
    }),
    update: (id, data) => api.update('/danhgia/', id, data),
    updateByCompositeKey: (maKhachHang, maBan, data) => api.update(`/danhgia/${maKhachHang}/${maBan}/`, '', data),
    delete: (id) => api.delete('/danhgia/', id),
    deleteByCompositeKey: (maKhachHang, maBan) => api.delete(`/danhgia/${maKhachHang}/${maBan}/`, '')
};
