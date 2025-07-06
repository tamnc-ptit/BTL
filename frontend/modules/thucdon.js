// Thực đơn module
import { showLoading, hideLoading, showNotification, showModal, hideModal } from '../utils.js';
import { thucDonAPI } from '../api.js';

export async function initThucDon() {
    const mainContent = document.getElementById('main-content');
    
    try {
        showLoading();
        
        // Render thực đơn layout
        mainContent.innerHTML = `
            <div class="data-table-container">
                <div class="table-header">
                    <h3 class="table-title">Danh sách Thực đơn</h3>
                    <button class="add-button" id="add-thucdon-btn">
                        <i class="fas fa-plus"></i>
                        Thêm Món ăn
                    </button>
                </div>
                <div class="table-content">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Tên món</th>
                                <th>Loại</th>
                                <th>Giá tiền</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody id="thucdon-table-body">
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
        await loadThucDonData();
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing thực đơn module:', error);
        showNotification('Có lỗi xảy ra khi tải trang thực đơn', 'error');
    } finally {
        hideLoading();
    }
}

async function loadThucDonData() {
    try {
        const data = await thucDonAPI.getAll();
        renderThucDonTable(data);
    } catch (error) {
        console.error('Error loading thực đơn data:', error);
        showNotification('Không thể tải dữ liệu thực đơn', 'error');
        renderThucDonTable([]);
    }
}

function renderThucDonTable(data) {
    const tableBody = document.getElementById('thucdon-table-body');
    
    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">
                    <div class="empty-state">
                        <i class="fas fa-utensils"></i>
                        <h3>Chưa có món ăn nào</h3>
                        <p>Hãy thêm món ăn đầu tiên</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = data.map(td => `
        <tr>
            <td>
                <div style="font-weight: 500; color: #1e293b;">${td.TenMon || 'N/A'}</div>
            </td>
            <td>
                <span class="category-badge">${td.Loai || 'N/A'}</span>
            </td>
            <td>${formatCurrency(td.GiaTien || 0)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-view" onclick="viewThucDon('${encodeURIComponent(td.TenMon)}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-edit" onclick="editThucDon('${encodeURIComponent(td.TenMon)}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-delete" onclick="deleteThucDon('${encodeURIComponent(td.TenMon)}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function setupEventListeners() {
    // Add button
    document.getElementById('add-thucdon-btn').addEventListener('click', showAddModal);
    
    // Modal close button
    document.getElementById('modal-close').addEventListener('click', hideModal);
    
    // Global functions for table actions
    window.viewThucDon = viewThucDon;
    window.editThucDon = editThucDon;
    window.deleteThucDon = deleteThucDon;
}

function showAddModal() {
    const modalContent = `
        <form id="thucdon-form">
            <div class="form-group">
                <label class="form-label" for="tenMon">Tên món *</label>
                <input type="text" id="tenMon" class="form-input" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="loai">Loại món *</label>
                <select id="loai" class="form-select" required>
                    <option value="">Chọn loại món</option>
                    <option value="Món chính">Món chính</option>
                    <option value="Món phụ">Món phụ</option>
                    <option value="Đồ uống">Đồ uống</option>
                    <option value="Tráng miệng">Tráng miệng</option>
                    <option value="Khai vị">Khai vị</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label" for="giaTien">Giá tiền *</label>
                <input type="number" id="giaTien" class="form-input" min="0" step="1000" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="hideModal()">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu</button>
            </div>
        </form>
    `;
    
    showModal('Thêm Món ăn', modalContent);
    
    // Handle form submission
    document.getElementById('thucdon-form').addEventListener('submit', handleAddSubmit);
}

async function handleAddSubmit(e) {
    e.preventDefault();
    
    const formData = {
        tenMon: document.getElementById('tenMon').value.trim(),
        loai: document.getElementById('loai').value,
        giaTien: parseFloat(document.getElementById('giaTien').value)
    };
    
    try {
        showLoading();
        await thucDonAPI.create(formData);
        hideModal();
        showNotification('Thêm món ăn thành công', 'success');
        await loadThucDonData();
    } catch (error) {
        console.error('Error adding món ăn:', error);
        showNotification('Có lỗi xảy ra khi thêm món ăn', 'error');
    } finally {
        hideLoading();
    }
}

async function viewThucDon(encodedId) {
    try {
        showLoading();
        const id = decodeURIComponent(encodedId);
        const thucdon = await thucDonAPI.getById(id);
        
        const modalContent = `
            <div style="padding: 1rem;">
                <div style="margin-bottom: 1rem;">
                    <strong>Tên món:</strong> ${thucdon.TenMon || 'N/A'}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Loại:</strong> 
                    <span class="category-badge">${thucdon.Loai || 'N/A'}</span>
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Giá tiền:</strong> ${formatCurrency(thucdon.GiaTien || 0)}
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="hideModal()">Đóng</button>
            </div>
        `;
        
        showModal('Chi tiết Món ăn', modalContent);
    } catch (error) {
        console.error('Error viewing món ăn:', error);
        showNotification('Không thể tải thông tin món ăn', 'error');
    } finally {
        hideLoading();
    }
}

async function editThucDon(encodedId) {
    try {
        showLoading();
        const id = decodeURIComponent(encodedId);
        const thucdon = await thucDonAPI.getById(id);
        
        const modalContent = `
            <form id="edit-thucdon-form">
                <input type="hidden" id="edit-id" value="${thucdon.TenMon}">
                <div class="form-group">
                    <label class="form-label" for="edit-loai">Loại món *</label>
                    <select id="edit-loai" class="form-select" required>
                        <option value="">Chọn loại món</option>
                        <option value="Món chính" ${thucdon.Loai === 'Món chính' ? 'selected' : ''}>Món chính</option>
                        <option value="Món phụ" ${thucdon.Loai === 'Món phụ' ? 'selected' : ''}>Món phụ</option>
                        <option value="Đồ uống" ${thucdon.Loai === 'Đồ uống' ? 'selected' : ''}>Đồ uống</option>
                        <option value="Tráng miệng" ${thucdon.Loai === 'Tráng miệng' ? 'selected' : ''}>Tráng miệng</option>
                        <option value="Khai vị" ${thucdon.Loai === 'Khai vị' ? 'selected' : ''}>Khai vị</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="edit-giaTien">Giá tiền *</label>
                    <input type="number" id="edit-giaTien" class="form-input" value="${thucdon.GiaTien || ''}" min="0" step="1000" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="hideModal()">Hủy</button>
                    <button type="submit" class="btn btn-primary">Cập nhật</button>
                </div>
            </form>
        `;
        
        showModal('Chỉnh sửa Món ăn', modalContent);
        
        // Handle form submission
        document.getElementById('edit-thucdon-form').addEventListener('submit', handleEditSubmit);
    } catch (error) {
        console.error('Error editing món ăn:', error);
        showNotification('Không thể tải thông tin món ăn', 'error');
    } finally {
        hideLoading();
    }
}

async function handleEditSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('edit-id').value;
    const formData = {
        loai: document.getElementById('edit-loai').value,
        giaTien: parseFloat(document.getElementById('edit-giaTien').value)
    };
    
    try {
        showLoading();
        await thucDonAPI.update(id, formData);
        hideModal();
        showNotification('Cập nhật món ăn thành công', 'success');
        await loadThucDonData();
    } catch (error) {
        console.error('Error updating món ăn:', error);
        showNotification('Có lỗi xảy ra khi cập nhật món ăn', 'error');
    } finally {
        hideLoading();
    }
}

async function deleteThucDon(encodedId) {
    if (!confirm('Bạn có chắc chắn muốn xóa món ăn này?')) {
        return;
    }
    
    try {
        showLoading();
        const id = decodeURIComponent(encodedId);
        await thucDonAPI.delete(id);
        showNotification('Xóa món ăn thành công', 'success');
        await loadThucDonData();
    } catch (error) {
        console.error('Error deleting món ăn:', error);
        showNotification('Có lỗi xảy ra khi xóa món ăn', 'error');
    } finally {
        hideLoading();
    }
}

// Helper function for currency formatting
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
} 