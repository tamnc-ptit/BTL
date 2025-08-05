1.
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
}
 PHÂN TÍCH TỪNG DÒNG
 getAll: async (endpoint) => {
Đây là định nghĩa một hàm bất đồng bộ (async) có tên getAll.
Nó nhận một tham số duy nhất là endpoint (ví dụ /nhahang/, /thucdon/).
Dùng async để có thể gọi await fetch(...) bên trong.

 try {
Mở đầu khối try...catch để xử lý lỗi nếu xảy ra trong quá trình gọi API.
 const res = await fetch(\${API_BASE}${endpoint}`);`
Gửi yêu cầu HTTP GET đến API backend bằng fetch.
API_BASE là http://localhost:8000 (khai báo ở đầu file).
endpoint là phần đuôi ví dụ /nhahang/, /khachhang/, v.v.

Dòng này đang tạo đường dẫn đầy đủ:
Ví dụ: http://localhost:8000/nhahang/

await: Đợi kết quả trả về trước khi chạy tiếp.

 if (!res.ok) { throw new Error(...) }
res.ok là true nếu status HTTP là 200–299.

Nếu không phải (ví dụ 404, 500...), thì dòng này sẽ ném ra lỗi (throw error).

Mục tiêu: Không tiếp tục nếu server trả lỗi.

 return await res.json();
Nếu phản hồi OK, lấy dữ liệu JSON từ server bằng res.json().

Dữ liệu sẽ là một danh sách bản ghi (array of object), ví dụ:

[
  { MaNhaHang: 'NH01', TenNhaHang: 'Dê Núi Ninh Bình', ... },
  { MaNhaHang: 'NH02', TenNhaHang: 'Dê Tươi 36', ... }
]
Trả về dữ liệu này để dùng bên ngoài.

} catch (error) {
Nếu bất kỳ lỗi nào xảy ra ở phần try, khối catch này sẽ xử lý.

 console.error(\Error fetching from ${endpoint}:`, error);`
Ghi log lỗi ra console cho lập trình viên dễ debug.

 throw new Error(\Không thể tải dữ liệu từ ${endpoint}`);`
Ném lỗi cụ thể bằng tiếng Việt để hiển thị ra giao diện hoặc báo lỗi cho người dùng biết.

 TÓM TẮT CHỨC NĂNG:
Dòng	Tác dụng
getAll: async (endpoint) => {	Định nghĩa hàm lấy toàn bộ dữ liệu từ API
fetch(...)	Gửi yêu cầu GET đến địa chỉ API
if (!res.ok)	Kiểm tra phản hồi có lỗi không
res.json()	Lấy dữ liệu JSON từ phản hồi
try...catch	Đảm bảo xử lý lỗi an toàn và log rõ ràng

2.
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

- const encodedId = encodeURIComponent(id);

Dòng này mã hóa ID để đảm bảo không bị lỗi khi ID có dấu cách, dấu tiếng Việt, ký tự đặc biệt.
Ví dụ:
NV 01 → "NV%2001"
"Bánh cuốn" → "B%C3%A1nh%20cu%E1%BB%91n"
Đây là một bước rất quan trọng khi truyền giá trị vào URL.


3.
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

method: 'POST'
Chỉ định là yêu cầu POST – dùng để tạo mới dữ liệu.

headers: {...}
Đặt Content-Type là "application/json" để server biết dữ liệu gửi lên là JSON.
Đặt Accept: application/json để yêu cầu server trả lại dữ liệu JSON

body: JSON.stringify(data)
Chuyển dữ liệu (data) thành dạng JSON string trước khi gửi lên server.

4.
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

await res.json().catch(() => ({}))
Cố gắng đọc phản hồi lỗi từ server dưới dạng JSON (vì FastAPI thường trả lỗi dưới dạng JSON).
Nếu server trả lỗi mà không có nội dung JSON, thì dùng catch để tránh lỗi và trả về {} (object rỗng).

hàm xử lý 422:
if (res.status === 422 && errorData.detail)
Kiểm tra xem phản hồi có phải lỗi 422 không.
Và trong phản hồi đó có detail không (detail là nơi chứa danh sách lỗi).

Array.isArray(errorData.detail)
Kiểm tra detail có phải là mảng không (nếu chỉ là chuỗi thì không xử lý kiểu mảng). 

.map(err => \${err.loc?.join('.')}: ${err.msg}`)`
Duyệt qua từng phần tử lỗi err trong detail:

err.loc: vị trí lỗi (thường là ["body", "TenNhaHang"])
👉 Sử dụng .join('.') → thành "body.TenNhaHang"

err.msg: thông báo lỗi (ví dụ "field required")

Kết quả: "body.TenNhaHang: field required"

.join(', ')
Gộp tất cả các thông báo lỗi thành 1 chuỗi, ngăn cách bởi dấu ,

throw new Error(...)
Ném ra một lỗi mới, hiển thị lên giao diện hoặc thông báo lỗi ra console.

Giúp người dùng biết rõ dữ liệu nào nhập sai, sai kiểu, sai định dạng...

5.
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



6.
    updateByCompositeKey: (maKhachHang, maBan, data) => api.update(`/danhgia/${maKhachHang}/${maBan}`, '', data)
};

Vấn đề đặt ra:
Bạn có một bảng như DanhGia, trong đó khóa chính gồm 2 cột:

MaKhachHang
MaBan

Vậy thì bạn không thể chỉ dùng 1 id như các bảng khác (VD: /nhanvien/NV01), mà cần cập nhật dữ liệu theo 2 khóa chính cùng lúc, ví dụ:
/danhgia/KH01/B03

VD:
maKhachHang và maBan
Là 2 giá trị định danh bản ghi muốn cập nhật.
maKhachHang = "KH01"
maBan = "B03"

Khi đó bạn cần gọi API:
PUT http://localhost:8000/danhgia/KH01/B03

Sau đó gọi hàm api.update(`/danhgia/${maKhachHang}/${maBan}`, '', data)
id='' ( chuỗi rỗng ) vì đường dẫn đã chứa đủ thông tin (/danhgia/KH01/B03), nên không cần thêm id nữa → truyền '' để bỏ qua.

7.

// 📋 API xử lý CRUD cho bảng NhanVien
export const nhanVienAPI = {
  // Lấy danh sách tất cả nhân viên
  getAll: () => api.getAll('/nhanvien/'),

  // Lấy một nhân viên theo mã
  getById: (id) => api.getById('/nhanvien/', id),

  // Thêm mới nhân viên
  create: (data) => api.create('/nhanvien/', {
      MaNhanVien: data.maNhanVien,
      TenNhanVien: data.tenNhanVien,
      Luong: data.luong,
      ChucVu: data.chucVu,
      CaLamViec: data.caLamViec,
      TrangThai: data.trangThai,
      MaNhaHang: data.maNhaHang
  }),

  // Cập nhật nhân viên theo id
  update: (id, data) => api.update('/nhanvien/', id, {
      MaNhanVien: id,
      TenNhanVien: data.tenNhanVien,
      Luong: data.luong,
      ChucVu: data.chucVu,
      CaLamViec: data.caLamViec,
      TrangThai: data.trangThai,
      MaNhaHang: data.maNhaHang
  }),

  // Xóa nhân viên theo id
  delete: (id) => api.delete('/nhanvien/', id)
};