// Khách hàng module
import { showLoading, hideLoading, showNotification, showModal, hideModal } from '../utils.js';
import { khachHangAPI } from '../api.js';

export async function initKhachHang() {
    const mainContent = document.getElementById('main-content');
    
    try {
        showLoading();
        
        // Render khách hàng layout
        mainContent.innerHTML = `
            <div class="data-table-container">
                <div class="table-header">
                    <h3 class="table-title">Danh sách Khách hàng</h3>
                    <button class="add-button" id="add-khachhang-btn">
                        <i class="fas fa-plus"></i>
                        Thêm Khách hàng
                    </button>
                </div>
                <div class="table-content">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Mã khách hàng</th>
                                <th>Tên khách hàng</th>
                                <th>Số điện thoại</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody id="khachhang-table-body">
                            <tr>
                                <td colspan="4" class="text-center">
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
        await loadKhachHangData();
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing khách hàng module:', error);
        showNotification('Có lỗi xảy ra khi tải trang khách hàng', 'error');
    } finally {
        hideLoading();
    }
}

async function loadKhachHangData() {
    try {
        const data = await khachHangAPI.getAll();
        renderKhachHangTable(data);
    } catch (error) {
        console.error('Error loading khách hàng data:', error);
        showNotification('Không thể tải dữ liệu khách hàng', 'error');
        renderKhachHangTable([]);
    }
}

function renderKhachHangTable(data) {
    const tableBody = document.getElementById('khachhang-table-body');
    
    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">
                    <div class="empty-state">
                        <i class="fas fa-users"></i>
                        <h3>Chưa có khách hàng nào</h3>
                        <p>Hãy thêm khách hàng đầu tiên</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = data.map(kh => `
        <tr>
            <td><strong>${kh.MaKhachHang || 'N/A'}</strong></td>
            <td>
                <div style="font-weight: 500; color: #1e293b;">${kh.TenKhachHang || 'N/A'}</div>
            </td>
            <td>${kh.SoDienThoai || 'N/A'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-view" onclick="viewKhachHang('${kh.MaKhachHang}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-edit" onclick="editKhachHang('${kh.MaKhachHang}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-delete" onclick="deleteKhachHang('${kh.MaKhachHang}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function setupEventListeners() {
    // Add button
    document.getElementById('add-khachhang-btn').addEventListener('click', showAddModal);
    
    // Modal close button
    document.getElementById('modal-close').addEventListener('click', hideModal);
    
    // Global functions for table actions
    window.viewKhachHang = viewKhachHang;
    window.editKhachHang = editKhachHang;
    window.deleteKhachHang = deleteKhachHang;
}

function showAddModal() {
    const modalContent = `
        <form id="khachhang-form">
            <div class="form-group">
                <label class="form-label" for="maKhachHang">Mã khách hàng *</label>
                <input type="text" id="maKhachHang" class="form-input" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="tenKhachHang">Tên khách hàng *</label>
                <input type="text" id="tenKhachHang" class="form-input" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="soDienThoai">Số điện thoại</label>
                <input type="tel" id="soDienThoai" class="form-input">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="hideModal()">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu</button>
            </div>
        </form>
    `;
    
    showModal('Thêm Khách hàng', modalContent);
    
    // Handle form submission
    document.getElementById('khachhang-form').addEventListener('submit', handleAddSubmit);
}

async function handleAddSubmit(e) {
    e.preventDefault();
    
    const formData = {
        maKhachHang: document.getElementById('maKhachHang').value.trim(),
        tenKhachHang: document.getElementById('tenKhachHang').value.trim(),
        soDienThoai: document.getElementById('soDienThoai').value.trim()
    };
    
    try {
        showLoading();
        await khachHangAPI.create(formData);
        hideModal();
        showNotification('Thêm khách hàng thành công', 'success');
        await loadKhachHangData();
    } catch (error) {
        console.error('Error adding khách hàng:', error);
        showNotification('Có lỗi xảy ra khi thêm khách hàng', 'error');
    } finally {
        hideLoading();
    }
}

async function viewKhachHang(id) {
    try {
        showLoading();
        const khachhang = await khachHangAPI.getById(id);
        
        const modalContent = `
            <div style="padding: 1rem;">
                <div style="margin-bottom: 1rem;">
                    <strong>Mã khách hàng:</strong> ${khachhang.MaKhachHang || 'N/A'}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Tên khách hàng:</strong> ${khachhang.TenKhachHang || 'N/A'}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Số điện thoại:</strong> ${khachhang.SoDienThoai || 'N/A'}
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="hideModal()">Đóng</button>
            </div>
        `;
        
        showModal('Chi tiết Khách hàng', modalContent);
    } catch (error) {
        console.error('Error viewing khách hàng:', error);
        showNotification('Không thể tải thông tin khách hàng', 'error');
    } finally {
        hideLoading();
    }
}

async function editKhachHang(id) {
    try {
        showLoading();
        const khachhang = await khachHangAPI.getById(id);
        
        const modalContent = `
            <form id="edit-khachhang-form">
                <input type="hidden" id="edit-id" value="${khachhang.MaKhachHang}">
                <div class="form-group">
                    <label class="form-label" for="edit-tenKhachHang">Tên khách hàng *</label>
                    <input type="text" id="edit-tenKhachHang" class="form-input" value="${khachhang.TenKhachHang || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="edit-soDienThoai">Số điện thoại</label>
                    <input type="tel" id="edit-soDienThoai" class="form-input" value="${khachhang.SoDienThoai || ''}">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="hideModal()">Hủy</button>
                    <button type="submit" class="btn btn-primary">Cập nhật</button>
                </div>
            </form>
        `;
        
        showModal('Chỉnh sửa Khách hàng', modalContent);
        
        // Handle form submission
        document.getElementById('edit-khachhang-form').addEventListener('submit', handleEditSubmit);
    } catch (error) {
        console.error('Error editing khách hàng:', error);
        showNotification('Không thể tải thông tin khách hàng', 'error');
    } finally {
        hideLoading();
    }
}

async function handleEditSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('edit-id').value;
    const formData = {
        tenKhachHang: document.getElementById('edit-tenKhachHang').value.trim(),
        soDienThoai: document.getElementById('edit-soDienThoai').value.trim()
    };
    
    try {
        showLoading();
        await khachHangAPI.update(id, formData);
        hideModal();
        showNotification('Cập nhật khách hàng thành công', 'success');
        await loadKhachHangData();
    } catch (error) {
        console.error('Error updating khách hàng:', error);
        showNotification('Có lỗi xảy ra khi cập nhật khách hàng', 'error');
    } finally {
        hideLoading();
    }
}

async function deleteKhachHang(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
        return;
    }
    
    try {
        showLoading();
        await khachHangAPI.delete(id);
        showNotification('Xóa khách hàng thành công', 'success');
        await loadKhachHangData();
    } catch (error) {
        console.error('Error deleting khách hàng:', error);
        showNotification('Có lỗi xảy ra khi xóa khách hàng', 'error');
    } finally {
        hideLoading();
    }
} 