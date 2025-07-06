from app.database import get_connection
from app.models.nhahang import NhaHang
import pymysql.cursors

def create_nhahang(nh: NhaHang):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                INSERT INTO NhaHang (MaNhaHang, TenNhaHang, DiaChi, SoDienThoai)
                VALUES (%s, %s, %s, %s)
            """
            cursor.execute(sql, (nh.MaNhaHang, nh.TenNhaHang, nh.DiaChi, nh.SoDienThoai))
        conn.commit()
        return {"message": "Thêm nhà hàng thành công"}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def get_all_nhahang():
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM NhaHang")
            return cursor.fetchall()
    finally:
        conn.close()


def get_nhahang_by_id(ma_nhahang: str):
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM NhaHang WHERE MaNhaHang = %s", (ma_nhahang,))
            return cursor.fetchone()
    finally:
        conn.close()


def update_nhahang(ma_nhahang: str, nh: NhaHang):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                UPDATE NhaHang
                SET TenNhaHang = %s, DiaChi = %s, SoDienThoai = %s
                WHERE MaNhaHang = %s
            """
            cursor.execute(sql, (nh.TenNhaHang, nh.DiaChi, nh.SoDienThoai, ma_nhahang))
        conn.commit()
        if cursor.rowcount > 0:
            return get_nhahang_by_id(ma_nhahang)
        return None
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def delete_nhahang(ma_nhahang: str):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM NhaHang WHERE MaNhaHang = %s", (ma_nhahang,))
            conn.commit()
            return cursor.rowcount > 0
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
