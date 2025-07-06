from pydantic import BaseModel

class BanAn(BaseModel):
    MaBanAn: str
    TrangThai: int  # 0: không có người, 1: có người
    SucChua: int
    MaNhaHang: str
