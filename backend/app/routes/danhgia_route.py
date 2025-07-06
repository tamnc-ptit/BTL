from fastapi import APIRouter, HTTPException
from app.models.danhgia import DanhGia
from app.crud.danhgia_crud import (
    create_danhgia,
    get_all_danhgia,
    get_danhgia_by_id,
    update_danhgia,
    delete_danhgia
)

router = APIRouter()

@router.post("/")
def add_danhgia(item: DanhGia):
    try:
        return create_danhgia(item)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def list_danhgia():
    try:
        return get_all_danhgia()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{ma_khachhang}/{ma_ban}")
def get_danhgia(ma_khachhang: str, ma_ban: str):
    try:
        item = get_danhgia_by_id(ma_khachhang, ma_ban)
        if item is None:
            raise HTTPException(status_code=404, detail="Không tìm thấy đánh giá")
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{ma_khachhang}/{ma_ban}")
def update_danhgia_route(ma_khachhang: str, ma_ban: str, item: DanhGia):
    try:
        updated = update_danhgia(ma_khachhang, ma_ban, item)
        if updated is None:
            raise HTTPException(status_code=404, detail="Không tìm thấy đánh giá")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{ma_khachhang}/{ma_ban}")
def delete_danhgia_route(ma_khachhang: str, ma_ban: str):
    try:
        deleted = delete_danhgia(ma_khachhang, ma_ban)
        if not deleted:
            raise HTTPException(status_code=404, detail="Không tìm thấy đánh giá")
        return {"message": "Xóa đánh giá thành công"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))