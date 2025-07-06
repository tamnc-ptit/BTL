from pydantic import BaseModel

class KhachHang(BaseModel):
    MaKhachHang: str
    TenKhachHang: str
    SoDienThoai: str
