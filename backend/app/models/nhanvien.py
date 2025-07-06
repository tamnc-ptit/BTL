from pydantic import BaseModel

class NhanVien(BaseModel):
    MaNhanVien: str
    TenNhanVien: str
    Luong: float
    ChucVu: str
    CaLamViec: str
    TrangThai: int
    MaNhaHang: str
