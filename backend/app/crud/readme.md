1. import pymysql.cursors và .DictCursor là gì?
import pymysql.cursors
Câu lệnh này import module con cursors của thư viện pymysql.

Sau đó bạn có thể sử dụng:
pymysql.cursors.DictCursor
DictCursor là một lớp giúp kết quả SELECT trả về dưới dạng dict thay vì tuple.

Ví dụ:
Không dùng DictCursor	Dùng DictCursor
('HD01', 'Lẩu dê', 2)	{'MaHoaDon': 'HD01', 'TenMon': 'Lẩu dê', 'SoLuong': 2}

 2. ct: ChiTietHoaDon là gì?

def create_chitiethoadon(ct: ChiTietHoaDon)
ChiTietHoaDon là một Pydantic model đại diện cho dữ liệu người dùng gửi từ form/JSON.

Biến ct chính là đối tượng chứa các giá trị người dùng nhập, FastAPI sẽ tự động ánh xạ từ JSON.

Ví dụ model:

from pydantic import BaseModel

class ChiTietHoaDon(BaseModel):
    MaHoaDon: str
    TenMon: str
    SoLuong: int
Khi người dùng gửi:

{
  "MaHoaDon": "HD01",
  "TenMon": "Lẩu dê nhúng mẻ",
  "SoLuong": 2
}
→ FastAPI sẽ tạo ra ct.MaHoaDon = "HD01", ct.TenMon = "Lẩu dê nhúng mẻ", v.v...

 3. cursor.execute(...) là gì?

sql = """
    INSERT INTO ChiTietHoaDon (MaHoaDon, TenMon, SoLuong)
    VALUES (%s, %s, %s)
"""
cursor.execute(sql, (ct.MaHoaDon, ct.TenMon, ct.SoLuong))
cursor.execute(...): gửi câu lệnh SQL đến cơ sở dữ liệu.

Các %s trong câu SQL sẽ được thay thế bởi các giá trị trong tuple.

Thay vì nối chuỗi (dễ bị lỗi SQL Injection), PyMySQL dùng binding an toàn.

Thực thi sẽ giống:

INSERT INTO ChiTietHoaDon (MaHoaDon, TenMon, SoLuong)
VALUES ('HD01', 'Lẩu dê nhúng mẻ', 2)
 4. conn.commit(), conn.rollback() và conn.close() là gì?
 commit:

conn.commit()
Xác nhận thay đổi dữ liệu vào database.
Nếu không có dòng này thì INSERT, UPDATE, DELETE không có hiệu lực.

 rollback:
conn.rollback()
Khi có lỗi, hủy bỏ toàn bộ thay đổi từ đầu transaction (an toàn dữ liệu).

 close:
conn.close()
Luôn được gọi để đóng kết nối đến cơ sở dữ liệu, tránh rò rỉ tài nguyên.

 5. Cấu trúc try - except - finally là gì?

try:
    # Giao dịch chính: INSERT / UPDATE
except Exception as e:
    conn.rollback()  # Nếu lỗi → quay lui
    raise e          # Ném lỗi ra cho FastAPI xử lý
finally:
    conn.close()     # Luôn đóng kết nối
Lợi ích:
Đảm bảo không lưu dữ liệu lỗi.

Dễ debug và bảo trì.

Bảo vệ tính toàn vẹn của database.

 6. Khi nào dùng conn.cursor() và conn.cursor(pymysql.cursors.DictCursor)?
Loại	Trả kết quả	Khi nào dùng
conn.cursor()	tuple	Khi không cần SELECT hoặc xử lý thủ công
conn.cursor(pymysql.cursors.DictCursor)	dict	Khi SELECT và muốn truy cập kết quả dễ bằng tên cột

 Tổng kết:
Thành phần	Mục đích
DictCursor	Giúp trả dữ liệu SELECT dưới dạng dict
ct: ChiTietHoaDon	Biến chứa dữ liệu người dùng gửi vào (FastAPI tự ánh xạ)
cursor.execute(...)	Gửi SQL đến MySQL, binding giá trị an toàn
conn.commit()	Lưu thay đổi vĩnh viễn vào DB
conn.rollback()	Hủy thay đổi nếu có lỗi
conn.close()	Đóng kết nối DB sau mỗi thao tác
try - except - finally	Bảo vệ an toàn dữ liệu và đóng kết nối chuẩn

fetchall() : 
.fetchall() là gì?
Nó là một hàm dùng để lấy tất cả các dòng kết quả sau khi bạn dùng câu lệnh SELECT trong SQL.

 Giả sử bạn viết:
cursor.execute("SELECT * FROM ChiTietHoaDon")
data = cursor.fetchall()
Thì chuyện gì xảy ra?

Bước 1: cursor.execute(...)
Câu lệnh SQL SELECT * FROM ChiTietHoaDon được gửi đến MySQL.
MySQL trả về một loạt dòng kết quả (gọi là “result set”).
Kết quả này chưa nằm trong biến data đâu, nó chỉ nằm trong vùng nhớ tạm của cursor.

Bước 2: fetchall()
Lúc này bạn gọi cursor.fetchall() → Python sẽ lấy tất cả các dòng có trong vùng nhớ tạm đó và đưa vào biến data.

Kết quả là một danh sách (list), mỗi phần tử trong đó là:
tuple nếu bạn dùng cursor() bình thường
dict nếu bạn dùng cursor(pymysql.cursors.DictCursor)

So sánh .fetchall() với .fetchone() và .fetchmany()
Hàm	Lấy bao nhiêu dòng?	Dạng kết quả
fetchall()	Tất cả dòng	list
fetchone()	1 dòng đầu tiên	tuple hoặc dict
fetchmany(n)	n dòng đầu tiên	list

Khi nào dùng .fetchall()?
Dùng khi bạn muốn lấy toàn bộ kết quả truy vấn SELECT cùng một lúc.
Nhưng: Nếu bảng quá lớn, có thể gây chậm/chết ứng dụng → khi đó dùng .fetchmany() tốt hơn.