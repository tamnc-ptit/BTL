from fastapi import APIRouter, HTTPException
from app.models.khachhang import KhachHang
from app.crud.khachhang_crud import (
    create_khachhang,
    get_all_khachhang,
    get_khachhang_by_id,
    update_khachhang,
    delete_khachhang
)

router = APIRouter()

@router.post("/")
def add_khachhang(item: KhachHang):
    try:
        return create_khachhang(item)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def list_khachhang():
    try:
        return get_all_khachhang()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{ma_khachhang}")
def get_khachhang(ma_khachhang: str):
    try:
        item = get_khachhang_by_id(ma_khachhang)
        if item is None:
            raise HTTPException(status_code=404, detail="Không tìm thấy khách hàng")
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{ma_khachhang}")
def update_khachhang_route(ma_khachhang: str, item: KhachHang):
    try:
        updated = update_khachhang(ma_khachhang, item)
        if updated is None:
            raise HTTPException(status_code=404, detail="Không tìm thấy khách hàng")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{ma_khachhang}")
def delete_khachhang_route(ma_khachhang: str):
    try:
        deleted = delete_khachhang(ma_khachhang)
        if not deleted:
            raise HTTPException(status_code=404, detail="Không tìm thấy khách hàng")
        return {"message": "Xóa khách hàng thành công"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))