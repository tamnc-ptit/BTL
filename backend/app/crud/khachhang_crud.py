from app.database import get_connection
from app.models.khachhang import KhachHang
import pymysql.cursors

def create_khachhang(kh: KhachHang):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = "INSERT INTO KhachHang (MaKhachHang, TenKhachHang, SoDienThoai) VALUES (%s, %s, %s)"
            cursor.execute(sql, (kh.MaKhachHang, kh.TenKhachHang, kh.SoDienThoai))
        conn.commit()
        return {"message": "Thêm khách hàng thành công"}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def get_all_khachhang():
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM KhachHang")
            return cursor.fetchall()
    finally:
        conn.close()


def get_khachhang_by_id(ma_khachhang: str):
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM KhachHang WHERE MaKhachHang = %s", (ma_khachhang,))
            return cursor.fetchone()
    finally:
        conn.close()


def update_khachhang(ma_khachhang: str, kh: KhachHang):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                UPDATE KhachHang
                SET TenKhachHang = %s, SoDienThoai = %s
                WHERE MaKhachHang = %s
            """
            cursor.execute(sql, (kh.TenKhachHang, kh.SoDienThoai, ma_khachhang))
        conn.commit()
        if cursor.rowcount > 0:
            return get_khachhang_by_id(ma_khachhang)
        return None
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def delete_khachhang(ma_khachhang: str):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM KhachHang WHERE MaKhachHang = %s", (ma_khachhang,))
            conn.commit()
            return cursor.rowcount > 0
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
