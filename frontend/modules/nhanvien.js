// Nhân viên module
import { showLoading, hideLoading, showNotification, showModal, hideModal } from '../utils.js';
import { nhanVienAPI, nhaHangAPI } from '../api.js';

export async function initNhanVien() {
    const mainContent = document.getElementById('main-content');
    
    try {
        showLoading();
        
        // Render nhân viên layout
        mainContent.innerHTML = `
            <div class="data-table-container">
                <div class="table-header">
                    <h3 class="table-title">Danh sách Nhân viên</h3>
                    <button class="add-button" id="add-nhanvien-btn">
                        <i class="fas fa-plus"></i>
                        Thêm Nhân viên
                    </button>
                </div>
                <div class="table-content">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Mã nhân viên</th>
                                <th>Tên nhân viên</th>
                                <th>Lương</th>
                                <th>Chức vụ</th>
                                <th>Ca làm việc</th>
                                <th>Trạng thái</th>
                                <th>Nhà hàng</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody id="nhanvien-table-body">
                            <tr>
                                <td colspan="8" class="text-center">
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
        await loadNhanVienData();
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing nhân viên module:', error);
        showNotification('Có lỗi xảy ra khi tải trang nhân viên', 'error');
    } finally {
        hideLoading();
    }
}

async function loadNhanVienData() {
    try {
        const [nhanVienData, nhaHangData] = await Promise.all([
            nhanVienAPI.getAll(),
            nhaHangAPI.getAll()
        ]);
        
        // Map nhà hàng name cho nhân viên
        const nhaHangMap = {};
        nhaHangData.forEach(nh => {
            nhaHangMap[nh.MaNhaHang] = nh.TenNhaHang;
        });
        
        const enrichedData = nhanVienData.map(nv => ({
            ...nv,
            TenNhaHang: nhaHangMap[nv.MaNhaHang] || 'N/A'
        }));
        
        renderNhanVienTable(enrichedData);
    } catch (error) {
        console.error('Error loading nhân viên data:', error);
        showNotification('Không thể tải dữ liệu nhân viên', 'error');
        renderNhanVienTable([]);
    }
}

function renderNhanVienTable(data) {
    const tableBody = document.getElementById('nhanvien-table-body');
    
    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="empty-state">
                        <i class="fas fa-users"></i>
                        <h3>Chưa có nhân viên nào</h3>
                        <p>Hãy thêm nhân viên đầu tiên</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = data.map(nv => `
        <tr>
            <td><strong>${nv.MaNhanVien || 'N/A'}</strong></td>
            <td>
                <div style="font-weight: 500; color: #1e293b;">${nv.TenNhanVien || 'N/A'}</div>
            </td>
            <td>${formatCurrency(nv.Luong || 0)}</td>
            <td>${nv.ChucVu || 'N/A'}</td>
            <td>${nv.CaLamViec || 'N/A'}</td>
            <td>
                <span class="status-badge ${nv.TrangThai ? 'active' : 'inactive'}">
                    ${nv.TrangThai ? 'Đang làm việc' : 'Đã nghỉ việc'}
                </span>
            </td>
            <td>${nv.TenNhaHang || 'N/A'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-view" onclick="viewNhanVien('${nv.MaNhanVien}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-edit" onclick="editNhanVien('${nv.MaNhanVien}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-delete" onclick="deleteNhanVien('${nv.MaNhanVien}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function setupEventListeners() {
    // Add button
    document.getElementById('add-nhanvien-btn').addEventListener('click', showAddModal);
    
    // Modal close button
    document.getElementById('modal-close').addEventListener('click', hideModal);
    
    // Global functions for table actions
    window.viewNhanVien = viewNhanVien;
    window.editNhanVien = editNhanVien;
    window.deleteNhanVien = deleteNhanVien;
}

async function showAddModal() {
    try {
        const nhaHangList = await nhaHangAPI.getAll();
        
        const modalContent = `
            <form id="nhanvien-form">
                <div class="form-group">
                    <label class="form-label" for="maNhanVien">Mã nhân viên *</label>
                    <input type="text" id="maNhanVien" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="tenNhanVien">Tên nhân viên *</label>
                    <input type="text" id="tenNhanVien" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="luong">Lương *</label>
                    <input type="number" id="luong" class="form-input" min="0" step="1000" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="chucVu">Chức vụ *</label>
                    <select id="chucVu" class="form-select" required>
                        <option value="">Chọn chức vụ</option>
                        <option value="Quản lý">Quản lý</option>
                        <option value="Nhân viên phục vụ">Nhân viên phục vụ</option>
                        <option value="Đầu bếp">Đầu bếp</option>
                        <option value="Thu ngân">Thu ngân</option>
                        <option value="Bảo vệ">Bảo vệ</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="caLamViec">Ca làm việc</label>
                    <select id="caLamViec" class="form-select">
                        <option value="">Chọn ca làm việc</option>
                        <option value="Sáng">Sáng</option>
                        <option value="Chiều">Chiều</option>
                        <option value="Tối">Tối</option>
                        <option value="Toàn thời gian">Toàn thời gian</option>
                    </select>
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
                        <option value="1">Đang làm việc</option>
                        <option value="0">Đã nghỉ việc</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="hideModal()">Hủy</button>
                    <button type="submit" class="btn btn-primary">Lưu</button>
                </div>
            </form>
        `;
        
        showModal('Thêm Nhân viên', modalContent);
        
        // Handle form submission
        document.getElementById('nhanvien-form').addEventListener('submit', handleAddSubmit);
    } catch (error) {
        console.error('Error loading nhà hàng for form:', error);
        showNotification('Không thể tải danh sách nhà hàng', 'error');
    }
}

async function handleAddSubmit(e) {
    e.preventDefault();
    
    const formData = {
        maNhanVien: document.getElementById('maNhanVien').value.trim(),
        tenNhanVien: document.getElementById('tenNhanVien').value.trim(),
        luong: parseFloat(document.getElementById('luong').value),
        chucVu: document.getElementById('chucVu').value,
        caLamViec: document.getElementById('caLamViec').value,
        maNhaHang: document.getElementById('maNhaHang').value,
        trangThai: parseInt(document.getElementById('trangThai').value)
    };
    
    try {
        showLoading();
        await nhanVienAPI.create(formData);
        hideModal();
        showNotification('Thêm nhân viên thành công', 'success');
        await loadNhanVienData();
    } catch (error) {
        console.error('Error adding nhân viên:', error);
        showNotification('Có lỗi xảy ra khi thêm nhân viên', 'error');
    } finally {
        hideLoading();
    }
}

async function viewNhanVien(id) {
    try {
        showLoading();
        const [nhanvien, nhaHangList] = await Promise.all([
            nhanVienAPI.getById(id),
            nhaHangAPI.getAll()
        ]);
        
        const nhaHang = nhaHangList.find(nh => nh.MaNhaHang === nhanvien.MaNhaHang);
        
        const modalContent = `
            <div style="padding: 1rem;">
                <div style="margin-bottom: 1rem;">
                    <strong>Mã nhân viên:</strong> ${nhanvien.MaNhanVien || 'N/A'}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Tên nhân viên:</strong> ${nhanvien.TenNhanVien || 'N/A'}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Lương:</strong> ${formatCurrency(nhanvien.Luong || 0)}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Chức vụ:</strong> ${nhanvien.ChucVu || 'N/A'}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Ca làm việc:</strong> ${nhanvien.CaLamViec || 'N/A'}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Nhà hàng:</strong> ${nhaHang ? nhaHang.TenNhaHang : 'N/A'}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Trạng thái:</strong> 
                    <span class="status-badge ${nhanvien.TrangThai ? 'active' : 'inactive'}">
                        ${nhanvien.TrangThai ? 'Đang làm việc' : 'Đã nghỉ việc'}
                    </span>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="hideModal()">Đóng</button>
            </div>
        `;
        
        showModal('Chi tiết Nhân viên', modalContent);
    } catch (error) {
        console.error('Error viewing nhân viên:', error);
        showNotification('Không thể tải thông tin nhân viên', 'error');
    } finally {
        hideLoading();
    }
}

async function editNhanVien(id) {
    try {
        showLoading();
        const [nhanvien, nhaHangList] = await Promise.all([
            nhanVienAPI.getById(id),
            nhaHangAPI.getAll()
        ]);
        
        const modalContent = `
            <form id="edit-nhanvien-form">
                <input type="hidden" id="edit-id" value="${nhanvien.MaNhanVien}">
                <div class="form-group">
                    <label class="form-label" for="edit-tenNhanVien">Tên nhân viên *</label>
                    <input type="text" id="edit-tenNhanVien" class="form-input" value="${nhanvien.TenNhanVien || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="edit-luong">Lương *</label>
                    <input type="number" id="edit-luong" class="form-input" value="${nhanvien.Luong || ''}" min="0" step="1000" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="edit-chucVu">Chức vụ *</label>
                    <select id="edit-chucVu" class="form-select" required>
                        <option value="">Chọn chức vụ</option>
                        <option value="Quản lý" ${nhanvien.ChucVu === 'Quản lý' ? 'selected' : ''}>Quản lý</option>
                        <option value="Nhân viên phục vụ" ${nhanvien.ChucVu === 'Nhân viên phục vụ' ? 'selected' : ''}>Nhân viên phục vụ</option>
                        <option value="Đầu bếp" ${nhanvien.ChucVu === 'Đầu bếp' ? 'selected' : ''}>Đầu bếp</option>
                        <option value="Thu ngân" ${nhanvien.ChucVu === 'Thu ngân' ? 'selected' : ''}>Thu ngân</option>
                        <option value="Bảo vệ" ${nhanvien.ChucVu === 'Bảo vệ' ? 'selected' : ''}>Bảo vệ</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="edit-caLamViec">Ca làm việc</label>
                    <select id="edit-caLamViec" class="form-select">
                        <option value="">Chọn ca làm việc</option>
                        <option value="Sáng" ${nhanvien.CaLamViec === 'Sáng' ? 'selected' : ''}>Sáng</option>
                        <option value="Chiều" ${nhanvien.CaLamViec === 'Chiều' ? 'selected' : ''}>Chiều</option>
                        <option value="Tối" ${nhanvien.CaLamViec === 'Tối' ? 'selected' : ''}>Tối</option>
                        <option value="Toàn thời gian" ${nhanvien.CaLamViec === 'Toàn thời gian' ? 'selected' : ''}>Toàn thời gian</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="edit-maNhaHang">Nhà hàng *</label>
                    <select id="edit-maNhaHang" class="form-select" required>
                        <option value="">Chọn nhà hàng</option>
                        ${nhaHangList.map(nh => `
                            <option value="${nh.MaNhaHang}" ${nhanvien.MaNhaHang === nh.MaNhaHang ? 'selected' : ''}>
                                ${nh.TenNhaHang}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="edit-trangThai">Trạng thái</label>
                    <select id="edit-trangThai" class="form-select">
                        <option value="1" ${nhanvien.TrangThai ? 'selected' : ''}>Đang làm việc</option>
                        <option value="0" ${!nhanvien.TrangThai ? 'selected' : ''}>Đã nghỉ việc</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="hideModal()">Hủy</button>
                    <button type="submit" class="btn btn-primary">Cập nhật</button>
                </div>
            </form>
        `;
        
        showModal('Chỉnh sửa Nhân viên', modalContent);
        
        // Handle form submission
        document.getElementById('edit-nhanvien-form').addEventListener('submit', handleEditSubmit);
    } catch (error) {
        console.error('Error editing nhân viên:', error);
        showNotification('Không thể tải thông tin nhân viên', 'error');
    } finally {
        hideLoading();
    }
}

async function handleEditSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('edit-id').value;
    const formData = {
        tenNhanVien: document.getElementById('edit-tenNhanVien').value.trim(),
        luong: parseFloat(document.getElementById('edit-luong').value),
        chucVu: document.getElementById('edit-chucVu').value,
        caLamViec: document.getElementById('edit-caLamViec').value,
        maNhaHang: document.getElementById('edit-maNhaHang').value,
        trangThai: parseInt(document.getElementById('edit-trangThai').value)
    };
    
    try {
        showLoading();
        await nhanVienAPI.update(id, formData);
        hideModal();
        showNotification('Cập nhật nhân viên thành công', 'success');
        await loadNhanVienData();
    } catch (error) {
        console.error('Error updating nhân viên:', error);
        showNotification('Có lỗi xảy ra khi cập nhật nhân viên', 'error');
    } finally {
        hideLoading();
    }
}

async function deleteNhanVien(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
        return;
    }
    
    try {
        showLoading();
        await nhanVienAPI.delete(id);
        showNotification('Xóa nhân viên thành công', 'success');
        await loadNhanVienData();
    } catch (error) {
        console.error('Error deleting nhân viên:', error);
        showNotification('Có lỗi xảy ra khi xóa nhân viên', 'error');
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