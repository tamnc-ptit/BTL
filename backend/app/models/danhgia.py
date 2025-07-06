from pydantic import BaseModel

class DanhGia(BaseModel):
    MaKhachHang: str
    MaBan: str
    DanhGia: str
