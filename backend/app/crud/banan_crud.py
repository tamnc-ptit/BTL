from app.database import get_connection
from app.models.banan import BanAn
import pymysql.cursors

# ======= CREATE =======
def create_banan(ban: BanAn):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                INSERT INTO BanAn (MaBanAn, TrangThai, SucChua, MaNhaHang)
                VALUES (%s, %s, %s, %s)
            """
            cursor.execute(sql, (
                ban.MaBanAn,
                ban.TrangThai,
                ban.SucChua,
                ban.MaNhaHang
            ))
        conn.commit()
        return {"message": "Thêm bàn ăn thành công"}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

# ======= READ ALL =======
def get_all_banan():
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM BanAn")
            return cursor.fetchall()
    finally:
        conn.close()

# ======= READ BY ID (MaBanAn) =======
def get_banan_by_id(maban: str):
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM BanAn WHERE MaBanAn = %s", (maban,))
            return cursor.fetchone()
    finally:
        conn.close()

# ======= UPDATE =======
def update_banan(maban: str, ban: BanAn):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                UPDATE BanAn 
                SET TrangThai = %s, SucChua = %s, MaNhaHang = %s 
                WHERE MaBanAn = %s
            """
            cursor.execute(sql, (
                ban.TrangThai,
                ban.SucChua,
                ban.MaNhaHang,
                maban
            ))
        conn.commit()
        if cursor.rowcount > 0:
            return get_banan_by_id(maban)
        return None
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

# ======= DELETE =======
def delete_banan(maban: str):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM BanAn WHERE MaBanAn = %s", (maban,))
            conn.commit()
            return cursor.rowcount > 0
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
