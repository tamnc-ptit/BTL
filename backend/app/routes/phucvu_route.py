from fastapi import APIRouter, HTTPException
from app.models.phucvu import PhucVu
from app.crud.phucvu_crud import (
    create_phucvu,
    get_all_phucvu,
    get_phucvu_by_id,
    update_phucvu,
    delete_phucvu
)

router = APIRouter()

@router.post("/")
def add_phucvu(item: PhucVu):
    try:
        return create_phucvu(item)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def list_phucvu():
    try:
        return get_all_phucvu()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{ma_nhanvien}/{ma_ban}")
def get_phucvu(ma_nhanvien: str, ma_ban: str):
    try:
        item = get_phucvu_by_id(ma_nhanvien, ma_ban)
        if item is None:
            raise HTTPException(status_code=404, detail="Không tìm thấy phân công phục vụ")
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{ma_nhanvien}/{ma_ban}")
def update_phucvu_route(ma_nhanvien: str, ma_ban: str, item: PhucVu):
    try:
        updated = update_phucvu(ma_nhanvien, ma_ban, item)
        if updated is None:
            raise HTTPException(status_code=404, detail="Không tìm thấy phân công phục vụ")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{ma_nhanvien}/{ma_ban}")
def delete_phucvu_route(ma_nhanvien: str, ma_ban: str):
    try:
        deleted = delete_phucvu(ma_nhanvien, ma_ban)
        if not deleted:
            raise HTTPException(status_code=404, detail="Không tìm thấy phân công phục vụ")
        return {"message": "Xóa phân công phục vụ thành công"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))