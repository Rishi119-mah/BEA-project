// ============================================
// Cart Data Module
// Manages cart state in localStorage
// ============================================

const cart = {
  items: JSON.parse(localStorage.getItem('cartItems')) || [],

  save() {
    localStorage.setItem('cartItems', JSON.stringify(this.items));
  },

  addItem(product, quantity) {
    const existing = this.items.find(item => item.id === product.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        image: product.image,
        priceCents: product.priceCents,
        quantity: quantity,
        deliveryOptionId: '1' // default: free shipping
      });
    }

    this.save();
  },

  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.save();
  },

  updateQuantity(productId, newQuantity) {
    const item = this.items.find(item => item.id === productId);
    if (item) {
      item.quantity = newQuantity;
      if (item.quantity <= 0) {
        this.removeItem(productId);
      } else {
        this.save();
      }
    }
  },

  updateDeliveryOption(productId, deliveryOptionId) {
    const item = this.items.find(item => item.id === productId);
    if (item) {
      item.deliveryOptionId = deliveryOptionId;
      this.save();
    }
  },

  getTotalQuantity() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  },

  clearCart() {
    this.items = [];
    this.save();
  }
};
