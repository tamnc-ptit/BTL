from pydantic import BaseModel

class HoaDonBan(BaseModel):
    MaHoaDon: str
    MaBanAn: str
