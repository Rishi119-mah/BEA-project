// ============================================
// Shared UI Utilities
// Toast notifications, modal helpers, sidebar
// ============================================

// --- Toast Notifications ---
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || '✅'}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// --- Modal Helpers ---
function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => {
      m.classList.remove('active');
    });
  }
});

// --- Mobile Sidebar Toggle ---
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.mobile-toggle');
  const sidebar = document.querySelector('.sidebar');

  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    // Close sidebar on outside click (mobile)
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 &&
          !sidebar.contains(e.target) &&
          !toggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }
});

// --- Format Currency ---
function formatCurrency(cents) {
  return '$' + (cents / 100).toFixed(2);
}

// --- Format Date ---
function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// --- Get Stock Status ---
function getStockStatus(product) {
  if (product.stockQuantity === 0) {
    return { label: 'Out of Stock', class: 'badge-danger', barClass: 'red' };
  } else if (product.stockQuantity <= product.reorderThreshold) {
    return { label: 'Low Stock', class: 'badge-warning', barClass: 'amber' };
  }
  return { label: 'In Stock', class: 'badge-success', barClass: 'green' };
}

// --- Stock Bar HTML ---
function stockBarHTML(product) {
  const status = getStockStatus(product);
  const maxDisplay = Math.max(product.reorderThreshold * 3, 100);
  const percent = Math.min(100, (product.stockQuantity / maxDisplay) * 100);
  return `<div class="stock-bar"><div class="stock-bar-fill ${status.barClass}" style="width:${percent}%"></div></div>`;
}

// --- Generate Sidebar HTML ---
function getSidebarHTML(activePage) {
  const stats = DB.getStats();
  const alertCount = stats.lowStock + stats.outOfStock;

  return `
    <div class="sidebar-brand">
      <h1>InvenTrack</h1>
      <span>Warehouse Manager</span>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-label">Overview</div>
      <a href="index.html" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}">
        <span class="nav-icon">📊</span> Dashboard
        ${alertCount > 0 ? `<span class="nav-badge">${alertCount}</span>` : ''}
      </a>

      <div class="nav-label">Inventory</div>
      <a href="products.html" class="nav-link ${activePage === 'products' ? 'active' : ''}">
        <span class="nav-icon">📦</span> Products
      </a>
      <a href="shipments.html" class="nav-link ${activePage === 'shipments' ? 'active' : ''}">
        <span class="nav-icon">🚚</span> Shipments
      </a>
      <a href="orders.html" class="nav-link ${activePage === 'orders' ? 'active' : ''}">
        <span class="nav-icon">🛒</span> Orders
      </a>

      <div class="nav-label">Analytics</div>
      <a href="reports.html" class="nav-link ${activePage === 'reports' ? 'active' : ''}">
        <span class="nav-icon">📈</span> Reports
      </a>

      <div class="nav-label">Storefront</div>
      <a href="../amazon.html" class="nav-link">
        <span class="nav-icon">⚡</span> OCTANE Store
      </a>
    </nav>
  `;
}

