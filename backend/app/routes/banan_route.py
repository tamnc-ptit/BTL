from fastapi import APIRouter, HTTPException
from app.models.banan import BanAn
from app.crud.banan_crud import (
    create_banan,
    get_all_banan,
    get_banan_by_id,
    update_banan,
    delete_banan
)

router = APIRouter()

@router.post("/")
def add_banan(item: BanAn):
    try:
        return create_banan(item)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def list_banan():
    try:
        return get_all_banan()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{maban}")
def get_banan(maban: str):
    try:
        item = get_banan_by_id(maban)
        if item is None:
            raise HTTPException(status_code=404, detail="Không tìm thấy bàn ăn")
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{maban}")
def update_banan_route(maban: str, item: BanAn):
    try:
        updated = update_banan(maban, item)
        if updated is None:
            raise HTTPException(status_code=404, detail="Không tìm thấy bàn ăn")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{maban}")
def delete_banan_route(maban: str):
    try:
        deleted = delete_banan(maban)
        if not deleted:
            raise HTTPException(status_code=404, detail="Không tìm thấy bàn ăn")
        return {"message": "Xóa bàn ăn thành công"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
