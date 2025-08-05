from pydantic import BaseModel  # kiểm tra dữ liệu đầu vào

class ChiTietHoaDon(BaseModel):
    MaHoaDon: str
    TenMon: str
    SoLuong: int
