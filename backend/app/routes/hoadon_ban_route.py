from fastapi import APIRouter, HTTPException
from app.models.hoadon_ban import HoaDonBan
from app.crud.hoadon_ban_crud import (
    create_hoadon_ban,
    get_all_hoadon_ban,
    get_ban_by_hoadon,
    update_hoadon_ban,
    delete_hoadon_ban
)

router = APIRouter()

@router.post("/")
def add_hoadon_ban(item: HoaDonBan):
    try:
        return create_hoadon_ban(item)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def list_hoadon_ban():
    try:
        return get_all_hoadon_ban()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/hoadon/{ma_hoadon}")
def get_hoadon_ban_by_hoadon(ma_hoadon: str):
    try:
        item = get_ban_by_hoadon(ma_hoadon)
        if item is None:
            return {"MaBanAn": None}
        return item
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{ma_hoadon}")
def update_hoadon_ban_route(ma_hoadon: str, item: HoaDonBan):
    try:
        updated = update_hoadon_ban(ma_hoadon, item)
        if updated is None:
            raise HTTPException(status_code=404, detail="Không tìm thấy liên kết hóa đơn - bàn")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{ma_hoadon}")
def delete_hoadon_ban_route(ma_hoadon: str):
    try:
        deleted = delete_hoadon_ban(ma_hoadon)
        if not deleted:
            raise HTTPException(status_code=404, detail="Không tìm thấy liên kết hóa đơn - bàn")
        return {"message": "Xóa liên kết hóa đơn - bàn thành công"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))