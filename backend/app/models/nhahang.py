from pydantic import BaseModel

class NhaHang(BaseModel):
    MaNhaHang: str
    TenNhaHang: str
    DiaChi: str
    SoDienThoai: str
