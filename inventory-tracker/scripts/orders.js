// ============================================
// Orders Page Script
// ============================================

// Render sidebar
document.getElementById('sidebar').innerHTML = getSidebarHTML('orders');

// Temp order items for the new order modal
let currentOrderItems = [];

// Render stats
function renderOrderStats() {
  const orders = DB.getOrders();
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalCents || 0), 0);
  const totalItems = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

  document.getElementById('orderStats').innerHTML = `
    <div class="stat-card green">
      <div class="stat-icon">🛒</div>
      <div class="stat-value">${orders.length}</div>
      <div class="stat-label">Total Orders</div>
    </div>
    <div class="stat-card blue">
      <div class="stat-icon">📦</div>
      <div class="stat-value">${totalItems.toLocaleString()}</div>
      <div class="stat-label">Units Sold</div>
    </div>
    <div class="stat-card purple">
      <div class="stat-icon">💰</div>
      <div class="stat-value">${formatCurrency(totalRevenue)}</div>
      <div class="stat-label">Total Revenue</div>
    </div>
  `;
}

// Render orders table
function renderOrders() {
  const orders = DB.getOrders();
  const tbody = document.getElementById('ordersTableBody');

  if (orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <div class="empty-icon">🛒</div>
            <p>No orders yet</p>
            <button class="btn btn-primary btn-sm" onclick="openOrderModal()">＋ New Order</button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = orders.map(o => {
    const itemCount = o.items.reduce((sum, i) => sum + i.quantity, 0);
    return `
      <tr>
        <td><span class="font-mono text-muted">${o.id.substring(0, 12)}...</span></td>
        <td>${formatDate(o.date)}</td>
        <td class="font-bold">${o.customerName || '<span class="text-muted">Walk-in</span>'}</td>
        <td>${itemCount} unit${itemCount !== 1 ? 's' : ''}</td>
        <td class="font-bold">${formatCurrency(o.totalCents || 0)}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="viewOrderDetails('${o.id}')">View</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Populate product dropdown for orders
function populateOrderProductDropdown() {
  const products = DB.getProducts();
  const select = document.getElementById('addItemProduct');
  select.innerHTML = '<option value="">Select product</option>';
  products.forEach(p => {
    select.innerHTML += `<option value="${p.id}">${p.sku} — ${p.name} (${p.stockQuantity} in stock)</option>`;
  });
}

// Open order modal
function openOrderModal() {
  currentOrderItems = [];
  document.getElementById('orderCustomer').value = '';
  document.getElementById('orderNotes').value = '';
  populateOrderProductDropdown();
  renderOrderItems();
  openModal('orderModal');
}

// Add item to current order
function addOrderItem() {
  const productId = document.getElementById('addItemProduct').value;
  const quantity = Number(document.getElementById('addItemQty').value);

  if (!productId) {
    showToast('Please select a product', 'error');
    return;
  }

  if (!quantity || quantity < 1) {
    showToast('Please enter a valid quantity', 'error');
    return;
  }

  const product = DB.getProductById(productId);
  if (!product) return;

  // Check stock
  const existingItem = currentOrderItems.find(i => i.productId === productId);
  const existingQty = existingItem ? existingItem.quantity : 0;

  if (existingQty + quantity > product.stockQuantity) {
    showToast(`Only ${product.stockQuantity} units available (${existingQty} already in order)`, 'error');
    return;
  }

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    currentOrderItems.push({
      productId,
      name: product.name,
      sku: product.sku,
      priceCents: product.priceCents,
      quantity
    });
  }

  document.getElementById('addItemProduct').value = '';
  document.getElementById('addItemQty').value = '1';
  renderOrderItems();
}

// Render order items in modal
function renderOrderItems() {
  const list = document.getElementById('orderItemsList');
  const totalDisplay = document.getElementById('orderTotalDisplay');

  if (currentOrderItems.length === 0) {
    list.innerHTML = '<p class="text-muted" style="padding:8px 0">No items added yet</p>';
    totalDisplay.textContent = 'Total: $0.00';
    return;
  }

  let totalCents = 0;

  list.innerHTML = currentOrderItems.map((item, index) => {
    const itemTotal = item.priceCents * item.quantity;
    totalCents += itemTotal;
    return `
      <div class="order-item-row">
        <div style="flex:1">
          <div class="font-bold">${item.name}</div>
          <div class="text-muted" style="font-size:12px">${item.sku} · ${formatCurrency(item.priceCents)} × ${item.quantity}</div>
        </div>
        <div class="font-bold">${formatCurrency(itemTotal)}</div>
        <button class="btn btn-sm btn-danger" onclick="removeOrderItem(${index})">×</button>
      </div>
    `;
  }).join('');

  totalDisplay.textContent = `Total: ${formatCurrency(totalCents)}`;
}

// Remove item from current order
function removeOrderItem(index) {
  currentOrderItems.splice(index, 1);
  renderOrderItems();
}

// Save order
function saveOrder() {
  if (currentOrderItems.length === 0) {
    showToast('Please add at least one item', 'error');
    return;
  }

  const customerName = document.getElementById('orderCustomer').value.trim();
  const notes = document.getElementById('orderNotes').value.trim();

  DB.addOrder({
    customerName,
    notes,
    items: currentOrderItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }))
  });

  showToast('Order placed — stock updated automatically');
  closeModal('orderModal');
  currentOrderItems = [];
  renderOrders();
  renderOrderStats();
}

// View order details
function viewOrderDetails(orderId) {
  const orders = DB.getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const body = document.getElementById('orderDetailBody');
  
  let itemsHTML = order.items.map(item => {
    const product = DB.getProductById(item.productId);
    return `
      <div class="order-item-row">
        <div style="flex:1">
          <div class="font-bold">${product ? product.name : 'Deleted Product'}</div>
          <div class="text-muted" style="font-size:12px">${product ? product.sku : '—'} · Qty: ${item.quantity}</div>
        </div>
        <div class="font-bold">${product ? formatCurrency(product.priceCents * item.quantity) : '—'}</div>
      </div>
    `;
  }).join('');

  body.innerHTML = `
    <div style="margin-bottom:16px">
      <div class="text-muted" style="font-size:12px;margin-bottom:4px">Order ID</div>
      <div class="font-mono">${order.id}</div>
    </div>
    <div style="margin-bottom:16px">
      <div class="text-muted" style="font-size:12px;margin-bottom:4px">Date</div>
      <div>${formatDate(order.date)}</div>
    </div>
    <div style="margin-bottom:16px">
      <div class="text-muted" style="font-size:12px;margin-bottom:4px">Customer</div>
      <div>${order.customerName || 'Walk-in'}</div>
    </div>
    ${order.notes ? `<div style="margin-bottom:16px"><div class="text-muted" style="font-size:12px;margin-bottom:4px">Notes</div><div>${order.notes}</div></div>` : ''}
    <div style="margin-bottom:8px">
      <div class="text-muted" style="font-size:12px;margin-bottom:8px">Items</div>
      <div class="order-items-list">${itemsHTML}</div>
    </div>
    <div style="text-align:right;padding-top:16px;border-top:1px solid var(--border-color);font-size:18px;font-weight:700;">
      Total: ${formatCurrency(order.totalCents)}
    </div>
  `;

  openModal('orderDetailModal');
}

// Initialize
renderOrderStats();
renderOrders();
