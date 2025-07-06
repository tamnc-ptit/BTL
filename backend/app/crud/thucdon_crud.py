from app.database import get_connection
from app.models.thucdon import ThucDon
import pymysql.cursors

# CREATE - Thêm món vào thực đơn
def create_thucdon(thucdon: ThucDon):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = "INSERT INTO ThucDon (TenMon, Loai, GiaTien) VALUES (%s, %s, %s)"
            cursor.execute(sql, (thucdon.TenMon, thucdon.Loai, thucdon.GiaTien))
        conn.commit()
        return {"message": "Thêm món vào thực đơn thành công"}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


# READ ALL - Lấy toàn bộ món trong thực đơn
def get_all_thucdon():
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM ThucDon")
            return cursor.fetchall()
    finally:
        conn.close()


# READ ONE - Lấy một món theo tên (giả định tên là khóa chính)
def get_thucdon_by_id(ten_mon: str):
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM ThucDon WHERE TenMon = %s", (ten_mon,))
            return cursor.fetchone()
    finally:
        conn.close()


# UPDATE - Cập nhật món ăn theo tên cũ
def update_thucdon(ten_cu: str, thucdon: ThucDon):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                UPDATE ThucDon
                SET TenMon = %s, Loai = %s, GiaTien = %s
                WHERE TenMon = %s
            """
            cursor.execute(sql, (
                thucdon.TenMon,
                thucdon.Loai,
                thucdon.GiaTien,
                ten_cu
            ))
        conn.commit()
        if cursor.rowcount > 0:
            return get_thucdon_by_id(thucdon.TenMon)
        return None
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


# DELETE - Xóa món ăn theo tên
def delete_thucdon(ten_mon: str):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM ThucDon WHERE TenMon = %s", (ten_mon,))
            conn.commit()
            return cursor.rowcount > 0
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
