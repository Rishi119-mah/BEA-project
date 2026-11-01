// ============================================
// Products Page Script
// ============================================

// Render sidebar
document.getElementById('sidebar').innerHTML = getSidebarHTML('products');

// Populate category filter
function populateCategoryFilter() {
  const categories = DB.getCategories();
  const unique = [...new Set(categories)];
  const select = document.getElementById('categoryFilter');
  // Keep first option
  select.innerHTML = '<option value="">All Categories</option>';
  unique.forEach(cat => {
    select.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

// Render products table
function renderProducts() {
  const search = document.getElementById('searchInput').value.toLowerCase().trim();
  const category = document.getElementById('categoryFilter').value;
  const status = document.getElementById('statusFilter').value;

  let products = DB.getProducts();

  // Filter by search
  if (search) {
    products = products.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.sku.toLowerCase().includes(search) ||
      (p.category && p.category.toLowerCase().includes(search))
    );
  }

  // Filter by category
  if (category) {
    products = products.filter(p => p.category === category);
  }

  // Filter by status
  if (status === 'in-stock') {
    products = products.filter(p => p.stockQuantity > p.reorderThreshold);
  } else if (status === 'low-stock') {
    products = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.reorderThreshold);
  } else if (status === 'out-of-stock') {
    products = products.filter(p => p.stockQuantity === 0);
  }

  const tbody = document.getElementById('productsTableBody');

  if (products.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <div class="empty-icon">📦</div>
            <p>No products found</p>
            <button class="btn btn-primary btn-sm" onclick="openAddProductModal()">＋ Add Product</button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = products.map(p => {
    const stockStatus = getStockStatus(p);
    return `
      <tr>
        <td><span class="font-mono text-muted">${p.sku}</span></td>
        <td class="font-bold">${p.name}</td>
        <td><span class="text-muted">${p.category}</span></td>
        <td>${formatCurrency(p.priceCents)}</td>
        <td>
          ${p.stockQuantity}
          ${stockBarHTML(p)}
        </td>
        <td><span class="text-muted">${p.reorderThreshold}</span></td>
        <td><span class="badge ${stockStatus.class}">${stockStatus.label}</span></td>
        <td>
          <div class="flex gap-8">
            <button class="btn btn-sm btn-secondary" onclick="openEditProductModal('${p.id}')">✏️</button>
            <button class="btn btn-sm btn-danger" onclick="confirmDelete('${p.id}')">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Open Add Product Modal
function openAddProductModal() {
  document.getElementById('productModalTitle').textContent = 'Add Product';
  document.getElementById('editProductId').value = '';
  document.getElementById('productSku').value = '';
  document.getElementById('productName').value = '';
  document.getElementById('productCategory').value = '';
  document.getElementById('productPrice').value = '';
  document.getElementById('productStock').value = '';
  document.getElementById('productThreshold').value = '10';
  openModal('productModal');
}

// Open Edit Product Modal
function openEditProductModal(id) {
  const product = DB.getProductById(id);
  if (!product) return;

  document.getElementById('productModalTitle').textContent = 'Edit Product';
  document.getElementById('editProductId').value = id;
  document.getElementById('productSku').value = product.sku;
  document.getElementById('productName').value = product.name;
  document.getElementById('productCategory').value = product.category;
  document.getElementById('productPrice').value = (product.priceCents / 100).toFixed(2);
  document.getElementById('productStock').value = product.stockQuantity;
  document.getElementById('productThreshold').value = product.reorderThreshold;
  openModal('productModal');
}

// Save Product (Add or Update)
function saveProduct() {
  const id = document.getElementById('editProductId').value;
  const sku = document.getElementById('productSku').value.trim();
  const name = document.getElementById('productName').value.trim();
  const category = document.getElementById('productCategory').value;
  const price = document.getElementById('productPrice').value;
  const stock = document.getElementById('productStock').value;
  const threshold = document.getElementById('productThreshold').value;

  // Validate
  if (!sku || !name || !category || !price) {
    showToast('Please fill in all required fields', 'error');
    return;
  }

  if (id) {
    // Update existing
    DB.updateProduct(id, {
      sku, name, category,
      price: Number(price),
      stockQuantity: Number(stock) || 0,
      reorderThreshold: Number(threshold) || 10
    });
    showToast(`${name} updated successfully`);
  } else {
    // Add new
    DB.addProduct({
      sku, name, category,
      price: Number(price),
      stockQuantity: Number(stock) || 0,
      reorderThreshold: Number(threshold) || 10
    });
    showToast(`${name} added to catalog`);
  }

  closeModal('productModal');
  renderProducts();
}

// Delete Product
let deleteProductId = null;

function confirmDelete(id) {
  deleteProductId = id;
  const product = DB.getProductById(id);
  document.getElementById('deleteProductName').textContent = product ? product.name : 'this product';
  openModal('deleteModal');
}

document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
  if (deleteProductId) {
    const product = DB.getProductById(deleteProductId);
    DB.deleteProduct(deleteProductId);
    closeModal('deleteModal');
    renderProducts();
    showToast(`${product ? product.name : 'Product'} deleted`);
    deleteProductId = null;
  }
});

// Initialize
populateCategoryFilter();
renderProducts();
