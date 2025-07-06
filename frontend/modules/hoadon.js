// Hóa đơn module
import { showLoading, hideLoading, showNotification, showModal, hideModal } from '../utils.js';
import { hoaDonAPI, nhanVienAPI, banAnAPI, khachHangAPI, chiTietHoaDonAPI, thucDonAPI, hoaDonBanAPI } from '../api.js';

export async function initHoaDon() {
    const mainContent = document.getElementById('main-content');
    
    try {
        showLoading();
        
        // Render hóa đơn layout
        mainContent.innerHTML = `
            <div class="data-table-container">
                <div class="table-header">
                    <h3 class="table-title">Danh sách Hóa đơn</h3>
                    <button class="add-button" id="add-hoadon-btn">
                        <i class="fas fa-plus"></i>
                        Thêm Hóa đơn
                    </button>
                </div>
                <div class="table-content">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Mã hóa đơn</th>
                                <th>Thời gian thanh toán</th>
                                <th>Tổng tiền</th>
                                <th>Nhân viên</th>
                                <th>Bàn</th>
                                <th>Khách hàng</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody id="hoadon-table-body">
                            <tr>
                                <td colspan="7" class="text-center">
                                    <div class="empty-state">
                                        <i class="fas fa-spinner fa-spin"></i>
                                        <p>Đang tải dữ liệu...</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // Load data and setup event listeners
        await loadHoaDonData();
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing hóa đơn module:', error);
        showNotification('Có lỗi xảy ra khi tải trang hóa đơn', 'error');
    } finally {
        hideLoading();
    }
}

async function loadHoaDonData() {
    try {
        const [hoaDonData, nhanVienData, banAnData, khachHangData, hoaDonBanData] = await Promise.all([
            hoaDonAPI.getAll(),
            nhanVienAPI.getAll(),
            banAnAPI.getAll(),
            khachHangAPI.getAll(),
            hoaDonBanAPI.getAll()
        ]);
        
        // Map related data
        const nhanVienMap = {};
        nhanVienData.forEach(nv => {
            nhanVienMap[nv.MaNhanVien] = nv.TenNhanVien;
        });
        
        const banAnMap = {};
        banAnData.forEach(ba => {
            banAnMap[ba.MaBanAn] = `Bàn ${ba.MaBanAn} (${ba.SucChua} người)`;
        });
        
        const khachHangMap = {};
        khachHangData.forEach(kh => {
            khachHangMap[kh.MaKhachHang] = kh.TenKhachHang;
        });
        
        // Map hóa đơn - bàn
        const hoaDonBanMap = {};
        hoaDonBanData.forEach(hdb => {
            hoaDonBanMap[hdb.MaHoaDon] = hdb.MaBanAn;
        });
        
        const enrichedData = hoaDonData.map(hd => ({
            ...hd,
            TenNhanVien: nhanVienMap[hd.MaNhanVien] || 'N/A',
            TenBanAn: banAnMap[hoaDonBanMap[hd.MaHoaDon]] || 'N/A',
            TenKhachHang: khachHangMap[hd.MaKhachHang] || 'N/A'
        }));
        
        renderHoaDonTable(enrichedData);
    } catch (error) {
        console.error('Error loading hóa đơn data:', error);
        showNotification('Không thể tải dữ liệu hóa đơn', 'error');
        renderHoaDonTable([]);
    }
}

function renderHoaDonTable(data) {
    const tableBody = document.getElementById('hoadon-table-body');
    
    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="empty-state">
                        <i class="fas fa-receipt"></i>
                        <h3>Chưa có hóa đơn nào</h3>
                        <p>Hãy thêm hóa đơn đầu tiên</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = data.map(hd => `
        <tr>
            <td><strong>${hd.MaHoaDon || 'N/A'}</strong></td>
            <td>${formatDateTime(hd.ThoiGianThanhToan)}</td>
            <td>${formatCurrency(hd.TongTien || 0)}</td>
            <td>${hd.TenNhanVien || 'N/A'}</td>
            <td>${hd.TenBanAn || 'N/A'}</td>
            <td>${hd.TenKhachHang || 'N/A'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-view" onclick="viewHoaDon('${hd.MaHoaDon}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-edit" onclick="editHoaDon('${hd.MaHoaDon}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-delete" onclick="deleteHoaDon('${hd.MaHoaDon}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function setupEventListeners() {
    // Add button
    document.getElementById('add-hoadon-btn').addEventListener('click', showAddModal);
    
    // Modal close button
    document.getElementById('modal-close').addEventListener('click', hideModal);
    
    // Global functions for table actions
    window.viewHoaDon = viewHoaDon;
    window.editHoaDon = editHoaDon;
    window.deleteHoaDon = deleteHoaDon;
}

async function showAddModal() {
    try {
        const [nhanVienList, banAnList, khachHangList] = await Promise.all([
            nhanVienAPI.getAll(),
            banAnAPI.getAll(),
            khachHangAPI.getAll()
        ]);
        
        const modalContent = `
            <form id="hoadon-form">
                <div class="form-group">
                    <label class="form-label" for="maHoaDon">Mã hóa đơn *</label>
                    <input type="text" id="maHoaDon" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="thoiGianThanhToan">Thời gian thanh toán</label>
                    <input type="datetime-local" id="thoiGianThanhToan" class="form-input">
                </div>
                <div class="form-group">
                    <label class="form-label" for="tongTien">Tổng tiền</label>
                    <input type="text" id="tongTien" class="form-input" value="Tự động tính từ chi tiết hóa đơn" readonly>
                    <small class="form-text">Tổng tiền sẽ được tính tự động khi thêm chi tiết hóa đơn</small>
                </div>
                <div class="form-group">
                    <label class="form-label" for="maNhanVien">Nhân viên *</label>
                    <select id="maNhanVien" class="form-select" required>
                        <option value="">Chọn nhân viên</option>
                        ${nhanVienList.map(nv => `
                            <option value="${nv.MaNhanVien}">${nv.TenNhanVien}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="maBan">Bàn *</label>
                    <select id="maBan" class="form-select" required>
                        <option value="">Chọn bàn</option>
                        ${banAnList.map(ba => `
                            <option value="${ba.MaBanAn}">Bàn ${ba.MaBanAn} (${ba.SucChua} người)</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="maKhachHang">Khách hàng *</label>
                    <select id="maKhachHang" class="form-select" required>
                        <option value="">Chọn khách hàng</option>
                        ${khachHangList.map(kh => `
                            <option value="${kh.MaKhachHang}">${kh.TenKhachHang}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="hideModal()">Hủy</button>
                    <button type="submit" class="btn btn-primary">Lưu</button>
                </div>
            </form>
        `;
        
        showModal('Thêm Hóa đơn', modalContent);
        
        // Handle form submission
        document.getElementById('hoadon-form').addEventListener('submit', handleAddSubmit);
    } catch (error) {
        console.error('Error loading data for form:', error);
        showNotification('Không thể tải dữ liệu cho form', 'error');
    }
}

async function handleAddSubmit(e) {
    e.preventDefault();
    
    const maBan = document.getElementById('maBan').value;
    const formData = {
        maHoaDon: document.getElementById('maHoaDon').value.trim(),
        thoiGianThanhToan: document.getElementById('thoiGianThanhToan').value || new Date().toISOString(),
        maNhanVien: document.getElementById('maNhanVien').value,
        maKhachHang: document.getElementById('maKhachHang').value
        // tongTien được tính tự động từ chi tiết hóa đơn
    };
    
    try {
        showLoading();
        // Tạo hóa đơn
        await hoaDonAPI.create(formData);
        
        // Tạo liên kết hóa đơn - bàn
        if (maBan) {
            await hoaDonBanAPI.create({
                maHoaDon: formData.maHoaDon,
                maBanAn: maBan
            });
        }
        
        hideModal();
        showNotification('Thêm hóa đơn thành công', 'success');
        await loadHoaDonData();
    } catch (error) {
        console.error('Error adding hóa đơn:', error);
        showNotification('Có lỗi xảy ra khi thêm hóa đơn', 'error');
    } finally {
        hideLoading();
    }
}

async function viewHoaDon(id) {
    try {
        showLoading();
        const [hoadon, nhanVienList, banAnList, khachHangList, chiTietHoaDonList, thucDonList, hoaDonBan] = await Promise.all([
            hoaDonAPI.getById(id),
            nhanVienAPI.getAll(),
            banAnAPI.getAll(),
            khachHangAPI.getAll(),
            chiTietHoaDonAPI.getByHoaDon(id),
            thucDonAPI.getAll(),
            hoaDonBanAPI.getByHoaDon(id)
        ]);
        
        const nhanVien = nhanVienList.find(nv => nv.MaNhanVien === hoadon.MaNhanVien);
        const banAn = banAnList.find(ba => ba.MaBanAn === hoaDonBan?.MaBanAn);
        const khachHang = khachHangList.find(kh => kh.MaKhachHang === hoadon.MaKhachHang);
        
        // Map thực đơn để lấy giá tiền
        const thucDonMap = {};
        thucDonList.forEach(td => {
            thucDonMap[td.TenMon] = td.GiaTien;
        });
        
        // Tạo bảng chi tiết hóa đơn
        const chiTietTable = chiTietHoaDonList.length > 0 ? `
            <div style="margin-top: 1rem;">
                <h4>Chi tiết món ăn:</h4>
                <table style="width: 100%; border-collapse: collapse; margin-top: 0.5rem;">
                    <thead>
                        <tr style="background-color: #f5f5f5;">
                            <th style="padding: 0.5rem; text-align: left; border: 1px solid #ddd;">Tên món</th>
                            <th style="padding: 0.5rem; text-align: center; border: 1px solid #ddd;">Số lượng</th>
                            <th style="padding: 0.5rem; text-align: right; border: 1px solid #ddd;">Đơn giá</th>
                            <th style="padding: 0.5rem; text-align: right; border: 1px solid #ddd;">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${chiTietHoaDonList.map(ct => {
                            const giaTien = thucDonMap[ct.TenMon] || 0;
                            const thanhTien = giaTien * ct.SoLuong;
                            return `
                                <tr>
                                    <td style="padding: 0.5rem; border: 1px solid #ddd;">${ct.TenMon}</td>
                                    <td style="padding: 0.5rem; text-align: center; border: 1px solid #ddd;">${ct.SoLuong}</td>
                                    <td style="padding: 0.5rem; text-align: right; border: 1px solid #ddd;">${formatCurrency(giaTien)}</td>
                                    <td style="padding: 0.5rem; text-align: right; border: 1px solid #ddd;">${formatCurrency(thanhTien)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        ` : '<div style="margin-top: 1rem;"><p>Chưa có chi tiết món ăn</p></div>';
        
        const modalContent = `
            <div style="padding: 1rem;">
                <div style="margin-bottom: 1rem;">
                    <strong>Mã hóa đơn:</strong> ${hoadon.MaHoaDon || 'N/A'}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Thời gian thanh toán:</strong> ${formatDateTime(hoadon.ThoiGianThanhToan)}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Tổng tiền:</strong> ${formatCurrency(hoadon.TongTien || 0)}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Nhân viên:</strong> ${nhanVien ? nhanVien.TenNhanVien : 'N/A'}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Bàn:</strong> ${banAn ? `Bàn ${banAn.MaBanAn} (${banAn.SucChua} người)` : 'N/A'}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Khách hàng:</strong> ${khachHang ? khachHang.TenKhachHang : 'N/A'}
                </div>
                ${chiTietTable}
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="hideModal()">Đóng</button>
            </div>
        `;
        
        showModal('Chi tiết Hóa đơn', modalContent);
    } catch (error) {
        console.error('Error viewing hóa đơn:', error);
        showNotification('Không thể tải thông tin hóa đơn', 'error');
    } finally {
        hideLoading();
    }
}

async function editHoaDon(id) {
    try {
        showLoading();
        const [hoadon, nhanVienList, banAnList, khachHangList, hoaDonBan] = await Promise.all([
            hoaDonAPI.getById(id),
            nhanVienAPI.getAll(),
            banAnAPI.getAll(),
            khachHangAPI.getAll(),
            hoaDonBanAPI.getByHoaDon(id)
        ]);
        
        const modalContent = `
            <form id="edit-hoadon-form">
                <input type="hidden" id="edit-id" value="${hoadon.MaHoaDon}">
                <div class="form-group">
                    <label class="form-label" for="edit-thoiGianThanhToan">Thời gian thanh toán</label>
                    <input type="datetime-local" id="edit-thoiGianThanhToan" class="form-input" value="${formatDateTimeForInput(hoadon.ThoiGianThanhToan)}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="edit-tongTien">Tổng tiền</label>
                    <input type="text" id="edit-tongTien" class="form-input" value="${formatCurrency(hoadon.TongTien || 0)}" readonly>
                    <small class="form-text">Tổng tiền được tính tự động từ chi tiết hóa đơn</small>
                </div>
                <div class="form-group">
                    <label class="form-label" for="edit-maNhanVien">Nhân viên *</label>
                    <select id="edit-maNhanVien" class="form-select" required>
                        <option value="">Chọn nhân viên</option>
                        ${nhanVienList.map(nv => `
                            <option value="${nv.MaNhanVien}" ${hoadon.MaNhanVien === nv.MaNhanVien ? 'selected' : ''}>
                                ${nv.TenNhanVien}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="edit-maBan">Bàn *</label>
                    <select id="edit-maBan" class="form-select" required>
                        <option value="">Chọn bàn</option>
                        ${banAnList.map(ba => `
                            <option value="${ba.MaBanAn}" ${hoaDonBan?.MaBanAn === ba.MaBanAn ? 'selected' : ''}>
                                Bàn ${ba.MaBanAn} (${ba.SucChua} người)
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="edit-maKhachHang">Khách hàng *</label>
                    <select id="edit-maKhachHang" class="form-select" required>
                        <option value="">Chọn khách hàng</option>
                        ${khachHangList.map(kh => `
                            <option value="${kh.MaKhachHang}" ${hoadon.MaKhachHang === kh.MaKhachHang ? 'selected' : ''}>
                                ${kh.TenKhachHang}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="hideModal()">Hủy</button>
                    <button type="submit" class="btn btn-primary">Cập nhật</button>
                </div>
            </form>
        `;
        
        showModal('Chỉnh sửa Hóa đơn', modalContent);
        
        // Handle form submission
        document.getElementById('edit-hoadon-form').addEventListener('submit', handleEditSubmit);
    } catch (error) {
        console.error('Error editing hóa đơn:', error);
        showNotification('Không thể tải thông tin hóa đơn', 'error');
    } finally {
        hideLoading();
    }
}

async function handleEditSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('edit-id').value;
    const maBan = document.getElementById('edit-maBan').value;
    const formData = {
        thoiGianThanhToan: document.getElementById('edit-thoiGianThanhToan').value || new Date().toISOString(),
        maNhanVien: document.getElementById('edit-maNhanVien').value,
        maKhachHang: document.getElementById('edit-maKhachHang').value
        // tongTien được tính tự động từ chi tiết hóa đơn
    };
    
    try {
        showLoading();
        // Cập nhật hóa đơn
        await hoaDonAPI.update(id, formData);
        
        // Cập nhật liên kết hóa đơn - bàn
        if (maBan) {
            await hoaDonBanAPI.update(id, {
                maBanAn: maBan
            });
        }
        
        hideModal();
        showNotification('Cập nhật hóa đơn thành công', 'success');
        await loadHoaDonData();
    } catch (error) {
        console.error('Error updating hóa đơn:', error);
        showNotification('Có lỗi xảy ra khi cập nhật hóa đơn', 'error');
    } finally {
        hideLoading();
    }
}

async function deleteHoaDon(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) {
        return;
    }
    
    try {
        showLoading();
        // Xóa liên kết hóa đơn - bàn trước
        try {
            await hoaDonBanAPI.delete(id);
        } catch (e) {
            // Bỏ qua lỗi nếu không có liên kết
        }
        
        // Xóa hóa đơn
        await hoaDonAPI.delete(id);
        showNotification('Xóa hóa đơn thành công', 'success');
        await loadHoaDonData();
    } catch (error) {
        console.error('Error deleting hóa đơn:', error);
        showNotification('Có lỗi xảy ra khi xóa hóa đơn', 'error');
    } finally {
        hideLoading();
    }
}

// Helper functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function formatDateTime(dateTime) {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateTimeForInput(dateTime) {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toISOString().slice(0, 16);
} 