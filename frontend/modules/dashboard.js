// Dashboard module
import { showLoading, hideLoading, showNotification } from '../utils.js';
import { 
    nhaHangAPI, nhanVienAPI, banAnAPI, khachHangAPI, 
    thucDonAPI, hoaDonAPI, danhGiaAPI 
} from '../api.js';

export async function initDashboard() {
    const mainContent = document.getElementById('main-content');
    
    try {
        showLoading();
        
        // Render dashboard layout
        mainContent.innerHTML = `
            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <div class="card-header">
                        <span class="card-title">Tổng số nhà hàng</span>
                        <div class="card-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <i class="fas fa-building"></i>
                        </div>
                    </div>
                    <div class="card-value" id="nhahang-count">-</div>
                    <div class="card-change">Đang hoạt động</div>
                </div>
                
                <div class="dashboard-card">
                    <div class="card-header">
                        <span class="card-title">Tổng số nhân viên</span>
                        <div class="card-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                            <i class="fas fa-users"></i>
                        </div>
                    </div>
                    <div class="card-value" id="nhanvien-count">-</div>
                    <div class="card-change">Nhân viên hiện tại</div>
                </div>
                
                <div class="dashboard-card">
                    <div class="card-header">
                        <span class="card-title">Tổng số bàn ăn</span>
                        <div class="card-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                            <i class="fas fa-chair"></i>
                        </div>
                    </div>
                    <div class="card-value" id="banan-count">-</div>
                    <div class="card-change">Bàn có sẵn</div>
                </div>
                
                <div class="dashboard-card">
                    <div class="card-header">
                        <span class="card-title">Tổng số khách hàng</span>
                        <div class="card-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                            <i class="fas fa-user-friends"></i>
                        </div>
                    </div>
                    <div class="card-value" id="khachhang-count">-</div>
                    <div class="card-change">Khách hàng đăng ký</div>
                </div>
                
                <div class="dashboard-card">
                    <div class="card-header">
                        <span class="card-title">Tổng số món ăn</span>
                        <div class="card-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
                            <i class="fas fa-utensils"></i>
                        </div>
                    </div>
                    <div class="card-value" id="thucdon-count">-</div>
                    <div class="card-change">Món trong thực đơn</div>
                </div>
                
                <div class="dashboard-card">
                    <div class="card-header">
                        <span class="card-title">Tổng số hóa đơn</span>
                        <div class="card-icon" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);">
                            <i class="fas fa-receipt"></i>
                        </div>
                    </div>
                    <div class="card-value" id="hoadon-count">-</div>
                    <div class="card-change">Hóa đơn tháng này</div>
                </div>
            </div>
            
            <div class="dashboard-grid">
                <div class="data-table-container">
                    <div class="table-header">
                        <h3 class="table-title">Thống kê gần đây</h3>
                    </div>
                    <div class="recent-stats" id="recent-stats">
                        <div class="empty-state">
                            <i class="fas fa-chart-line"></i>
                            <h3>Đang tải dữ liệu...</h3>
                        </div>
                    </div>
                </div>
                
                <div class="data-table-container">
                    <div class="table-header">
                        <h3 class="table-title">Đánh giá mới nhất</h3>
                    </div>
                    <div class="recent-reviews" id="recent-reviews">
                        <div class="empty-state">
                            <i class="fas fa-star"></i>
                            <h3>Đang tải đánh giá...</h3>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Load dashboard data
        await loadDashboardData();
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showNotification('Có lỗi xảy ra khi tải dashboard', 'error');
    } finally {
        hideLoading();
    }
}

async function loadDashboardData() {
    try {
        // Load counts for all entities
        const [
            nhahangData,
            nhanvienData,
            bananData,
            khachhangData,
            thucdonData,
            hoadonData,
            danhgiaData
        ] = await Promise.all([
            nhaHangAPI.getAll(),
            nhanVienAPI.getAll(),
            banAnAPI.getAll(),
            khachHangAPI.getAll(),
            thucDonAPI.getAll(),
            hoaDonAPI.getAll(),
            danhGiaAPI.getAll()
        ]);
        
        // Update counts
        document.getElementById('nhahang-count').textContent = nhahangData.length;
        document.getElementById('nhanvien-count').textContent = nhanvienData.length;
        document.getElementById('banan-count').textContent = bananData.length;
        document.getElementById('khachhang-count').textContent = khachhangData.length;
        document.getElementById('thucdon-count').textContent = thucdonData.length;
        document.getElementById('hoadon-count').textContent = hoadonData.length;
        
        // Load recent statistics
        loadRecentStats(hoadonData, danhgiaData);
        loadRecentReviews(danhgiaData);
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Không thể tải dữ liệu thống kê', 'error');
    }
}

function loadRecentStats(hoadonData, danhgiaData) {
    const recentStatsContainer = document.getElementById('recent-stats');
    
    // Calculate some basic stats
    const totalRevenue = hoadonData.reduce((sum, hd) => sum + (hd.tongTien || 0), 0);
    const avgRating = danhgiaData.length > 0 
        ? (danhgiaData.reduce((sum, dg) => sum + (dg.diem || 0), 0) / danhgiaData.length).toFixed(1)
        : 0;
    
    recentStatsContainer.innerHTML = `
        <div style="padding: 1.5rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div style="text-align: center; padding: 1rem; background: #f8fafc; border-radius: 0.5rem;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: #059669;">${formatCurrency(totalRevenue)}</div>
                    <div style="font-size: 0.875rem; color: #64748b;">Tổng doanh thu</div>
                </div>
                <div style="text-align: center; padding: 1rem; background: #f8fafc; border-radius: 0.5rem;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: #f59e0b;">${avgRating}/5</div>
                    <div style="font-size: 0.875rem; color: #64748b;">Đánh giá trung bình</div>
                </div>
                <div style="text-align: center; padding: 1rem; background: #f8fafc; border-radius: 0.5rem;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: #3b82f6;">${hoadonData.length}</div>
                    <div style="font-size: 0.875rem; color: #64748b;">Tổng hóa đơn</div>
                </div>
                <div style="text-align: center; padding: 1rem; background: #f8fafc; border-radius: 0.5rem;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: #8b5cf6;">${danhgiaData.length}</div>
                    <div style="font-size: 0.875rem; color: #64748b;">Tổng đánh giá</div>
                </div>
            </div>
        </div>
    `;
}

function loadRecentReviews(danhgiaData) {
    const recentReviewsContainer = document.getElementById('recent-reviews');
    
    if (danhgiaData.length === 0) {
        recentReviewsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-star"></i>
                <h3>Chưa có đánh giá</h3>
                <p>Chưa có đánh giá nào được gửi</p>
            </div>
        `;
        return;
    }
    
    // Get recent reviews (last 5)
    const recentReviews = danhgiaData
        .sort((a, b) => new Date(b.ngayDanhGia || b.created_at || 0) - new Date(a.ngayDanhGia || a.created_at || 0))
        .slice(0, 5);
    
    const reviewsHTML = recentReviews.map(review => `
        <div style="padding: 1rem; border-bottom: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <div style="font-weight: 500; color: #1e293b;">${review.tenKhachHang || 'Khách hàng'}</div>
                <div style="color: #f59e0b;">
                    ${'★'.repeat(review.diem || 0)}${'☆'.repeat(5 - (review.diem || 0))}
                </div>
            </div>
            <div style="color: #64748b; font-size: 0.875rem;">${review.noiDung || 'Không có nội dung'}</div>
            <div style="color: #94a3b8; font-size: 0.75rem; margin-top: 0.5rem;">
                ${formatDate(review.ngayDanhGia || review.created_at)}
            </div>
        </div>
    `).join('');
    
    recentReviewsContainer.innerHTML = `
        <div style="max-height: 400px; overflow-y: auto;">
            ${reviewsHTML}
        </div>
    `;
}

// Helper function for currency formatting
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Helper function for date formatting
function formatDate(date) {
    if (!date) return 'N/A';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
} 