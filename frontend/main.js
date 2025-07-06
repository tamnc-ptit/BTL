// Main application controller
import { showLoading, hideLoading } from './utils.js';
import { showModal, hideModal } from './utils.js';

// Import all modules
import { initDashboard } from './modules/dashboard.js';
import { initNhaHang } from './modules/nhahang.js';
import { initNhanVien } from './modules/nhanvien.js';
import { initBanAn } from './modules/banan.js';
import { initKhachHang } from './modules/khachhang.js';
import { initThucDon } from './modules/thucdon.js';
import { initHoaDon } from './modules/hoadon.js';
import { initChiTietHoaDon } from './modules/chitiethoadon.js';
import { initDanhGia } from './modules/danhgia.js';

// Module registry
const modules = {
    dashboard: {
        title: 'Tổng quan',
        init: initDashboard
    },
    nhahang: {
        title: 'Quản lý Nhà hàng',
        init: initNhaHang
    },
    nhanvien: {
        title: 'Quản lý Nhân viên',
        init: initNhanVien
    },
    banan: {
        title: 'Quản lý Bàn ăn',
        init: initBanAn
    },
    khachhang: {
        title: 'Quản lý Khách hàng',
        init: initKhachHang
    },
    thucdon: {
        title: 'Quản lý Thực đơn',
        init: initThucDon
    },
    hoadon: {
        title: 'Quản lý Hóa đơn',
        init: initHoaDon
    },
    chitiethoadon: {
        title: 'Quản lý Chi tiết Hóa đơn',
        init: initChiTietHoaDon
    },
    danhgia: {
        title: 'Quản lý Đánh giá',
        init: initDanhGia
    }
};

// Current active module
let currentModule = null;

// DOM elements
const mainContent = document.getElementById('main-content');
const pageTitle = document.getElementById('page-title');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.querySelector('.sidebar');
const navLinks = document.querySelectorAll('.nav-link');

// Initialize application
function initApp() {
    setupEventListeners();
    loadModule('dashboard'); // Default module
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const moduleName = link.getAttribute('data-module');
            loadModule(moduleName);
        });
    });

    // Sidebar toggle
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('show');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('show');
            }
        }
    });

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
        const moduleName = e.state?.module || 'dashboard';
        loadModule(moduleName, false);
    });
}

// Load module
async function loadModule(moduleName, updateHistory = true) {
    if (!modules[moduleName]) {
        console.error(`Module ${moduleName} not found`);
        return;
    }

    try {
        showLoading();
        
        // Update navigation
        updateNavigation(moduleName);
        
        // Update page title
        pageTitle.textContent = modules[moduleName].title;
        
        // Update browser history
        if (updateHistory) {
            const url = `#${moduleName}`;
            window.history.pushState({ module: moduleName }, '', url);
        }
        
        // Initialize module
        currentModule = moduleName;
        await modules[moduleName].init();
        
    } catch (error) {
        console.error('Error loading module:', error);
        showError('Có lỗi xảy ra khi tải trang');
    } finally {
        hideLoading();
    }
}

// Update navigation active state
function updateNavigation(activeModule) {
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-module') === activeModule) {
            link.classList.add('active');
        }
    });
}

// Show error message
function showError(message) {
    mainContent.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Lỗi</h3>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="location.reload()">Tải lại trang</button>
        </div>
    `;
}

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    showError('Đã xảy ra lỗi không mong muốn');
});

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export for use in other modules
export { loadModule, showError }; 