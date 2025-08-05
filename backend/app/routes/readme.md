Cấu trúc và cách hoạt động của Route trong FastAPI
 Ví dụ Route:

@router.post("/")
def add_chitiethoadon(item: ChiTietHoaDon):
    try:
        return create_chitiethoadon(item)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 1. @router.post("/")
Đây là một decorator trong FastAPI, định nghĩa một endpoint HTTP với phương thức POST.

"/" ở đây tương ứng với /chitiethoadon/ vì bạn đã include router:

app.include_router(router, prefix="/chitiethoadon")
=> Nghĩa là khi client gửi POST /chitiethoadon/, nó sẽ gọi hàm add_chitiethoadon.

 2. def add_chitiethoadon(item: ChiTietHoaDon):
Đây là hàm xử lý request được gọi khi có POST đến endpoint này.

item: ChiTietHoaDon nghĩa là FastAPI sẽ:

Parse dữ liệu JSON từ body của request.

Chuyển nó thành một đối tượng kiểu ChiTietHoaDon (một Pydantic model).

Kiểm tra tính hợp lệ của dữ liệu (kiểu dữ liệu, có thiếu trường không...).

 Ví dụ dữ liệu nhận:

{
  "MaHoaDon": "HD001",
  "TenMon": "Dê nướng",
  "SoLuong": 2
}
 3. try: và xử lý lỗi

try:
    return create_chitiethoadon(item)
Gọi hàm create_chitiethoadon(item) để thêm dữ liệu vào CSDL.

Nếu mọi thứ thành công, nó trả về kết quả cho client (thường là message thành công hoặc dữ liệu vừa thêm).

 4. except HTTPException: raise

except HTTPException:
    raise
Nếu create_chitiethoadon đã tự raise HTTPException (ví dụ lỗi 404, 400...), ta không xử lý lại, mà ném lại lỗi cũ.

Mục đích: Không làm mất mã lỗi gốc.
 Nếu bạn không làm điều này, các lỗi HTTP như 404 có thể bị ghi đè bởi lỗi 500.

 5. except Exception as e: và detail=str(e)

except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
Nếu có lỗi ngoài ý muốn xảy ra (lỗi Python, lỗi kết nối DB...), ta:

Bắt lại (Exception as e)

Ném ra lỗi HTTP 500 (Internal Server Error)

Đính kèm nội dung lỗi bằng detail=str(e) để dễ debug/log.

 detail=str(e) dùng để hiện nội dung lỗi thực tế (e) trong response trả về client (ví dụ: 'Duplicate entry' hoặc 'table does not exist').

 Ví dụ hoạt động thực tế
Client gửi POST:

POST /chitiethoadon/
{
  "MaHoaDon": "HD001",
  "TenMon": "Dê nướng",
  "SoLuong": 2
}
Server xử lý:

Parse JSON thành ChiTietHoaDon.

Gọi create_chitiethoadon.

Cập nhật bảng ChiTietHoaDon và tính lại TongTien trong HoaDon.

Nếu lỗi trùng khóa hoặc dữ liệu sai: raise HTTPException(400, ...)

Nếu lỗi truy vấn MySQL: raise HTTPException(500, detail=...)

Kết quả trả về:

{
  "message": "Thêm chi tiết hóa đơn thành công"
}