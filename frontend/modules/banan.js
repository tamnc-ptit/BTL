// Bàn ăn module
import { showLoading, hideLoading, showNotification, showModal, hideModal } from '../utils.js';
import { banAnAPI, nhaHangAPI } from '../api.js';

export async function initBanAn() {
    const mainContent = document.getElementById('main-content');
    
    try {
        showLoading();
        
        // Render bàn ăn layout
        mainContent.innerHTML = `
            <div class="data-table-container">
                <div class="table-header">
                    <h3 class="table-title">Danh sách Bàn ăn</h3>
                    <button class="add-button" id="add-banan-btn">
                        <i class="fas fa-plus"></i>
                        Thêm Bàn ăn
                    </button>
                </div>
                <div class="table-content">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Mã bàn ăn</th>
                                <th>Trạng thái</th>
                                <th>Sức chứa</th>
                                <th>Nhà hàng</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody id="banan-table-body">
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
        await loadBanAnData();
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing bàn ăn module:', error);
        showNotification('Có lỗi xảy ra khi tải trang bàn ăn', 'error');
    } finally {
        hideLoading();
    }
}

async function loadBanAnData() {
    try {
        const [banAnData, nhaHangData] = await Promise.all([
            banAnAPI.getAll(),
            nhaHangAPI.getAll()
        ]);
        
        // Map nhà hàng name cho bàn ăn
        const nhaHangMap = {};
        nhaHangData.forEach(nh => {
            nhaHangMap[nh.MaNhaHang] = nh.TenNhaHang;
        });
        
        const enrichedData = banAnData.map(ba => ({
            ...ba,
            TenNhaHang: nhaHangMap[ba.MaNhaHang] || 'N/A'
        }));
        
        renderBanAnTable(enrichedData);
    } catch (error) {
        console.error('Error loading bàn ăn data:', error);
        showNotification('Không thể tải dữ liệu bàn ăn', 'error');
        renderBanAnTable([]);
    }
}

function renderBanAnTable(data) {
    const tableBody = document.getElementById('banan-table-body');
    
    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="empty-state">
                        <i class="fas fa-chair"></i>
                        <h3>Chưa có bàn ăn nào</h3>
                        <p>Hãy thêm bàn ăn đầu tiên</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = data.map(ba => `
        <tr>
            <td><strong>${ba.MaBanAn || 'N/A'}</strong></td>
            <td>
                <span class="status-badge ${ba.TrangThai ? 'active' : 'inactive'}">
                    ${ba.TrangThai ? 'Có người' : 'Trống'}
                </span>
            </td>
            <td>${ba.SucChua || 0} người</td>
            <td>${ba.TenNhaHang || 'N/A'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-view" onclick="viewBanAn('${ba.MaBanAn}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-edit" onclick="editBanAn('${ba.MaBanAn}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-delete" onclick="deleteBanAn('${ba.MaBanAn}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function setupEventListeners() {
    // Add button
    document.getElementById('add-banan-btn').addEventListener('click', showAddModal);
    
    // Modal close button
    document.getElementById('modal-close').addEventListener('click', hideModal);
    
    // Global functions for table actions
    window.viewBanAn = viewBanAn;
    window.editBanAn = editBanAn;
    window.deleteBanAn = deleteBanAn;
}

async function showAddModal() {
    try {
        const nhaHangList = await nhaHangAPI.getAll();
        
        const modalContent = `
            <form id="banan-form">
                <div class="form-group">
                    <label class="form-label" for="maBanAn">Mã bàn ăn *</label>
                    <input type="text" id="maBanAn" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="sucChua">Sức chứa *</label>
                    <input type="number" id="sucChua" class="form-input" min="1" max="20" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="maNhaHang">Nhà hàng *</label>
                    <select id="maNhaHang" class="form-select" required>
                        <option value="">Chọn nhà hàng</option>
                        ${nhaHangList.map(nh => `
                            <option value="${nh.MaNhaHang}">${nh.TenNhaHang}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="trangThai">Trạng thái</label>
                    <select id="trangThai" class="form-select">
                        <option value="0">Trống</option>
                        <option value="1">Có người</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="hideModal()">Hủy</button>
                    <button type="submit" class="btn btn-primary">Lưu</button>
                </div>
            </form>
        `;
        
        showModal('Thêm Bàn ăn', modalContent);
        
        // Handle form submission
        document.getElementById('banan-form').addEventListener('submit', handleAddSubmit);
    } catch (error) {
        console.error('Error loading nhà hàng for form:', error);
        showNotification('Không thể tải danh sách nhà hàng', 'error');
    }
}

async function handleAddSubmit(e) {
    e.preventDefault();
    
    const formData = {
        maBanAn: document.getElementById('maBanAn').value.trim(),
        sucChua: parseInt(document.getElementById('sucChua').value),
        maNhaHang: document.getElementById('maNhaHang').value,
        trangThai: parseInt(document.getElementById('trangThai').value)
    };
    
    try {
        showLoading();
        await banAnAPI.create(formData);
        hideModal();
        showNotification('Thêm bàn ăn thành công', 'success');
        await loadBanAnData();
    } catch (error) {
        console.error('Error adding bàn ăn:', error);
        showNotification('Có lỗi xảy ra khi thêm bàn ăn', 'error');
    } finally {
        hideLoading();
    }
}

async function viewBanAn(id) {
    try {
        showLoading();
        const [banan, nhaHangList] = await Promise.all([
            banAnAPI.getById(id),
            nhaHangAPI.getAll()
        ]);
        
        const nhaHang = nhaHangList.find(nh => nh.MaNhaHang === banan.MaNhaHang);
        
        const modalContent = `
            <div style="padding: 1rem;">
                <div style="margin-bottom: 1rem;">
                    <strong>Mã bàn ăn:</strong> ${banan.MaBanAn || 'N/A'}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Sức chứa:</strong> ${banan.SucChua || 0} người
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Nhà hàng:</strong> ${nhaHang ? nhaHang.TenNhaHang : 'N/A'}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Trạng thái:</strong> 
                    <span class="status-badge ${banan.TrangThai ? 'active' : 'inactive'}">
                        ${banan.TrangThai ? 'Có người' : 'Trống'}
                    </span>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="hideModal()">Đóng</button>
            </div>
        `;
        
        showModal('Chi tiết Bàn ăn', modalContent);
    } catch (error) {
        console.error('Error viewing bàn ăn:', error);
        showNotification('Không thể tải thông tin bàn ăn', 'error');
    } finally {
        hideLoading();
    }
}

async function editBanAn(id) {
    try {
        showLoading();
        const [banan, nhaHangList] = await Promise.all([
            banAnAPI.getById(id),
            nhaHangAPI.getAll()
        ]);
        
        const modalContent = `
            <form id="edit-banan-form">
                <input type="hidden" id="edit-id" value="${banan.MaBanAn}">
                <div class="form-group">
                    <label class="form-label" for="edit-sucChua">Sức chứa *</label>
                    <input type="number" id="edit-sucChua" class="form-input" value="${banan.SucChua || ''}" min="1" max="20" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="edit-maNhaHang">Nhà hàng *</label>
                    <select id="edit-maNhaHang" class="form-select" required>
                        <option value="">Chọn nhà hàng</option>
                        ${nhaHangList.map(nh => `
                            <option value="${nh.MaNhaHang}" ${banan.MaNhaHang === nh.MaNhaHang ? 'selected' : ''}>
                                ${nh.TenNhaHang}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="edit-trangThai">Trạng thái</label>
                    <select id="edit-trangThai" class="form-select">
                        <option value="0" ${!banan.TrangThai ? 'selected' : ''}>Trống</option>
                        <option value="1" ${banan.TrangThai ? 'selected' : ''}>Có người</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="hideModal()">Hủy</button>
                    <button type="submit" class="btn btn-primary">Cập nhật</button>
                </div>
            </form>
        `;
        
        showModal('Chỉnh sửa Bàn ăn', modalContent);
        
        // Handle form submission
        document.getElementById('edit-banan-form').addEventListener('submit', handleEditSubmit);
    } catch (error) {
        console.error('Error editing bàn ăn:', error);
        showNotification('Không thể tải thông tin bàn ăn', 'error');
    } finally {
        hideLoading();
    }
}

async function handleEditSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('edit-id').value;
    const formData = {
        sucChua: parseInt(document.getElementById('edit-sucChua').value),
        maNhaHang: document.getElementById('edit-maNhaHang').value,
        trangThai: parseInt(document.getElementById('edit-trangThai').value)
    };
    
    try {
        showLoading();
        await banAnAPI.update(id, formData);
        hideModal();
        showNotification('Cập nhật bàn ăn thành công', 'success');
        await loadBanAnData();
    } catch (error) {
        console.error('Error updating bàn ăn:', error);
        showNotification('Có lỗi xảy ra khi cập nhật bàn ăn', 'error');
    } finally {
        hideLoading();
    }
}

async function deleteBanAn(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa bàn ăn này?')) {
        return;
    }
    
    try {
        showLoading();
        await banAnAPI.delete(id);
        showNotification('Xóa bàn ăn thành công', 'success');
        await loadBanAnData();
    } catch (error) {
        console.error('Error deleting bàn ăn:', error);
        showNotification('Có lỗi xảy ra khi xóa bàn ăn', 'error');
    } finally {
        hideLoading();
    }
} 