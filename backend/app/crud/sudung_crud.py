from app.database import get_connection
from app.models.sudung import SuDung
import pymysql.cursors

# CREATE - Thêm bản ghi sử dụng
def create_sudung(sd: SuDung):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = "INSERT INTO SuDung (MaBan, MaKhachHang) VALUES (%s, %s)"
            cursor.execute(sql, (sd.MaBan, sd.MaKhachHang))
        conn.commit()
        return {"message": "Thêm sử dụng thành công"}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


# READ ALL - Lấy toàn bộ dữ liệu sử dụng
def get_all_sudung():
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM SuDung")
            return cursor.fetchall()
    finally:
        conn.close()


# READ ONE - Lấy bản ghi sử dụng theo MaBan & MaKhachHang
def get_sudung_by_id(ma_ban: str, ma_kh: str):
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("""
                SELECT * FROM SuDung
                WHERE MaBan = %s AND MaKhachHang = %s
            """, (ma_ban, ma_kh))
            return cursor.fetchone()
    finally:
        conn.close()


# UPDATE - Cập nhật thông tin sử dụng (theo cặp khóa cũ)
def update_sudung(old_ma_ban: str, old_ma_kh: str, sd: SuDung):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                UPDATE SuDung
                SET MaBan = %s, MaKhachHang = %s
                WHERE MaBan = %s AND MaKhachHang = %s
            """
            cursor.execute(sql, (
                sd.MaBan,
                sd.MaKhachHang,
                old_ma_ban,
                old_ma_kh
            ))
        conn.commit()
        if cursor.rowcount > 0:
            return get_sudung_by_id(sd.MaBan, sd.MaKhachHang)
        return None
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


# DELETE - Xóa bản ghi sử dụng theo cặp khóa
def delete_sudung(ma_ban: str, ma_kh: str):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "DELETE FROM SuDung WHERE MaBan = %s AND MaKhachHang = %s",
                (ma_ban, ma_kh)
            )
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
