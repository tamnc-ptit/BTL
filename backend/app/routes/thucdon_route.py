from fastapi import APIRouter, HTTPException
from app.models.thucdon import ThucDon
from app.crud.thucdon_crud import (
    create_thucdon,
    get_all_thucdon,
    get_thucdon_by_id,
    update_thucdon,
    delete_thucdon
)

router = APIRouter()

@router.post("/")
def add_thucdon(item: ThucDon):
    try:
        return create_thucdon(item)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def list_thucdon():
    try:
        return get_all_thucdon()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{ten_mon}")
def get_thucdon(ten_mon: str):
    try:
        item = get_thucdon_by_id(ten_mon)
        if item is None:
            raise HTTPException(status_code=404, detail="Không tìm thấy món ăn")
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{ten_mon}")
def update_thucdon_route(ten_mon: str, item: ThucDon):
    try:
        updated = update_thucdon(ten_mon, item)
        if updated is None:
            raise HTTPException(status_code=404, detail="Không tìm thấy món ăn")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{ten_mon}")
def delete_thucdon_route(ten_mon: str):
    try:
        deleted = delete_thucdon(ten_mon)
        if not deleted:
            raise HTTPException(status_code=404, detail="Không tìm thấy món ăn")
        return {"message": "Xóa món ăn thành công"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))