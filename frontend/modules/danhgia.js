// Đánh giá module
import { showLoading, hideLoading, showNotification, showModal, hideModal } from '../utils.js';
import { danhGiaAPI, khachHangAPI, banAnAPI } from '../api.js';

export async function initDanhGia() {
    const mainContent = document.getElementById('main-content');
    
    try {
        showLoading();
        
        // Render đánh giá layout
        mainContent.innerHTML = `
            <div class="data-table-container">
                <div class="table-header">
                    <h3 class="table-title">Danh sách Đánh giá</h3>
                    <button class="add-button" id="add-danhgia-btn">
                        <i class="fas fa-plus"></i>
                        Thêm Đánh giá
                    </button>
                </div>
                <div class="table-content">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Khách hàng</th>
                                <th>Bàn</th>
                                <th>Đánh giá</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody id="danhgia-table-body">
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
        await loadDanhGiaData();
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing đánh giá module:', error);
        showNotification('Có lỗi xảy ra khi tải trang đánh giá', 'error');
    } finally {
        hideLoading();
    }
}

async function loadDanhGiaData() {
    try {
        const [danhGiaData, khachHangData, banAnData] = await Promise.all([
            danhGiaAPI.getAll(),
            khachHangAPI.getAll(),
            banAnAPI.getAll()
        ]);
        
        // Map related data
        const khachHangMap = {};
        khachHangData.forEach(kh => {
            khachHangMap[kh.MaKhachHang] = kh.TenKhachHang;
        });
        
        const banAnMap = {};
        banAnData.forEach(ba => {
            banAnMap[ba.MaBanAn] = ba.MaBanAn;
        });
        
        const enrichedData = danhGiaData.map(dg => ({
            ...dg,
            TenKhachHang: khachHangMap[dg.MaKhachHang] || 'N/A',
            MaBanAn: banAnMap[dg.MaBan] || 'N/A'
        }));
        
        renderDanhGiaTable(enrichedData);
    } catch (error) {
        console.error('Error loading đánh giá data:', error);
        showNotification('Không thể tải dữ liệu đánh giá', 'error');
        renderDanhGiaTable([]);
    }
}

function renderDanhGiaTable(data) {
    const tableBody = document.getElementById('danhgia-table-body');
    
    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">
                    <div class="empty-state">
                        <i class="fas fa-star"></i>
                        <h3>Chưa có đánh giá nào</h3>
                        <p>Hãy thêm đánh giá đầu tiên</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = data.map(dg => `
        <tr>
            <td>
                <div style="font-weight: 500; color: #1e293b;">${dg.TenKhachHang || 'N/A'}</div>
            </td>
            <td><strong>${dg.MaBanAn || 'N/A'}</strong></td>
            <td>
                <div style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${dg.DanhGia || 'N/A'}
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-view" onclick="viewDanhGia('${dg.MaKhachHang}', '${dg.MaBan}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-edit" onclick="editDanhGia('${dg.MaKhachHang}', '${dg.MaBan}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-delete" onclick="deleteDanhGia('${dg.MaKhachHang}', '${dg.MaBan}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function setupEventListeners() {
    // Add button
    document.getElementById('add-danhgia-btn').addEventListener('click', showAddModal);
    
    // Modal close button
    document.getElementById('modal-close').addEventListener('click', hideModal);
    
    // Global functions for table actions
    window.viewDanhGia = viewDanhGia;
    window.editDanhGia = editDanhGia;
    window.deleteDanhGia = deleteDanhGia;
}

async function showAddModal() {
    try {
        const [khachHangList, banAnList] = await Promise.all([
            khachHangAPI.getAll(),
            banAnAPI.getAll()
        ]);
        
        const modalContent = `
            <form id="danhgia-form">
                <div class="form-group">
                    <label class="form-label" for="maKhachHang">Khách hàng *</label>
                    <select id="maKhachHang" class="form-select" required>
                        <option value="">Chọn khách hàng</option>
                        ${khachHangList.map(kh => `
                            <option value="${kh.MaKhachHang}">${kh.TenKhachHang}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="maBan">Bàn *</label>
                    <select id="maBan" class="form-select" required>
                        <option value="">Chọn bàn</option>
                        ${banAnList.map(ba => `
                            <option value="${ba.MaBanAn}">${ba.MaBanAn}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="danhGia">Đánh giá *</label>
                    <textarea id="danhGia" class="form-input" rows="4" maxlength="500" placeholder="Nhập nội dung đánh giá..." required></textarea>
                    <small class="form-text">Tối đa 500 ký tự</small>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="hideModal()">Hủy</button>
                    <button type="submit" class="btn btn-primary">Lưu</button>
                </div>
            </form>
        `;
        
        showModal('Thêm Đánh giá', modalContent);
        
        // Handle form submission
        document.getElementById('danhgia-form').addEventListener('submit', handleAddSubmit);
    } catch (error) {
        console.error('Error loading data for form:', error);
        showNotification('Không thể tải dữ liệu cho form', 'error');
    }
}

async function handleAddSubmit(e) {
    e.preventDefault();
    
    const formData = {
        maKhachHang: document.getElementById('maKhachHang').value,
        maBan: document.getElementById('maBan').value,
        danhGia: document.getElementById('danhGia').value.trim()
    };
    
    try {
        showLoading();
        await danhGiaAPI.create(formData);
        hideModal();
        showNotification('Thêm đánh giá thành công', 'success');
        await loadDanhGiaData();
    } catch (error) {
        console.error('Error adding đánh giá:', error);
        showNotification('Có lỗi xảy ra khi thêm đánh giá', 'error');
    } finally {
        hideLoading();
    }
}

async function viewDanhGia(maKhachHang, maBan) {
    try {
        showLoading();
        const [danhgia, khachHangList, banAnList] = await Promise.all([
            danhGiaAPI.getByCompositeKey(maKhachHang, maBan),
            khachHangAPI.getAll(),
            banAnAPI.getAll()
        ]);
        
        const khachHang = khachHangList.find(kh => kh.MaKhachHang === danhgia.MaKhachHang);
        const banAn = banAnList.find(ba => ba.MaBanAn === danhgia.MaBan);
        
        const modalContent = `
            <div style="padding: 1rem;">
                <div style="margin-bottom: 1rem;">
                    <strong>Khách hàng:</strong> ${khachHang ? khachHang.TenKhachHang : 'N/A'}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Bàn:</strong> ${banAn ? banAn.MaBanAn : 'N/A'}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Đánh giá:</strong>
                    <div style="margin-top: 0.5rem; padding: 1rem; background: #f8fafc; border-radius: 0.5rem; border-left: 4px solid #3b82f6;">
                        ${danhgia.DanhGia || 'N/A'}
                    </div>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="hideModal()">Đóng</button>
            </div>
        `;
        
        showModal('Chi tiết Đánh giá', modalContent);
    } catch (error) {
        console.error('Error viewing đánh giá:', error);
        showNotification('Không thể tải thông tin đánh giá', 'error');
    } finally {
        hideLoading();
    }
}

async function editDanhGia(maKhachHang, maBan) {
    try {
        showLoading();
        const [danhgia, khachHangList, banAnList] = await Promise.all([
            danhGiaAPI.getByCompositeKey(maKhachHang, maBan),
            khachHangAPI.getAll(),
            banAnAPI.getAll()
        ]);
        
        const modalContent = `
            <form id="edit-danhgia-form">
                <input type="hidden" id="edit-maKhachHang" value="${danhgia.MaKhachHang}">
                <input type="hidden" id="edit-maBan" value="${danhgia.MaBan}">
                <div class="form-group">
                    <label class="form-label" for="edit-danhGia">Đánh giá *</label>
                    <textarea id="edit-danhGia" class="form-input" rows="4" maxlength="500" placeholder="Nhập nội dung đánh giá..." required>${danhgia.DanhGia || ''}</textarea>
                    <small class="form-text">Tối đa 500 ký tự</small>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="hideModal()">Hủy</button>
                    <button type="submit" class="btn btn-primary">Cập nhật</button>
                </div>
            </form>
        `;
        
        showModal('Chỉnh sửa Đánh giá', modalContent);
        
        // Handle form submission
        document.getElementById('edit-danhgia-form').addEventListener('submit', handleEditSubmit);
    } catch (error) {
        console.error('Error editing đánh giá:', error);
        showNotification('Không thể tải thông tin đánh giá', 'error');
    } finally {
        hideLoading();
    }
}

async function handleEditSubmit(e) {
    e.preventDefault();
    
    const maKhachHang = document.getElementById('edit-maKhachHang').value;
    const maBan = document.getElementById('edit-maBan').value;
    const formData = {
        MaKhachHang: maKhachHang,
        MaBan: maBan,
        DanhGia: document.getElementById('edit-danhGia').value.trim()
    };
    
    try {
        showLoading();
        await danhGiaAPI.updateByCompositeKey(maKhachHang, maBan, formData);
        hideModal();
        showNotification('Cập nhật đánh giá thành công', 'success');
        await loadDanhGiaData();
    } catch (error) {
        console.error('Error updating đánh giá:', error);
        showNotification('Có lỗi xảy ra khi cập nhật đánh giá', 'error');
    } finally {
        hideLoading();
    }
}

async function deleteDanhGia(maKhachHang, maBan) {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
        return;
    }
    
    try {
        showLoading();
        await danhGiaAPI.deleteByCompositeKey(maKhachHang, maBan);
        showNotification('Xóa đánh giá thành công', 'success');
        await loadDanhGiaData();
    } catch (error) {
        console.error('Error deleting đánh giá:', error);
        showNotification('Có lỗi xảy ra khi xóa đánh giá', 'error');
    } finally {
        hideLoading();
    }
} 