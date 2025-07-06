// Chi tiết hóa đơn module
import { showLoading, hideLoading, showNotification, showModal, hideModal } from '../utils.js';
import { chiTietHoaDonAPI, hoaDonAPI, thucDonAPI } from '../api.js';

export async function initChiTietHoaDon() {
    const mainContent = document.getElementById('main-content');
    
    try {
        showLoading();
        
        // Render chi tiết hóa đơn layout
        mainContent.innerHTML = `
            <div class="data-table-container">
                <div class="table-header">
                    <h3 class="table-title">Danh sách Chi tiết Hóa đơn</h3>
                    <button class="add-button" id="add-chitiethoadon-btn">
                        <i class="fas fa-plus"></i>
                        Thêm Chi tiết Hóa đơn
                    </button>
                </div>
                <div class="table-content">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Mã hóa đơn</th>
                                <th>Tên món</th>
                                <th>Số lượng</th>
                                <th>Đơn giá</th>
                                <th>Thành tiền</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody id="chitiethoadon-table-body">
                            <tr>
                                <td colspan="6" class="text-center">
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
        await loadChiTietHoaDonData();
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing chi tiết hóa đơn module:', error);
        showNotification('Có lỗi xảy ra khi tải trang chi tiết hóa đơn', 'error');
    } finally {
        hideLoading();
    }
}

async function loadChiTietHoaDonData() {
    try {
        const [chiTietHoaDonData, thucDonData] = await Promise.all([
            chiTietHoaDonAPI.getAll(),
            thucDonAPI.getAll()
        ]);
        
        // Map thực đơn data để lấy giá tiền
        const thucDonMap = {};
        thucDonData.forEach(td => {
            thucDonMap[td.TenMon] = td.GiaTien;
        });
        
        const enrichedData = chiTietHoaDonData.map(ct => ({
            ...ct,
            GiaTien: thucDonMap[ct.TenMon] || 0,
            ThanhTien: (thucDonMap[ct.TenMon] || 0) * ct.SoLuong
        }));
        
        renderChiTietHoaDonTable(enrichedData);
    } catch (error) {
        console.error('Error loading chi tiết hóa đơn data:', error);
        showNotification('Không thể tải dữ liệu chi tiết hóa đơn', 'error');
        renderChiTietHoaDonTable([]);
    }
}

function renderChiTietHoaDonTable(data) {
    const tableBody = document.getElementById('chitiethoadon-table-body');
    
    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="empty-state">
                        <i class="fas fa-receipt"></i>
                        <h3>Chưa có chi tiết hóa đơn nào</h3>
                        <p>Hãy thêm chi tiết hóa đơn đầu tiên</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = data.map(ct => `
        <tr>
            <td><strong>${ct.MaHoaDon || 'N/A'}</strong></td>
            <td>${ct.TenMon || 'N/A'}</td>
            <td>${ct.SoLuong || 0}</td>
            <td>${formatCurrency(ct.GiaTien || 0)}</td>
            <td>${formatCurrency(ct.ThanhTien || 0)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-view" onclick="viewChiTietHoaDon('${ct.MaHoaDon}', '${ct.TenMon}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-edit" onclick="editChiTietHoaDon('${ct.MaHoaDon}', '${ct.TenMon}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-delete" onclick="deleteChiTietHoaDon('${ct.MaHoaDon}', '${ct.TenMon}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function setupEventListeners() {
    // Add button
    document.getElementById('add-chitiethoadon-btn').addEventListener('click', showAddModal);
    
    // Modal close button
    document.getElementById('modal-close').addEventListener('click', hideModal);
    
    // Global functions for table actions
    window.viewChiTietHoaDon = viewChiTietHoaDon;
    window.editChiTietHoaDon = editChiTietHoaDon;
    window.deleteChiTietHoaDon = deleteChiTietHoaDon;
}

async function showAddModal() {
    try {
        const [hoaDonList, thucDonList] = await Promise.all([
            hoaDonAPI.getAll(),
            thucDonAPI.getAll()
        ]);
        
        const modalContent = `
            <form id="chitiethoadon-form">
                <div class="form-group">
                    <label class="form-label" for="maHoaDon">Mã hóa đơn *</label>
                    <select id="maHoaDon" class="form-select" required>
                        <option value="">Chọn hóa đơn</option>
                        ${hoaDonList.map(hd => `
                            <option value="${hd.MaHoaDon}">${hd.MaHoaDon} - ${formatCurrency(hd.TongTien || 0)}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="tenMon">Tên món *</label>
                    <select id="tenMon" class="form-select" required>
                        <option value="">Chọn món</option>
                        ${thucDonList.map(td => `
                            <option value="${td.TenMon}" data-gia="${td.GiaTien}">${td.TenMon} - ${formatCurrency(td.GiaTien)}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="soLuong">Số lượng *</label>
                    <input type="number" id="soLuong" class="form-input" min="1" value="1" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="giaTien">Đơn giá</label>
                    <input type="number" id="giaTien" class="form-input" min="0" step="1000" readonly>
                </div>
                <div class="form-group">
                    <label class="form-label" for="thanhTien">Thành tiền</label>
                    <input type="number" id="thanhTien" class="form-input" min="0" step="1000" readonly>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="hideModal()">Hủy</button>
                    <button type="submit" class="btn btn-primary">Lưu</button>
                </div>
            </form>
        `;
        
        showModal('Thêm Chi tiết Hóa đơn', modalContent);
        
        // Setup form event listeners
        setupFormEventListeners();
        
        // Handle form submission
        document.getElementById('chitiethoadon-form').addEventListener('submit', handleAddSubmit);
    } catch (error) {
        console.error('Error loading data for form:', error);
        showNotification('Không thể tải dữ liệu cho form', 'error');
    }
}

function setupFormEventListeners() {
    const tenMonSelect = document.getElementById('tenMon');
    const soLuongInput = document.getElementById('soLuong');
    const giaTienInput = document.getElementById('giaTien');
    const thanhTienInput = document.getElementById('thanhTien');
    
    function updatePrices() {
        const selectedOption = tenMonSelect.options[tenMonSelect.selectedIndex];
        const giaTien = selectedOption ? parseFloat(selectedOption.dataset.gia) || 0 : 0;
        const soLuong = parseFloat(soLuongInput.value) || 0;
        
        giaTienInput.value = giaTien;
        thanhTienInput.value = giaTien * soLuong;
    }
    
    tenMonSelect.addEventListener('change', updatePrices);
    soLuongInput.addEventListener('input', updatePrices);
}

async function handleAddSubmit(e) {
    e.preventDefault();
    
    const formData = {
        maHoaDon: document.getElementById('maHoaDon').value,
        tenMon: document.getElementById('tenMon').value,
        soLuong: parseInt(document.getElementById('soLuong').value),
        giaTien: parseFloat(document.getElementById('giaTien').value)
    };
    
    try {
        showLoading();
        await chiTietHoaDonAPI.create(formData);
        hideModal();
        showNotification('Thêm chi tiết hóa đơn thành công', 'success');
        await loadChiTietHoaDonData();
    } catch (error) {
        console.error('Error adding chi tiết hóa đơn:', error);
        showNotification('Có lỗi xảy ra khi thêm chi tiết hóa đơn', 'error');
    } finally {
        hideLoading();
    }
}

async function viewChiTietHoaDon(maHoaDon, tenMon) {
    try {
        showLoading();
        const [chiTietHoaDon, thucDon] = await Promise.all([
            chiTietHoaDonAPI.getById(`${maHoaDon}/${tenMon}`),
            thucDonAPI.getById(tenMon)
        ]);
        
        const modalContent = `
            <div style="padding: 1rem;">
                <div style="margin-bottom: 1rem;">
                    <strong>Mã hóa đơn:</strong> ${chiTietHoaDon.MaHoaDon || 'N/A'}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Tên món:</strong> ${chiTietHoaDon.TenMon || 'N/A'}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Số lượng:</strong> ${chiTietHoaDon.SoLuong || 0}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Đơn giá:</strong> ${formatCurrency(thucDon?.GiaTien || 0)}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Thành tiền:</strong> ${formatCurrency((thucDon?.GiaTien || 0) * (chiTietHoaDon.SoLuong || 0))}
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="hideModal()">Đóng</button>
            </div>
        `;
        
        showModal('Chi tiết Hóa đơn', modalContent);
    } catch (error) {
        console.error('Error viewing chi tiết hóa đơn:', error);
        showNotification('Không thể tải thông tin chi tiết hóa đơn', 'error');
    } finally {
        hideLoading();
    }
}

async function editChiTietHoaDon(maHoaDon, tenMon) {
    try {
        showLoading();
        const [chiTietHoaDon, hoaDonList, thucDonList] = await Promise.all([
            chiTietHoaDonAPI.getById(`${maHoaDon}/${tenMon}`),
            hoaDonAPI.getAll(),
            thucDonAPI.getAll()
        ]);
        
        const modalContent = `
            <form id="edit-chitiethoadon-form">
                <input type="hidden" id="edit-maHoaDon" value="${chiTietHoaDon.MaHoaDon}">
                <input type="hidden" id="edit-tenMon" value="${chiTietHoaDon.TenMon}">
                <div class="form-group">
                    <label class="form-label" for="edit-maHoaDon-display">Mã hóa đơn</label>
                    <input type="text" id="edit-maHoaDon-display" class="form-input" value="${chiTietHoaDon.MaHoaDon}" readonly>
                </div>
                <div class="form-group">
                    <label class="form-label" for="edit-tenMon-display">Tên món</label>
                    <input type="text" id="edit-tenMon-display" class="form-input" value="${chiTietHoaDon.TenMon}" readonly>
                </div>
                <div class="form-group">
                    <label class="form-label" for="edit-soLuong">Số lượng *</label>
                    <input type="number" id="edit-soLuong" class="form-input" value="${chiTietHoaDon.SoLuong || 1}" min="1" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="hideModal()">Hủy</button>
                    <button type="submit" class="btn btn-primary">Cập nhật</button>
                </div>
            </form>
        `;
        
        showModal('Chỉnh sửa Chi tiết Hóa đơn', modalContent);
        
        // Handle form submission
        document.getElementById('edit-chitiethoadon-form').addEventListener('submit', handleEditSubmit);
    } catch (error) {
        console.error('Error editing chi tiết hóa đơn:', error);
        showNotification('Không thể tải thông tin chi tiết hóa đơn', 'error');
    } finally {
        hideLoading();
    }
}

async function handleEditSubmit(e) {
    e.preventDefault();
    
    const maHoaDon = document.getElementById('edit-maHoaDon').value;
    const tenMon = document.getElementById('edit-tenMon').value;
    const formData = {
        maHoaDon: maHoaDon,
        tenMon: tenMon,
        soLuong: parseInt(document.getElementById('edit-soLuong').value)
    };
    
    try {
        showLoading();
        await chiTietHoaDonAPI.update(`${maHoaDon}/${tenMon}`, formData);
        hideModal();
        showNotification('Cập nhật chi tiết hóa đơn thành công', 'success');
        await loadChiTietHoaDonData();
    } catch (error) {
        console.error('Error updating chi tiết hóa đơn:', error);
        showNotification('Có lỗi xảy ra khi cập nhật chi tiết hóa đơn', 'error');
    } finally {
        hideLoading();
    }
}

async function deleteChiTietHoaDon(maHoaDon, tenMon) {
    if (!confirm('Bạn có chắc chắn muốn xóa chi tiết hóa đơn này?')) {
        return;
    }
    
    try {
        showLoading();
        await chiTietHoaDonAPI.delete(`${maHoaDon}/${tenMon}`);
        showNotification('Xóa chi tiết hóa đơn thành công', 'success');
        await loadChiTietHoaDonData();
    } catch (error) {
        console.error('Error deleting chi tiết hóa đơn:', error);
        showNotification('Có lỗi xảy ra khi xóa chi tiết hóa đơn', 'error');
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