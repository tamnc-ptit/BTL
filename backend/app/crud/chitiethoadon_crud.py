from app.database import get_connection
from app.models.chitiethoadon import ChiTietHoaDon
import pymysql.cursors

# CREATE - Thêm chi tiết hóa đơn
def create_chitiethoadon(ct: ChiTietHoaDon):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            # Thêm chi tiết hóa đơn
            sql = """
                INSERT INTO ChiTietHoaDon (MaHoaDon, TenMon, SoLuong)
                VALUES (%s, %s, %s)
            """
            cursor.execute(sql, (ct.MaHoaDon, ct.TenMon, ct.SoLuong))
            
            # Tự động cập nhật tổng tiền hóa đơn
            update_sql = """
                UPDATE HoaDon 
                SET TongTien = (
                    SELECT COALESCE(SUM(cthd.SoLuong * td.GiaTien), 0)
                    FROM ChiTietHoaDon cthd
                    JOIN ThucDon td ON cthd.TenMon = td.TenMon
                    WHERE cthd.MaHoaDon = %s
                )
                WHERE MaHoaDon = %s
            """
            cursor.execute(update_sql, (ct.MaHoaDon, ct.MaHoaDon))
            
        conn.commit()
        return {"message": "Thêm chi tiết hóa đơn thành công"}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


# READ ALL - Lấy toàn bộ chi tiết hóa đơn
def get_all_chitiethoadon():
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM ChiTietHoaDon")
            return cursor.fetchall()
    finally:
        conn.close()

# READ BY HOA DON - Lấy chi tiết hóa đơn theo mã hóa đơn
def get_chitiethoadon_by_hoadon_id(ma_hoadon: str):
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM ChiTietHoaDon WHERE MaHoaDon = %s", (ma_hoadon,))
            return cursor.fetchall()
    finally:
        conn.close()


# READ ONE - Lấy một chi tiết hóa đơn theo composite key
def get_chitiethoadon_by_id(ma_hoadon: str, ten_mon: str):
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM ChiTietHoaDon WHERE MaHoaDon = %s AND TenMon = %s", (ma_hoadon, ten_mon))
            return cursor.fetchone()
    finally:
        conn.close()


# UPDATE - Cập nhật chi tiết hóa đơn
def update_chitiethoadon(ma_hoadon: str, ten_mon: str, ct: ChiTietHoaDon):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            # Cập nhật chi tiết hóa đơn
            sql = """
                UPDATE ChiTietHoaDon
                SET SoLuong = %s
                WHERE MaHoaDon = %s AND TenMon = %s
            """
            cursor.execute(sql, (ct.SoLuong, ma_hoadon, ten_mon))
            
            # Tự động cập nhật tổng tiền hóa đơn
            update_sql = """
                UPDATE HoaDon 
                SET TongTien = (
                    SELECT COALESCE(SUM(cthd.SoLuong * td.GiaTien), 0)
                    FROM ChiTietHoaDon cthd
                    JOIN ThucDon td ON cthd.TenMon = td.TenMon
                    WHERE cthd.MaHoaDon = %s
                )
                WHERE MaHoaDon = %s
            """
            cursor.execute(update_sql, (ma_hoadon, ma_hoadon))
            
        conn.commit()
        if cursor.rowcount > 0:
            return get_chitiethoadon_by_id(ma_hoadon, ten_mon)
        return None
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


# DELETE - Xóa chi tiết hóa đơn theo composite key
def delete_chitiethoadon(ma_hoadon: str, ten_mon: str):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            # Xóa chi tiết hóa đơn
            cursor.execute("DELETE FROM ChiTietHoaDon WHERE MaHoaDon = %s AND TenMon = %s", (ma_hoadon, ten_mon))
            
            # Tự động cập nhật tổng tiền hóa đơn
            update_sql = """
                UPDATE HoaDon 
                SET TongTien = (
                    SELECT COALESCE(SUM(cthd.SoLuong * td.GiaTien), 0)
                    FROM ChiTietHoaDon cthd
                    JOIN ThucDon td ON cthd.TenMon = td.TenMon
                    WHERE cthd.MaHoaDon = %s
                )
                WHERE MaHoaDon = %s
            """
            cursor.execute(update_sql, (ma_hoadon, ma_hoadon))
            
            conn.commit()
            return cursor.rowcount > 0
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
