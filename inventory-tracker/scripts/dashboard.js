// ============================================
// Dashboard Page Script
// ============================================

// Render sidebar
document.getElementById('sidebar').innerHTML = getSidebarHTML('dashboard');

// Render stats
function renderStats() {
  const stats = DB.getStats();
  const grid = document.getElementById('statsGrid');

  grid.innerHTML = `
    <div class="stat-card purple">
      <div class="stat-icon">📦</div>
      <div class="stat-value">${stats.totalProducts}</div>
      <div class="stat-label">Total Products</div>
    </div>
    <div class="stat-card blue">
      <div class="stat-icon">🏷️</div>
      <div class="stat-value">${stats.totalStock.toLocaleString()}</div>
      <div class="stat-label">Units in Stock</div>
    </div>
    <div class="stat-card amber">
      <div class="stat-icon">⚠️</div>
      <div class="stat-value">${stats.lowStock}</div>
      <div class="stat-label">Low Stock Items</div>
    </div>
    <div class="stat-card red">
      <div class="stat-icon">🚫</div>
      <div class="stat-value">${stats.outOfStock}</div>
      <div class="stat-label">Out of Stock</div>
    </div>
    <div class="stat-card green">
      <div class="stat-icon">💰</div>
      <div class="stat-value">${formatCurrency(stats.totalRevenue)}</div>
      <div class="stat-label">Total Revenue</div>
    </div>
    <div class="stat-card teal">
      <div class="stat-icon">🏦</div>
      <div class="stat-value">${formatCurrency(stats.totalValue)}</div>
      <div class="stat-label">Inventory Value</div>
    </div>
  `;
}

// Render stock alerts
function renderAlerts() {
  const lowStock = DB.getLowStockProducts();
  const alertList = document.getElementById('alertList');

  if (lowStock.length === 0) {
    alertList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✅</div>
        <p>All stock levels are healthy!</p>
      </div>
    `;
    return;
  }

  alertList.innerHTML = lowStock.map(product => {
    const isCritical = product.stockQuantity === 0;
    return `
      <div class="alert-item ${isCritical ? 'critical' : 'warning'}">
        <div class="alert-dot ${isCritical ? 'red' : 'amber'}"></div>
        <div class="alert-info">
          <div class="name">${product.name}</div>
          <div class="detail">SKU: ${product.sku} · Threshold: ${product.reorderThreshold}</div>
        </div>
        <div class="alert-stock ${isCritical ? 'text-danger' : 'text-warning'}">
          ${product.stockQuantity} left
        </div>
      </div>
    `;
  }).join('');
}

// Render recent activity
function renderActivity() {
  const orders = DB.getOrders().slice(0, 5);
  const shipments = DB.getShipments().slice(0, 5);
  const activityList = document.getElementById('activityList');

  // Merge and sort by date
  const activities = [];

  orders.forEach(o => {
    activities.push({
      type: 'order',
      icon: '🛒',
      title: `Order ${o.id.substring(0, 10)}...`,
      detail: `${o.items.length} item(s) · ${formatCurrency(o.totalCents)}`,
      date: o.date
    });
  });

  shipments.forEach(s => {
    const product = DB.getProductById(s.productId);
    activities.push({
      type: 'shipment',
      icon: '🚚',
      title: `Shipment received`,
      detail: `${product ? product.name : 'Unknown'} · +${s.quantity} units`,
      date: s.date
    });
  });

  activities.sort((a, b) => new Date(b.date) - new Date(a.date));
  const recent = activities.slice(0, 8);

  if (recent.length === 0) {
    activityList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <p>No recent activity yet</p>
      </div>
    `;
    return;
  }

  activityList.innerHTML = recent.map(a => `
    <div class="alert-item">
      <span style="font-size:20px">${a.icon}</span>
      <div class="alert-info">
        <div class="name">${a.title}</div>
        <div class="detail">${a.detail}</div>
      </div>
      <div class="text-muted" style="font-size:12px;white-space:nowrap">
        ${formatDate(a.date)}
      </div>
    </div>
  `).join('');
}

// Render products table (top 10)
function renderProductsTable() {
  const products = DB.getProducts().slice(0, 10);
  const tbody = document.getElementById('productsTable');

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state"><p>No products yet</p></td></tr>`;
    return;
  }

  tbody.innerHTML = products.map(p => {
    const status = getStockStatus(p);
    return `
      <tr>
        <td><span class="font-mono text-muted">${p.sku}</span></td>
        <td class="font-bold">${p.name}</td>
        <td><span class="text-muted">${p.category}</span></td>
        <td>
          ${p.stockQuantity}
          ${stockBarHTML(p)}
        </td>
        <td><span class="badge ${status.class}">${status.label}</span></td>
      </tr>
    `;
  }).join('');
}

// Initialize
renderStats();
renderAlerts();
renderActivity();
renderProductsTable();
