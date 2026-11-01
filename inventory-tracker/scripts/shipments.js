// ============================================
// Shipments Page Script
// ============================================

// Render sidebar
document.getElementById('sidebar').innerHTML = getSidebarHTML('shipments');

// Render stats
function renderShipmentStats() {
  const shipments = DB.getShipments();
  const totalReceived = shipments.reduce((sum, s) => sum + s.quantity, 0);
  const uniqueSuppliers = new Set(shipments.map(s => s.supplier).filter(Boolean)).size;

  document.getElementById('shipmentStats').innerHTML = `
    <div class="stat-card blue">
      <div class="stat-icon">🚚</div>
      <div class="stat-value">${shipments.length}</div>
      <div class="stat-label">Total Shipments</div>
    </div>
    <div class="stat-card green">
      <div class="stat-icon">📦</div>
      <div class="stat-value">${totalReceived.toLocaleString()}</div>
      <div class="stat-label">Units Received</div>
    </div>
    <div class="stat-card purple">
      <div class="stat-icon">🏭</div>
      <div class="stat-value">${uniqueSuppliers}</div>
      <div class="stat-label">Suppliers</div>
    </div>
  `;
}

// Render shipments table
function renderShipments() {
  const shipments = DB.getShipments();
  const tbody = document.getElementById('shipmentsTableBody');

  if (shipments.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <div class="empty-icon">🚚</div>
            <p>No shipments recorded yet</p>
            <button class="btn btn-primary btn-sm" onclick="openShipmentModal()">＋ Log Shipment</button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = shipments.map(s => {
    const product = DB.getProductById(s.productId);
    return `
      <tr>
        <td>${formatDate(s.date)}</td>
        <td class="font-bold">${product ? product.name : '<span class="text-muted">Deleted</span>'}</td>
        <td><span class="font-mono text-muted">${product ? product.sku : '—'}</span></td>
        <td><span class="badge badge-success">+${s.quantity}</span></td>
        <td>${s.supplier || '<span class="text-muted">—</span>'}</td>
        <td class="text-muted">${s.notes || '—'}</td>
      </tr>
    `;
  }).join('');
}

// Populate product dropdown
function populateProductDropdown() {
  const products = DB.getProducts();
  const select = document.getElementById('shipmentProduct');
  select.innerHTML = '<option value="">Select a product</option>';
  products.forEach(p => {
    select.innerHTML += `<option value="${p.id}">${p.sku} — ${p.name}</option>`;
  });
}

// Open modal
function openShipmentModal() {
  populateProductDropdown();
  document.getElementById('shipmentProduct').value = '';
  document.getElementById('shipmentQuantity').value = '';
  document.getElementById('shipmentDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('shipmentSupplier').value = '';
  document.getElementById('shipmentNotes').value = '';
  openModal('shipmentModal');
}

// Save shipment
function saveShipment() {
  const productId = document.getElementById('shipmentProduct').value;
  const quantity = document.getElementById('shipmentQuantity').value;
  const date = document.getElementById('shipmentDate').value;
  const supplier = document.getElementById('shipmentSupplier').value.trim();
  const notes = document.getElementById('shipmentNotes').value.trim();

  if (!productId || !quantity || Number(quantity) < 1) {
    showToast('Please select a product and enter a valid quantity', 'error');
    return;
  }

  DB.addShipment({
    productId,
    quantity: Number(quantity),
    date: date ? new Date(date).toISOString() : new Date().toISOString(),
    supplier,
    notes
  });

  const product = DB.getProductById(productId);
  showToast(`+${quantity} units added to ${product ? product.name : 'product'}`);

  closeModal('shipmentModal');
  renderShipments();
  renderShipmentStats();
}

// Initialize
renderShipmentStats();
renderShipments();

// Check URL params for restock action
const urlParams = new URLSearchParams(window.location.search);
const restockProductId = urlParams.get('productId');
if (restockProductId) {
  openShipmentModal();
  document.getElementById('shipmentProduct').value = restockProductId;
}

