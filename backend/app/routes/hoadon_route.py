from fastapi import APIRouter, HTTPException
from app.models.hoadon import HoaDon
from app.crud.hoadon_crud import (
    create_hoadon,
    get_all_hoadon,
    get_hoadon_by_id,
    update_hoadon,
    delete_hoadon,
    calculate_hoadon_total_amount
)

router = APIRouter()

@router.post("/")
def add_hoadon(item: HoaDon):
    try:
        return create_hoadon(item)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def list_hoadon():
    try:
        return get_all_hoadon()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{ma_hoadon}")
def get_hoadon(ma_hoadon: str):
    try:
        item = get_hoadon_by_id(ma_hoadon)
        if item is None:
            raise HTTPException(status_code=404, detail="Không tìm thấy hóa đơn")
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{ma_hoadon}")
def update_hoadon_route(ma_hoadon: str, item: HoaDon):
    try:
        updated = update_hoadon(ma_hoadon, item)
        if updated is None:
            raise HTTPException(status_code=404, detail="Không tìm thấy hóa đơn")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{ma_hoadon}")
def delete_hoadon_route(ma_hoadon: str):
    try:
        deleted = delete_hoadon(ma_hoadon)
        if not deleted:
            raise HTTPException(status_code=404, detail="Không tìm thấy hóa đơn")
        return {"message": "Xóa hóa đơn thành công"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{ma_hoadon}/calculate-total")
def calculate_hoadon_total(ma_hoadon: str):
    try:
        total = calculate_hoadon_total_amount(ma_hoadon)
        return {"ma_hoadon": ma_hoadon, "tong_tien": total}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))