from fastapi import APIRouter, HTTPException
from app.models.chitiethoadon import ChiTietHoaDon
from app.crud.chitiethoadon_crud import (
    create_chitiethoadon,
    get_all_chitiethoadon,
    get_chitiethoadon_by_id,
    get_chitiethoadon_by_hoadon_id,
    update_chitiethoadon,
    delete_chitiethoadon
)

router = APIRouter()

@router.post("/")
def add_chitiethoadon(item: ChiTietHoaDon):
    try:
        return create_chitiethoadon(item)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def list_chitiethoadon():
    try:
        return get_all_chitiethoadon()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/hoadon/{ma_hoadon}")
def get_chitiethoadon_by_hoadon(ma_hoadon: str):
    try:
        items = get_chitiethoadon_by_hoadon_id(ma_hoadon)
        if not items:
            return []
        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{ma_hoadon}/{ten_mon}")
def get_chitiethoadon(ma_hoadon: str, ten_mon: str):
    try:
        item = get_chitiethoadon_by_id(ma_hoadon, ten_mon)
        if item is None:
            raise HTTPException(status_code=404, detail="Không tìm thấy chi tiết hóa đơn")
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{ma_hoadon}/{ten_mon}")
def update_chitiethoadon_route(ma_hoadon: str, ten_mon: str, item: ChiTietHoaDon):
    try:
        updated = update_chitiethoadon(ma_hoadon, ten_mon, item)
        if updated is None:
            raise HTTPException(status_code=404, detail="Không tìm thấy chi tiết hóa đơn")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{ma_hoadon}/{ten_mon}")
def delete_chitiethoadon_route(ma_hoadon: str, ten_mon: str):
    try:
        deleted = delete_chitiethoadon(ma_hoadon, ten_mon)
        if not deleted:
            raise HTTPException(status_code=404, detail="Không tìm thấy chi tiết hóa đơn")
        return {"message": "Xóa chi tiết hóa đơn thành công"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))