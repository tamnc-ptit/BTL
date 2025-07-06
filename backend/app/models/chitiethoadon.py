from pydantic import BaseModel

class ChiTietHoaDon(BaseModel):
    MaHoaDon: str
    TenMon: str
    SoLuong: int
