// ============================================
// Inventory Tracker - Data Management Module
// Uses localStorage as persistent storage
// ============================================

const DB = {
  // --- Products ---
  getProducts() {
    return JSON.parse(localStorage.getItem('inv_products')) || [];
  },

  saveProducts(products) {
    localStorage.setItem('inv_products', JSON.stringify(products));
  },

  addProduct(product) {
    const products = this.getProducts();
    product.id = this.generateId();
    product.createdAt = new Date().toISOString();
    product.stockQuantity = Number(product.stockQuantity) || 0;
    product.reorderThreshold = Number(product.reorderThreshold) || 10;
    product.priceCents = Math.round(Number(product.price) * 100);
    products.push(product);
    this.saveProducts(products);
    return product;
  },

  updateProduct(id, updates) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      if (updates.price !== undefined) {
        updates.priceCents = Math.round(Number(updates.price) * 100);
      }
      if (updates.stockQuantity !== undefined) {
        updates.stockQuantity = Number(updates.stockQuantity);
      }
      if (updates.reorderThreshold !== undefined) {
        updates.reorderThreshold = Number(updates.reorderThreshold);
      }
      products[index] = { ...products[index], ...updates };
      this.saveProducts(products);
    }
    return products[index];
  },

  deleteProduct(id) {
    const products = this.getProducts().filter(p => p.id !== id);
    this.saveProducts(products);
  },

  getProductById(id) {
    return this.getProducts().find(p => p.id === id);
  },

  getLowStockProducts() {
    return this.getProducts().filter(p => p.stockQuantity <= p.reorderThreshold);
  },

  getOutOfStockProducts() {
    return this.getProducts().filter(p => p.stockQuantity === 0);
  },

  // --- Shipments (Incoming) ---
  getShipments() {
    return JSON.parse(localStorage.getItem('inv_shipments')) || [];
  },

  saveShipments(shipments) {
    localStorage.setItem('inv_shipments', JSON.stringify(shipments));
  },

  addShipment(shipment) {
    const shipments = this.getShipments();
    shipment.id = this.generateId();
    shipment.date = shipment.date || new Date().toISOString();
    shipment.quantity = Number(shipment.quantity);
    shipments.unshift(shipment);
    this.saveShipments(shipments);

    // Increase product stock
    const product = this.getProductById(shipment.productId);
    if (product) {
      this.updateProduct(shipment.productId, {
        stockQuantity: product.stockQuantity + shipment.quantity
      });
    }

    return shipment;
  },

  // --- Orders (Outgoing) ---
  getOrders() {
    return JSON.parse(localStorage.getItem('inv_orders')) || [];
  },

  saveOrders(orders) {
    localStorage.setItem('inv_orders', JSON.stringify(orders));
  },

  addOrder(order) {
    const orders = this.getOrders();
    order.id = this.generateId();
    order.date = order.date || new Date().toISOString();
    order.items = order.items.map(item => {
      item.quantity = Number(item.quantity);
      return item;
    });

    // Calculate total
    let totalCents = 0;
    order.items.forEach(item => {
      const product = this.getProductById(item.productId);
      if (product) {
        totalCents += product.priceCents * item.quantity;
      }
    });
    order.totalCents = totalCents;

    orders.unshift(order);
    this.saveOrders(orders);

    // Deduct stock for each item
    order.items.forEach(item => {
      const product = this.getProductById(item.productId);
      if (product) {
        const newStock = Math.max(0, product.stockQuantity - item.quantity);
        this.updateProduct(item.productId, { stockQuantity: newStock });
      }
    });

    return order;
  },

  // --- Categories ---
  getCategories() {
    const products = this.getProducts();
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return ['Electronics', 'Clothing', 'Food & Beverage', 'Office Supplies',
            'Tools & Hardware', 'Health & Beauty', 'Home & Garden', 'Automotive',
            ...cats];
  },

  // --- Stats ---
  getStats() {
    const products = this.getProducts();
    const orders = this.getOrders();
    const shipments = this.getShipments();

    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.stockQuantity, 0);
    const lowStock = this.getLowStockProducts().length;
    const outOfStock = this.getOutOfStockProducts().length;
    const totalOrders = orders.length;
    const totalShipments = shipments.length;

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalCents || 0), 0);
    const totalValue = products.reduce((sum, p) => sum + (p.priceCents * p.stockQuantity), 0);

    return {
      totalProducts,
      totalStock,
      lowStock,
      outOfStock,
      totalOrders,
      totalShipments,
      totalRevenue,
      totalValue,
      totalValuation: totalValue
    };
  },

  // --- Seed Demo Data ---
  seedDemoData() {
    if (this.getProducts().length > 0) return; // Already has data

    const demoProducts = [
      { sku: 'ELEC-001', name: 'Wireless Bluetooth Headphones', category: 'Electronics', stockQuantity: 45, reorderThreshold: 15, price: 79.99 },
      { sku: 'ELEC-002', name: 'USB-C Charging Cable 6ft', category: 'Electronics', stockQuantity: 120, reorderThreshold: 30, price: 12.99 },
      { sku: 'ELEC-003', name: 'Portable Power Bank 10000mAh', category: 'Electronics', stockQuantity: 8, reorderThreshold: 20, price: 34.99 },
      { sku: 'CLTH-001', name: 'Cotton Crew Neck T-Shirt', category: 'Clothing', stockQuantity: 200, reorderThreshold: 50, price: 18.50 },
      { sku: 'CLTH-002', name: 'Denim Jeans Classic Fit', category: 'Clothing', stockQuantity: 5, reorderThreshold: 25, price: 49.99 },
      { sku: 'FOOD-001', name: 'Organic Coffee Beans 1lb', category: 'Food & Beverage', stockQuantity: 60, reorderThreshold: 20, price: 14.99 },
      { sku: 'FOOD-002', name: 'Green Tea Box - 50 Bags', category: 'Food & Beverage', stockQuantity: 0, reorderThreshold: 15, price: 8.99 },
      { sku: 'OFFC-001', name: 'A4 Copy Paper 500 Sheets', category: 'Office Supplies', stockQuantity: 300, reorderThreshold: 50, price: 7.49 },
      { sku: 'OFFC-002', name: 'Ballpoint Pens - 12 Pack', category: 'Office Supplies', stockQuantity: 12, reorderThreshold: 20, price: 5.99 },
      { sku: 'TOOL-001', name: 'Cordless Drill Driver Kit', category: 'Tools & Hardware', stockQuantity: 18, reorderThreshold: 10, price: 89.99 },
      { sku: 'HLTH-001', name: 'Hand Sanitizer 500ml', category: 'Health & Beauty', stockQuantity: 3, reorderThreshold: 25, price: 6.99 },
      { sku: 'HOME-001', name: 'LED Desk Lamp Adjustable', category: 'Home & Garden', stockQuantity: 22, reorderThreshold: 10, price: 29.99 },
    ];

    demoProducts.forEach(p => this.addProduct(p));

    // Add demo shipments
    const products = this.getProducts();
    if (products.length >= 3) {
      this.addShipment({ productId: products[0].id, quantity: 20, supplier: 'TechCorp Inc.', notes: 'Regular monthly restock' });
      this.addShipment({ productId: products[2].id, quantity: 50, supplier: 'PowerMax Ltd.', notes: 'Bulk order for season' });
    }
  },

  // --- Utility ---
  generateId() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
  },

  // --- CSV Export ---
  exportProductsCSV() {
    const products = this.getProducts();
    const headers = ['SKU', 'Name', 'Category', 'Stock Quantity', 'Reorder Threshold', 'Price', 'Status'];
    const rows = products.map(p => [
      p.sku,
      `"${p.name}"`,
      p.category,
      p.stockQuantity,
      p.reorderThreshold,
      (p.priceCents / 100).toFixed(2),
      p.stockQuantity === 0 ? 'Out of Stock' : p.stockQuantity <= p.reorderThreshold ? 'Low Stock' : 'In Stock'
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  exportOrdersCSV() {
    const orders = this.getOrders();
    const headers = ['Order ID', 'Date', 'Customer', 'Items', 'Total'];
    const rows = orders.map(o => [
      o.id,
      new Date(o.date).toLocaleDateString(),
      `"${o.customerName || 'N/A'}"`,
      o.items.length,
      (o.totalCents / 100).toFixed(2)
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  exportShipmentsCSV() {
    const shipments = this.getShipments();
    const headers = ['Shipment ID', 'Date', 'Product', 'Quantity', 'Supplier', 'Notes'];
    const rows = shipments.map(s => {
      const product = this.getProductById(s.productId);
      return [
        s.id,
        new Date(s.date).toLocaleDateString(),
        `"${product ? product.name : 'Unknown'}"`,
        s.quantity,
        `"${s.supplier || 'N/A'}"`,
        `"${s.notes || ''}"`,
      ];
    });
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  exportLowStockCSV() {
    const products = this.getLowStockProducts();
    const headers = ['SKU', 'Name', 'Category', 'Current Stock', 'Reorder Threshold', 'Deficit'];
    const rows = products.map(p => [
      p.sku,
      `"${p.name}"`,
      p.category,
      p.stockQuantity,
      p.reorderThreshold,
      p.reorderThreshold - p.stockQuantity
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }
};

// Seed demo data on first load
DB.seedDemoData();
