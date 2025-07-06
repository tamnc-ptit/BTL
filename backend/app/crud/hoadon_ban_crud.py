from app.database import get_connection
from app.models.hoadon_ban import HoaDonBan
import pymysql.cursors

# CREATE - Thêm liên kết hóa đơn - bàn
def create_hoadon_ban(hdb: HoaDonBan):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                INSERT INTO HoaDon_Ban (MaHoaDon, MaBanAn)
                VALUES (%s, %s)
            """
            cursor.execute(sql, (hdb.MaHoaDon, hdb.MaBanAn))
        conn.commit()
        return {"message": "Thêm liên kết hóa đơn - bàn thành công"}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

# READ ALL - Lấy tất cả liên kết
def get_all_hoadon_ban():
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM HoaDon_Ban")
            return cursor.fetchall()
    finally:
        conn.close()

# READ BY HOA DON - Lấy bàn theo mã hóa đơn
def get_ban_by_hoadon(ma_hoadon: str):
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM HoaDon_Ban WHERE MaHoaDon = %s", (ma_hoadon,))
            return cursor.fetchone()
    finally:
        conn.close()

# UPDATE - Cập nhật liên kết
def update_hoadon_ban(ma_hoadon: str, hdb: HoaDonBan):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                UPDATE HoaDon_Ban
                SET MaBanAn = %s
                WHERE MaHoaDon = %s
            """
            cursor.execute(sql, (hdb.MaBanAn, ma_hoadon))
        conn.commit()
        if cursor.rowcount > 0:
            return get_ban_by_hoadon(ma_hoadon)
        return None
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

# DELETE - Xóa liên kết
def delete_hoadon_ban(ma_hoadon: str):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM HoaDon_Ban WHERE MaHoaDon = %s", (ma_hoadon,))
            conn.commit()
            return cursor.rowcount > 0
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
