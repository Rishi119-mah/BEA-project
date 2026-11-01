// ============================================
// Checkout Page Script
// Renders cart items, delivery options, payment summary
// ============================================

// --- Render Order Summary (Cart Items) ---
function renderOrderSummary() {
  let orderHTML = '';

  if (cart.items.length === 0) {
    orderHTML = `
      <div class="empty-cart-message">
        <p>Your cart is empty.</p>
        <a class="button-primary empty-cart-button" href="amazon.html">Continue Shopping</a>
      </div>
    `;
    document.querySelector('.order-summary').innerHTML = orderHTML;
    updatePaymentSummary();
    updateCheckoutHeader();
    return;
  }

  cart.items.forEach((cartItem) => {
    const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);
    const deliveryDate = calculateDeliveryDate(deliveryOption);

    orderHTML += `
      <div class="cart-item-container js-cart-item-${cartItem.id}" data-product-id="${cartItem.id}">
        <div class="delivery-date">
          Delivery date: ${deliveryDate}
        </div>

        <div class="cart-item-details-grid">
          <img class="product-image"
            src="${cartItem.image}" alt="${cartItem.name}">

          <div class="cart-item-details">
            <div class="product-name">
              ${cartItem.name}
            </div>
            <div class="product-price">
              $${(cartItem.priceCents / 100).toFixed(2)}
            </div>
            <div class="product-quantity">
              <span>
                Quantity: <span class="js-quantity-label-${cartItem.id}">${cartItem.quantity}</span>
              </span>
              <span class="update-quantity-link link-primary js-update-link"
                data-product-id="${cartItem.id}">
                Update
              </span>
              <input class="quantity-input js-quantity-input-${cartItem.id}"
                type="number" value="${cartItem.quantity}" min="1" max="99"
                data-product-id="${cartItem.id}">
              <span class="save-quantity-link link-primary js-save-link"
                data-product-id="${cartItem.id}">
                Save
              </span>
              <span class="delete-quantity-link link-primary js-delete-link"
                data-product-id="${cartItem.id}">
                Delete
              </span>
            </div>
          </div>

          <div class="delivery-options">
            <div class="delivery-options-title">
              Choose a delivery option:
            </div>
            ${renderDeliveryOptions(cartItem)}
          </div>
        </div>
      </div>
    `;
  });

  document.querySelector('.order-summary').innerHTML = orderHTML;

  // Attach event listeners
  attachCheckoutListeners();
  updatePaymentSummary();
  updateCheckoutHeader();
}

// --- Render Delivery Options for a Cart Item ---
function renderDeliveryOptions(cartItem) {
  let html = '';

  deliveryOptions.forEach((option) => {
    const deliveryDate = calculateDeliveryDate(option);
    const priceString = option.priceCents === 0
      ? 'FREE Shipping'
      : `$${(option.priceCents / 100).toFixed(2)} - Shipping`;
    const isChecked = cartItem.deliveryOptionId === option.id ? 'checked' : '';

    html += `
      <div class="delivery-option js-delivery-option"
        data-product-id="${cartItem.id}"
        data-delivery-id="${option.id}">
        <input type="radio" ${isChecked}
          class="delivery-option-input"
          name="delivery-option-${cartItem.id}">
        <div>
          <div class="delivery-option-date">
            ${deliveryDate}
          </div>
          <div class="delivery-option-price">
            ${priceString}
          </div>
        </div>
      </div>
    `;
  });

  return html;
}

// --- Attach Checkout Event Listeners ---
function attachCheckoutListeners() {
  // Delete buttons
  document.querySelectorAll('.js-delete-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;
      cart.removeItem(productId);
      renderOrderSummary();
    });
  });

  // Update buttons (show input)
  document.querySelectorAll('.js-update-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;
      const container = document.querySelector(`.js-cart-item-${productId}`);
      container.classList.add('is-editing-quantity');
    });
  });

  // Save buttons
  document.querySelectorAll('.js-save-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;
      const input = document.querySelector(`.js-quantity-input-${productId}`);
      const newQuantity = Number(input.value);

      if (newQuantity < 1 || newQuantity > 99) {
        alert('Quantity must be between 1 and 99');
        return;
      }

      cart.updateQuantity(productId, newQuantity);
      renderOrderSummary();
    });
  });

  // Delivery option selection
  document.querySelectorAll('.js-delivery-option').forEach((option) => {
    option.addEventListener('click', () => {
      const productId = option.dataset.productId;
      const deliveryId = option.dataset.deliveryId;
      cart.updateDeliveryOption(productId, deliveryId);
      renderOrderSummary();
    });
  });
}

// --- Update Payment Summary ---
function updatePaymentSummary() {
  let itemsCents = 0;
  let shippingCents = 0;
  let itemCount = 0;

  cart.items.forEach((cartItem) => {
    itemsCents += cartItem.priceCents * cartItem.quantity;
    itemCount += cartItem.quantity;

    const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);
    shippingCents += deliveryOption.priceCents;
  });

  const beforeTaxCents = itemsCents + shippingCents;
  const taxCents = Math.round(beforeTaxCents * 0.10);
  const totalCents = beforeTaxCents + taxCents;

  document.querySelector('.js-items-label').textContent = `Items (${itemCount}):`;
  document.querySelector('.js-items-total').textContent = `$${(itemsCents / 100).toFixed(2)}`;
  document.querySelector('.js-shipping-total').textContent = `$${(shippingCents / 100).toFixed(2)}`;
  document.querySelector('.js-subtotal').textContent = `$${(beforeTaxCents / 100).toFixed(2)}`;
  document.querySelector('.js-estimated-tax').textContent = `$${(taxCents / 100).toFixed(2)}`;
  document.querySelector('.js-order-total').textContent = `$${(totalCents / 100).toFixed(2)}`;
}

// --- Update Checkout Header Item Count ---
function updateCheckoutHeader() {
  const totalQuantity = cart.getTotalQuantity();
  const headerLink = document.querySelector('.js-return-to-home-link');
  if (headerLink) {
    headerLink.textContent = `${totalQuantity} item${totalQuantity !== 1 ? 's' : ''}`;
  }
}

// --- Place Order ---
document.querySelector('.js-place-order-button').addEventListener('click', () => {
  if (cart.items.length === 0) {
    alert('Your cart is empty! Add some items first.');
    return;
  }

  // Save order to order history
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const order = {
    id: generateOrderId(),
    orderDate: new Date().toISOString(),
    items: [...cart.items],
    totalCents: calculateOrderTotal()
  };
  orders.unshift(order);
  localStorage.setItem('orders', JSON.stringify(orders));

  // Clear cart
  cart.clearCart();

  // Redirect to orders page
  window.location.href = 'orders.html';
});

function generateOrderId() {
  return 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + 
    Math.random().toString(36).substr(2, 5).toUpperCase();
}

function calculateOrderTotal() {
  let itemsCents = 0;
  let shippingCents = 0;

  cart.items.forEach((cartItem) => {
    itemsCents += cartItem.priceCents * cartItem.quantity;
    const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);
    shippingCents += deliveryOption.priceCents;
  });

  const beforeTaxCents = itemsCents + shippingCents;
  const taxCents = Math.round(beforeTaxCents * 0.10);
  return beforeTaxCents + taxCents;
}

// --- Initialize ---
renderOrderSummary();
