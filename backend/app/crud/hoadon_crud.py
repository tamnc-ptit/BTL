from app.database import get_connection
from app.models.hoadon import HoaDon
import pymysql.cursors

# CREATE - Thêm hóa đơn mới
def create_hoadon(hd: HoaDon):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                INSERT INTO HoaDon (MaHoaDon, ThoiGianThanhToan, TongTien, MaNhanVien, MaKhachHang)
                VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (
                hd.MaHoaDon,
                hd.ThoiGianThanhToan,
                hd.TongTien or 0,  # Sử dụng 0 nếu không có giá trị
                hd.MaNhanVien,
                hd.MaKhachHang
            ))
        conn.commit()
        return {"message": "Thêm hóa đơn thành công"}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


# READ ALL - Lấy tất cả hóa đơn
def get_all_hoadon():
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM HoaDon")
            return cursor.fetchall()
    finally:
        conn.close()


# READ ONE - Lấy hóa đơn theo mã
def get_hoadon_by_id(ma_hoadon: str):
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM HoaDon WHERE MaHoaDon = %s", (ma_hoadon,))
            return cursor.fetchone()
    finally:
        conn.close()


# UPDATE - Cập nhật hóa đơn theo mã
def update_hoadon(ma_hoadon: str, hd: HoaDon):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            # Chỉ cập nhật các trường không phải TongTien (vì TongTien được tính tự động)
            sql = """
                UPDATE HoaDon
                SET ThoiGianThanhToan = %s,
                    MaNhanVien = %s,
                    MaKhachHang = %s
                WHERE MaHoaDon = %s
            """
            cursor.execute(sql, (
                hd.ThoiGianThanhToan,
                hd.MaNhanVien,
                hd.MaKhachHang,
                ma_hoadon
            ))
        conn.commit()
        if cursor.rowcount > 0:
            return get_hoadon_by_id(ma_hoadon)
        return None
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


# DELETE - Xóa hóa đơn theo mã
def delete_hoadon(ma_hoadon: str):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM HoaDon WHERE MaHoaDon = %s", (ma_hoadon,))
            conn.commit()
            return cursor.rowcount > 0
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

# CALCULATE TOTAL - Tính tổng tiền hóa đơn từ chi tiết
def calculate_hoadon_total_amount(ma_hoadon: str):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                SELECT COALESCE(SUM(cthd.SoLuong * td.GiaTien), 0) as total
                FROM ChiTietHoaDon cthd
                JOIN ThucDon td ON cthd.TenMon = td.TenMon
                WHERE cthd.MaHoaDon = %s
            """
            cursor.execute(sql, (ma_hoadon,))
            result = cursor.fetchone()
            return float(result[0]) if result else 0.0
    finally:
        conn.close()
