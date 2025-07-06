// Nhà hàng module
import { showLoading, hideLoading, showNotification, showModal, hideModal } from '../utils.js';
import { nhaHangAPI } from '../api.js';

export async function initNhaHang() {
    const mainContent = document.getElementById('main-content');
    
    try {
        showLoading();
        
        // Render nhà hàng layout
        mainContent.innerHTML = `
            <div class="data-table-container">
                <div class="table-header">
                    <h3 class="table-title">Danh sách Nhà hàng</h3>
                    <button class="add-button" id="add-nhahang-btn">
                        <i class="fas fa-plus"></i>
                        Thêm Nhà hàng
                    </button>
                </div>
                <div class="table-content">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Mã nhà hàng</th>
                                <th>Tên nhà hàng</th>
                                <th>Địa chỉ</th>
                                <th>Số điện thoại</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody id="nhahang-table-body">
                            <tr>
                                <td colspan="5" class="text-center">
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
        await loadNhaHangData();
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing nhà hàng module:', error);
        showNotification('Có lỗi xảy ra khi tải trang nhà hàng', 'error');
    } finally {
        hideLoading();
    }
}

async function loadNhaHangData() {
    try {
        const data = await nhaHangAPI.getAll();
        renderNhaHangTable(data);
    } catch (error) {
        console.error('Error loading nhà hàng data:', error);
        showNotification('Không thể tải dữ liệu nhà hàng', 'error');
        renderNhaHangTable([]);
    }
}

function renderNhaHangTable(data) {
    const tableBody = document.getElementById('nhahang-table-body');
    
    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="empty-state">
                        <i class="fas fa-building"></i>
                        <h3>Chưa có nhà hàng nào</h3>
                        <p>Hãy thêm nhà hàng đầu tiên</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = data.map(nh => `
        <tr>
            <td><strong>${nh.MaNhaHang || 'N/A'}</strong></td>
            <td>
                <div style="font-weight: 500; color: #1e293b;">${nh.TenNhaHang || 'N/A'}</div>
            </td>
            <td>${nh.DiaChi || 'N/A'}</td>
            <td>${nh.SoDienThoai || 'N/A'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-view" onclick="viewNhaHang('${nh.MaNhaHang}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-edit" onclick="editNhaHang('${nh.MaNhaHang}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-delete" onclick="deleteNhaHang('${nh.MaNhaHang}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function setupEventListeners() {
    // Add button
    document.getElementById('add-nhahang-btn').addEventListener('click', showAddModal);
    
    // Modal close button
    document.getElementById('modal-close').addEventListener('click', hideModal);
    
    // Global functions for table actions
    window.viewNhaHang = viewNhaHang;
    window.editNhaHang = editNhaHang;
    window.deleteNhaHang = deleteNhaHang;
}

function showAddModal() {
    const modalContent = `
        <form id="nhahang-form">
            <div class="form-group">
                <label class="form-label" for="maNhaHang">Mã nhà hàng *</label>
                <input type="text" id="maNhaHang" class="form-input" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="tenNhaHang">Tên nhà hàng *</label>
                <input type="text" id="tenNhaHang" class="form-input" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="diaChi">Địa chỉ *</label>
                <input type="text" id="diaChi" class="form-input" required>
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
    
    showModal('Thêm Nhà hàng', modalContent);
    
    // Handle form submission
    document.getElementById('nhahang-form').addEventListener('submit', handleAddSubmit);
}

async function handleAddSubmit(e) {
    e.preventDefault();
    
    const formData = {
        maNhaHang: document.getElementById('maNhaHang').value.trim(),
        tenNhaHang: document.getElementById('tenNhaHang').value.trim(),
        diaChi: document.getElementById('diaChi').value.trim(),
        soDienThoai: document.getElementById('soDienThoai').value.trim()
    };
    
    try {
        showLoading();
        await nhaHangAPI.create(formData);
        hideModal();
        showNotification('Thêm nhà hàng thành công', 'success');
        await loadNhaHangData();
    } catch (error) {
        console.error('Error adding nhà hàng:', error);
        showNotification('Có lỗi xảy ra khi thêm nhà hàng', 'error');
    } finally {
        hideLoading();
    }
}

async function viewNhaHang(id) {
    try {
        showLoading();
        const nhahang = await nhaHangAPI.getById(id);
        
        const modalContent = `
            <div style="padding: 1rem;">
                <div style="margin-bottom: 1rem;">
                    <strong>Mã nhà hàng:</strong> ${nhahang.MaNhaHang || 'N/A'}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Tên nhà hàng:</strong> ${nhahang.TenNhaHang || 'N/A'}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Địa chỉ:</strong> ${nhahang.DiaChi || 'N/A'}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Số điện thoại:</strong> ${nhahang.SoDienThoai || 'N/A'}
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="hideModal()">Đóng</button>
            </div>
        `;
        
        showModal('Chi tiết Nhà hàng', modalContent);
    } catch (error) {
        console.error('Error viewing nhà hàng:', error);
        showNotification('Không thể tải thông tin nhà hàng', 'error');
    } finally {
        hideLoading();
    }
}

async function editNhaHang(id) {
    try {
        showLoading();
        const nhahang = await nhaHangAPI.getById(id);
        
        const modalContent = `
            <form id="edit-nhahang-form">
                <input type="hidden" id="edit-id" value="${nhahang.MaNhaHang}">
                <div class="form-group">
                    <label class="form-label" for="edit-tenNhaHang">Tên nhà hàng *</label>
                    <input type="text" id="edit-tenNhaHang" class="form-input" value="${nhahang.TenNhaHang || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="edit-diaChi">Địa chỉ *</label>
                    <input type="text" id="edit-diaChi" class="form-input" value="${nhahang.DiaChi || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="edit-soDienThoai">Số điện thoại</label>
                    <input type="tel" id="edit-soDienThoai" class="form-input" value="${nhahang.SoDienThoai || ''}">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="hideModal()">Hủy</button>
                    <button type="submit" class="btn btn-primary">Cập nhật</button>
                </div>
            </form>
        `;
        
        showModal('Chỉnh sửa Nhà hàng', modalContent);
        
        // Handle form submission
        document.getElementById('edit-nhahang-form').addEventListener('submit', handleEditSubmit);
    } catch (error) {
        console.error('Error editing nhà hàng:', error);
        showNotification('Không thể tải thông tin nhà hàng', 'error');
    } finally {
        hideLoading();
    }
}

async function handleEditSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('edit-id').value;
    const formData = {
        tenNhaHang: document.getElementById('edit-tenNhaHang').value.trim(),
        diaChi: document.getElementById('edit-diaChi').value.trim(),
        soDienThoai: document.getElementById('edit-soDienThoai').value.trim()
    };
    
    try {
        showLoading();
        await nhaHangAPI.update(id, formData);
        hideModal();
        showNotification('Cập nhật nhà hàng thành công', 'success');
        await loadNhaHangData();
    } catch (error) {
        console.error('Error updating nhà hàng:', error);
        showNotification('Có lỗi xảy ra khi cập nhật nhà hàng', 'error');
    } finally {
        hideLoading();
    }
}

async function deleteNhaHang(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa nhà hàng này?')) {
        return;
    }
    
    try {
        showLoading();
        await nhaHangAPI.delete(id);
        showNotification('Xóa nhà hàng thành công', 'success');
        await loadNhaHangData();
    } catch (error) {
        console.error('Error deleting nhà hàng:', error);
        showNotification('Có lỗi xảy ra khi xóa nhà hàng', 'error');
    } finally {
        hideLoading();
    }
} 