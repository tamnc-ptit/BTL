from fastapi import APIRouter, HTTPException
from app.models.sudung import SuDung
from app.crud.sudung_crud import (
    create_sudung,
    get_all_sudung,
    get_sudung_by_id,
    update_sudung,
    delete_sudung
)

router = APIRouter()

@router.post("/")
def add_sudung(item: SuDung):
    try:
        return create_sudung(item)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def list_sudung():
    try:
        return get_all_sudung()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{ma_ban}/{ma_khachhang}")
def get_sudung(ma_ban: str, ma_khachhang: str):
    try:
        item = get_sudung_by_id(ma_ban, ma_khachhang)
        if item is None:
            raise HTTPException(status_code=404, detail="Không tìm thấy bản ghi sử dụng")
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{ma_ban}/{ma_khachhang}")
def update_sudung_route(ma_ban: str, ma_khachhang: str, item: SuDung):
    try:
        updated = update_sudung(ma_ban, ma_khachhang, item)
        if updated is None:
            raise HTTPException(status_code=404, detail="Không tìm thấy bản ghi sử dụng")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{ma_ban}/{ma_khachhang}")
def delete_sudung_route(ma_ban: str, ma_khachhang: str):
    try:
        deleted = delete_sudung(ma_ban, ma_khachhang)
        if not deleted:
            raise HTTPException(status_code=404, detail="Không tìm thấy bản ghi sử dụng")
        return {"message": "Xóa bản ghi sử dụng thành công"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))