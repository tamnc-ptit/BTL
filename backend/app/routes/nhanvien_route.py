from fastapi import APIRouter, HTTPException
from app.models.nhanvien import NhanVien
from app.crud.nhanvien_crud import (
    create_nhanvien,
    get_all_nhanvien,
    get_nhanvien_by_id,
    update_nhanvien,
    delete_nhanvien
)

router = APIRouter()

@router.post("/")
def add_nhanvien(item: NhanVien):
    try:
        return create_nhanvien(item)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def list_nhanvien():
    try:
        return get_all_nhanvien()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{ma_nhanvien}")
def get_nhanvien(ma_nhanvien: str):
    try:
        item = get_nhanvien_by_id(ma_nhanvien)
        if item is None:
            raise HTTPException(status_code=404, detail="Không tìm thấy nhân viên")
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{ma_nhanvien}")
def update_nhanvien_route(ma_nhanvien: str, item: NhanVien):
    try:
        updated = update_nhanvien(ma_nhanvien, item)
        if updated is None:
            raise HTTPException(status_code=404, detail="Không tìm thấy nhân viên")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{ma_nhanvien}")
def delete_nhanvien_route(ma_nhanvien: str):
    try:
        deleted = delete_nhanvien(ma_nhanvien)
        if not deleted:
            raise HTTPException(status_code=404, detail="Không tìm thấy nhân viên")
        return {"message": "Xóa nhân viên thành công"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))