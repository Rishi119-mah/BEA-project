// ============================================
// Orders Page Script
// Renders order history from localStorage
// ============================================

// --- Update header cart quantity ---
function updateCartQuantity() {
  const totalQuantity = cart.getTotalQuantity();
  document.querySelector('.js-cart-quantity').textContent = totalQuantity;
}

// --- Render Orders ---
function renderOrders() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const ordersGrid = document.querySelector('.js-orders-grid');

  if (orders.length === 0) {
    ordersGrid.innerHTML = `
      <div class="empty-orders-message">
        <p>You have no orders yet.</p>
        <a class="button-primary empty-orders-button" href="amazon.html">Start Shopping</a>
      </div>
    `;
    return;
  }

  let ordersHTML = '';

  orders.forEach((order) => {
    const orderDate = new Date(order.orderDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let itemsHTML = '';
    order.items.forEach((item) => {
      itemsHTML += `
        <div class="order-item">
          <img class="order-item-image" src="${item.image}" alt="${item.name}">
          <div class="order-item-details">
            <div class="order-item-name">${item.name}</div>
            <div class="order-item-price">$${(item.priceCents / 100).toFixed(2)}</div>
            <div class="order-item-quantity">Quantity: ${item.quantity}</div>
            <a class="button-secondary order-buy-again-button" href="amazon.html">
              <img class="buy-again-icon" src="images/icons/buy-again.png" alt="Buy again">
              <span>Buy it again</span>
            </a>
          </div>
        </div>
      `;
    });

    ordersHTML += `
      <div class="order-container">
        <div class="order-header">
          <div class="order-header-left">
            <div class="order-date-label">Order Placed</div>
            <div class="order-date-value">${orderDate}</div>
          </div>
          <div class="order-header-middle">
            <div class="order-total-label">Total</div>
            <div class="order-total-value">$${(order.totalCents / 100).toFixed(2)}</div>
          </div>
          <div class="order-header-right">
            <div class="order-id-label">Order ID</div>
            <div class="order-id-value">${order.id}</div>
          </div>
        </div>
        <div class="order-items-grid">
          ${itemsHTML}
        </div>
      </div>
    `;
  });

  ordersGrid.innerHTML = ordersHTML;
}

// --- Search redirect ---
document.querySelector('.js-search-button').addEventListener('click', () => {
  const searchTerm = document.querySelector('.js-search-bar').value;
  if (searchTerm.trim()) {
    window.location.href = `amazon.html?search=${encodeURIComponent(searchTerm)}`;
  }
});

document.querySelector('.js-search-bar').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const searchTerm = document.querySelector('.js-search-bar').value;
    if (searchTerm.trim()) {
      window.location.href = `amazon.html?search=${encodeURIComponent(searchTerm)}`;
    }
  }
});

// --- Initialize ---
renderOrders();
updateCartQuantity();
