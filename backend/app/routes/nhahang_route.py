from fastapi import APIRouter, HTTPException
from app.models.nhahang import NhaHang
from app.crud.nhahang_crud import (
    create_nhahang,
    get_all_nhahang,
    get_nhahang_by_id,
    update_nhahang,
    delete_nhahang
)

router = APIRouter()

@router.post("/")
def add_nhahang(item: NhaHang):
    try:
        return create_nhahang(item)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def list_nhahang():
    try:
        return get_all_nhahang()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{ma_nhahang}")
def get_nhahang(ma_nhahang: str):
    try:
        item = get_nhahang_by_id(ma_nhahang)
        if item is None:
            raise HTTPException(status_code=404, detail="Không tìm thấy nhà hàng")
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{ma_nhahang}")
def update_nhahang_route(ma_nhahang: str, item: NhaHang):
    try:
        updated = update_nhahang(ma_nhahang, item)
        if updated is None:
            raise HTTPException(status_code=404, detail="Không tìm thấy nhà hàng")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{ma_nhahang}")
def delete_nhahang_route(ma_nhahang: str):
    try:
        deleted = delete_nhahang(ma_nhahang)
        if not deleted:
            raise HTTPException(status_code=404, detail="Không tìm thấy nhà hàng")
        return {"message": "Xóa nhà hàng thành công"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))