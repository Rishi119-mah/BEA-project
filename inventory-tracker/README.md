# 📦 InvenTrack — Lightweight Inventory & Warehouse Tracker

A responsive, dark-mode Inventory and Warehouse Management Web Application tailored for small retail and warehouse businesses.

---

## ✨ Features

1. **Dashboard (`index.html`)**
   - Real-time KPI summary: Total Products, Units in Stock, Low Stock, Depleted Items, Asset Valuation, and Sales Revenue.
   - Interactive Low Stock Alerts widget with direct restock links.
   - Recent activity feed showing inbound shipments and outgoing orders.
   - Quick overview inventory table with live stock status indicators.

2. **Product Catalog (`products.html`)**
   - Full CRUD: Add, edit, and delete products.
   - Product attributes: SKU, Name, Category, Stock Quantity, Reorder Threshold, and Price.
   - Live real-time search across SKUs, product names, and categories.
   - Filter by Category and Stock Status (In Stock, Low Stock, Out of Stock).
   - One-click CSV export of the product catalog.

3. **Incoming Shipments (`shipments.html`)**
   - Restock logging with Supplier name, Quantity, Date, and Tracking Notes.
   - **Automatic Stock Addition**: Logging a shipment automatically increments product inventory.
   - Real-time shipment statistics (Total Shipments, Units Received, Unique Suppliers).

4. **Outgoing Orders (`orders.html`)**
   - Multi-item order logging with customer names.
   - Real-time stock validation: Prevents overselling if stock is insufficient.
   - **Automatic Stock Deduction**: Logging an order immediately reduces stock and checks reorder thresholds.
   - View order item breakdown and order totals.

5. **Reports & Analytics (`reports.html`)**
   - Category Stock Valuation breakdown with percentage distribution.
   - Warehouse Summary metrics (Total Asset Value, Dispatched Orders, Health Status).
   - Critical Stock Alert table with deficit calculations and direct 1-click restock actions.
   - Basic CSV exports for:
     - Full Product Catalog CSV
     - Low-Stock & Deficit Alert CSV
     - Orders History CSV
     - Shipments Log CSV

---

## 🚀 How to Run

Simply open any of the HTML files directly in your web browser:

- **Dashboard**: [index.html](file:///Users/rishimaheshwari/Downloads/javascript-amazon-project-main/inventory-tracker/index.html)
- **Products**: [products.html](file:///Users/rishimaheshwari/Downloads/javascript-amazon-project-main/inventory-tracker/products.html)
- **Shipments**: [shipments.html](file:///Users/rishimaheshwari/Downloads/javascript-amazon-project-main/inventory-tracker/shipments.html)
- **Orders**: [orders.html](file:///Users/rishimaheshwari/Downloads/javascript-amazon-project-main/inventory-tracker/orders.html)
- **Reports**: [reports.html](file:///Users/rishimaheshwari/Downloads/javascript-amazon-project-main/inventory-tracker/reports.html)

No server or build tools required — data persists reliably in your browser's `localStorage`.
