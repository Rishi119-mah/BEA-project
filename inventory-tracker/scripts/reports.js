// ============================================
// Reports & Analytics Page Script
// ============================================

// Render sidebar
document.getElementById('sidebar').innerHTML = getSidebarHTML('reports');

// Render reports data
function renderReports() {
  const stats = DB.getStats();
  const products = DB.getProducts();
  const lowStock = DB.getLowStockProducts();

  // Subtitle count
  const subEl = document.getElementById('lowStockCardSub');
  if (subEl) {
    subEl.textContent = `${lowStock.length} items require attention`;
  }

  // Render Category Valuation Breakdown
  const catMap = {};
  products.forEach(p => {
    if (!catMap[p.category]) {
      catMap[p.category] = { count: 0, stock: 0, valueCents: 0 };
    }
    catMap[p.category].count += 1;
    catMap[p.category].stock += p.stockQuantity;
    catMap[p.category].valueCents += (p.stockQuantity * p.priceCents);
  });

  const categoryContainer = document.getElementById('categoryBreakdown');
  const totalValueCents = stats.totalValue || stats.totalValuation || 0;

  categoryContainer.innerHTML = Object.entries(catMap).map(([cat, info]) => {
    const pct = totalValueCents > 0 ? Math.round((info.valueCents / totalValueCents) * 100) : 0;
    return `
      <div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.9rem;">
          <span style="font-weight: 500;">${cat} (${info.count} items)</span>
          <span style="color: var(--text-secondary);">${formatCurrency(info.valueCents)} (${pct}%)</span>
        </div>
        <div class="stock-bar">
          <div class="stock-bar-fill indigo" style="width: ${Math.max(5, pct)}%;"></div>
        </div>
      </div>
    `;
  }).join('');

  // Render Warehouse Summary
  const orders = DB.getOrders();
  const shipments = DB.getShipments();
  const summaryContainer = document.getElementById('warehouseSummary');

  summaryContainer.innerHTML = `
    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
      <span style="color: var(--text-secondary);">Total Catalog SKUs:</span>
      <span style="font-weight: 600;">${stats.totalProducts}</span>
    </div>
    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
      <span style="color: var(--text-secondary);">Total Units In Stock:</span>
      <span style="font-weight: 600;">${stats.totalStock} units</span>
    </div>
    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
      <span style="color: var(--text-secondary);">Total Inventory Asset Value:</span>
      <span style="font-weight: 600; color: var(--accent-primary);">${formatCurrency(stats.totalValue || stats.totalValuation || 0)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
      <span style="color: var(--text-secondary);">Total Orders Dispatched:</span>
      <span style="font-weight: 600;">${orders.length} orders (${formatCurrency(stats.totalRevenue)})</span>
    </div>
    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
      <span style="color: var(--text-secondary);">Total Restock Shipments:</span>
      <span style="font-weight: 600;">${shipments.length} logged</span>
    </div>
    <div style="display: flex; justify-content: space-between; padding: 8px 0;">
      <span style="color: var(--text-secondary);">Inventory Health Status:</span>
      <span style="font-weight: 600; color: ${lowStock.length === 0 ? 'var(--success)' : 'var(--warning)'};">
        ${lowStock.length === 0 ? 'Optimal' : `${lowStock.length} Low / Depleted`}
      </span>
    </div>
  `;

  // Render Low Stock Report Table
  const tableBody = document.getElementById('lowStockReportTable');
  if (lowStock.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 32px; color: var(--text-muted);">
          🎉 All products are above their reorder thresholds! No critical stock deficits.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = lowStock.map(p => {
    const status = getStockStatus(p);
    const deficit = Math.max(0, p.reorderThreshold - p.stockQuantity);
    return `
      <tr>
        <td style="font-family: monospace; font-weight: 600; color: var(--accent-primary);">${p.sku}</td>
        <td style="font-weight: 500;">${p.name}</td>
        <td><span class="badge badge-info">${p.category}</span></td>
        <td style="font-weight: 700;">${p.stockQuantity}</td>
        <td>${p.reorderThreshold}</td>
        <td style="color: var(--danger); font-weight: 700;">-${deficit}</td>
        <td><span class="badge ${status.class}">${status.label}</span></td>
        <td>
          <a href="shipments.html?productId=${p.id}" class="btn btn-sm btn-primary" style="padding: 4px 10px; font-size: 0.8rem;">
            Restock
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

// Download Report Handler
function downloadReport(type) {
  const dateStr = new Date().toISOString().split('T')[0];
  switch (type) {
    case 'products':
      DB.downloadCSV(DB.exportProductsCSV(), `products_inventory_${dateStr}.csv`);
      showToast('Products catalog exported to CSV', 'success');
      break;
    case 'low-stock':
      DB.downloadCSV(DB.exportLowStockCSV(), `low_stock_alert_${dateStr}.csv`);
      showToast('Low stock report exported to CSV', 'success');
      break;
    case 'orders':
      DB.downloadCSV(DB.exportOrdersCSV(), `orders_report_${dateStr}.csv`);
      showToast('Orders report exported to CSV', 'success');
      break;
    case 'shipments':
      DB.downloadCSV(DB.exportShipmentsCSV(), `shipments_report_${dateStr}.csv`);
      showToast('Shipments report exported to CSV', 'success');
      break;
  }
}

// Export All
function exportAllReports() {
  downloadReport('products');
  setTimeout(() => downloadReport('low-stock'), 300);
  setTimeout(() => downloadReport('orders'), 600);
  setTimeout(() => downloadReport('shipments'), 900);
  showToast('Exporting all 4 warehouse reports...', 'info');
}

// Initialize
renderReports();
