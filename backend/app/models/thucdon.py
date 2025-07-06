from pydantic import BaseModel

class ThucDon(BaseModel):
    TenMon: str
    Loai: str
    GiaTien: float
