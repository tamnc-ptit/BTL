from app.database import get_connection
from app.models.phucvu import PhucVu
import pymysql.cursors

# CREATE - Thêm phân công phục vụ
def create_phucvu(pv: PhucVu):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = "INSERT INTO PhucVu (MaNhanVien, MaBan) VALUES (%s, %s)"
            cursor.execute(sql, (pv.MaNhanVien, pv.MaBan))
        conn.commit()
        return {"message": "Phân công phục vụ thành công"}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


# READ ALL - Lấy toàn bộ danh sách phục vụ
def get_all_phucvu():
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM PhucVu")
            return cursor.fetchall()
    finally:
        conn.close()


# READ ONE - Lấy 1 bản ghi phục vụ theo MaNhanVien & MaBan
def get_phucvu_by_id(ma_nhanvien: str, ma_ban: str):
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("""
                SELECT * FROM PhucVu WHERE MaNhanVien = %s AND MaBan = %s
            """, (ma_nhanvien, ma_ban))
            return cursor.fetchone()
    finally:
        conn.close()


# UPDATE - Cập nhật phân công phục vụ (theo cặp khóa cũ)
def update_phucvu(old_ma_nv: str, old_ma_ban: str, pv: PhucVu):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                UPDATE PhucVu
                SET MaNhanVien = %s, MaBan = %s
                WHERE MaNhanVien = %s AND MaBan = %s
            """
            cursor.execute(sql, (
                pv.MaNhanVien,
                pv.MaBan,
                old_ma_nv,
                old_ma_ban
            ))
        conn.commit()
        if cursor.rowcount > 0:
            return get_phucvu_by_id(pv.MaNhanVien, pv.MaBan)
        return None
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


# DELETE - Xóa phân công phục vụ theo cặp khóa
def delete_phucvu(ma_nhanvien: str, ma_ban: str):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "DELETE FROM PhucVu WHERE MaNhanVien = %s AND MaBan = %s",
                (ma_nhanvien, ma_ban)
            )
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
