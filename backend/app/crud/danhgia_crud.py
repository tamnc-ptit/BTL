from app.database import get_connection
from app.models.danhgia import DanhGia
import pymysql.cursors

# CREATE - Thêm đánh giá
def create_danhgia(dg: DanhGia):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                INSERT INTO DanhGia (MaKhachHang, MaBan, DanhGia)
                VALUES (%s, %s, %s)
            """
            cursor.execute(sql, (dg.MaKhachHang, dg.MaBan, dg.DanhGia))
        conn.commit()
        return {"message": "Thêm đánh giá thành công"}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

# READ ALL - Lấy tất cả đánh giá
def get_all_danhgia():
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM DanhGia")
            return cursor.fetchall()
    finally:
        conn.close()

# READ ONE - Lấy đánh giá theo composite key
def get_danhgia_by_id(ma_khachhang: str, ma_ban: str):
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM DanhGia WHERE MaKhachHang = %s AND MaBan = %s", (ma_khachhang, ma_ban))
            return cursor.fetchone()
    finally:
        conn.close()

# UPDATE - Cập nhật đánh giá theo composite key
def update_danhgia(ma_khachhang: str, ma_ban: str, dg: DanhGia):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                UPDATE DanhGia
                SET DanhGia = %s
                WHERE MaKhachHang = %s AND MaBan = %s
            """
            cursor.execute(sql, (dg.DanhGia, ma_khachhang, ma_ban))
        conn.commit()
        if cursor.rowcount > 0:
            return get_danhgia_by_id(ma_khachhang, ma_ban)
        return None
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

# DELETE - Xóa đánh giá theo composite key
def delete_danhgia(ma_khachhang: str, ma_ban: str):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM DanhGia WHERE MaKhachHang = %s AND MaBan = %s", (ma_khachhang, ma_ban))
            conn.commit()
            return cursor.rowcount > 0
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
