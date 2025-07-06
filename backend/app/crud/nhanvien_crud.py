from app.database import get_connection
from app.models.nhanvien import NhanVien
import pymysql.cursors

def create_nhanvien(nv: NhanVien):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                INSERT INTO NhanVien (MaNhanVien, TenNhanVien, Luong, ChucVu, CaLamViec, TrangThai, MaNhaHang)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (
                nv.MaNhanVien,
                nv.TenNhanVien,
                nv.Luong,
                nv.ChucVu,
                nv.CaLamViec,
                nv.TrangThai,
                nv.MaNhaHang
            ))
        conn.commit()
        return {"message": "Thêm nhân viên thành công"}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def get_all_nhanvien():
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM NhanVien")
            return cursor.fetchall()
    finally:
        conn.close()


def get_nhanvien_by_id(ma_nhanvien: str):
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM NhanVien WHERE MaNhanVien = %s", (ma_nhanvien,))
            return cursor.fetchone()
    finally:
        conn.close()


def update_nhanvien(ma_nhanvien: str, nv: NhanVien):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                UPDATE NhanVien
                SET TenNhanVien = %s, Luong = %s, ChucVu = %s,
                    CaLamViec = %s, TrangThai = %s, MaNhaHang = %s
                WHERE MaNhanVien = %s
            """
            cursor.execute(sql, (
                nv.TenNhanVien,
                nv.Luong,
                nv.ChucVu,
                nv.CaLamViec,
                nv.TrangThai,
                nv.MaNhaHang,
                ma_nhanvien
            ))
        conn.commit()
        if cursor.rowcount > 0:
            return get_nhanvien_by_id(ma_nhanvien)
        return None
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def delete_nhanvien(ma_nhanvien: str):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM NhanVien WHERE MaNhanVien = %s", (ma_nhanvien,))
            conn.commit()
            return cursor.rowcount > 0
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
