from pydantic import BaseModel
from typing import Optional

class HoaDon(BaseModel):
    MaHoaDon: str
    ThoiGianThanhToan: str  # ISO format datetime string
    TongTien: Optional[float] = None  # Tự động tính từ chi tiết hóa đơn
    MaNhanVien: str
    MaKhachHang: str
