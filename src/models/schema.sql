CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(30) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    branch_id INT REFERENCES branches(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('super_admin', 'owner', 'manager', 'cashier', 'production', 'courier', 'auditor')) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) UNIQUE NOT NULL,
    address TEXT,
    loyalty_points INT DEFAULT 0,
    total_spent NUMERIC(12, 2) DEFAULT 0.00,
    is_vip BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) CHECK (category IN ('kiloan', 'satuan', 'express', 'special')) NOT NULL,
    unit VARCHAR(20) CHECK (unit IN ('kg', 'pcs', 'pair', 'unit')) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    min_qty NUMERIC(5, 2) DEFAULT 1.00,
    estimated_duration_hours INT DEFAULT 24,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    branch_id INT REFERENCES branches(id),
    customer_id INT REFERENCES customers(id),
    cashier_id INT REFERENCES users(id),
    order_source VARCHAR(30) CHECK (order_source IN ('walk-in', 'whatsapp', 'phone', 'pickup')) DEFAULT 'walk-in',
    status VARCHAR(50) CHECK (status IN (
        'pesanan_diterima', 'menunggu_antrean', 'sedang_dicuci', 'sedang_dikeringkan', 
        'sedang_disetrika', 'quality_control', 'siap_diambil', 'dalam_pengantaran', 
        'selesai_diserahkan', 'dibatalkan', 'pengerjaan_ulang'
    )) DEFAULT 'pesanan_diterima',
    payment_status VARCHAR(30) CHECK (payment_status IN ('belum_dibayar', 'dp', 'dibayar_sebagian', 'lunas', 'refund')) DEFAULT 'belum_dibayar',
    subtotal NUMERIC(12, 2) NOT NULL,
    express_fee NUMERIC(10, 2) DEFAULT 0.00,
    delivery_fee NUMERIC(10, 2) DEFAULT 0.00,
    discount NUMERIC(10, 2) DEFAULT 0.00,
    tax NUMERIC(10, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL,
    amount_paid NUMERIC(12, 2) DEFAULT 0.00,
    change_amount NUMERIC(12, 2) DEFAULT 0.00,
    estimated_completion TIMESTAMP NOT NULL,
    actual_completion TIMESTAMP,
    actual_pickup TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transaction_items (
    id SERIAL PRIMARY KEY,
    transaction_id INT REFERENCES transactions(id) ON DELETE CASCADE,
    service_id INT REFERENCES services(id),
    service_name VARCHAR(100) NOT NULL,
    quantity NUMERIC(6, 2) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    item_notes TEXT
);

CREATE TABLE IF NOT EXISTS transaction_timeline (
    id SERIAL PRIMARY KEY,
    transaction_id INT REFERENCES transactions(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id),
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    stock_qty NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    min_stock NUMERIC(10, 2) NOT NULL DEFAULT 5.00,
    buy_price NUMERIC(10, 2) NOT NULL,
    supplier VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS financials (
    id SERIAL PRIMARY KEY,
    branch_id INT REFERENCES branches(id),
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) CHECK (type IN ('pemasukan', 'pengeluaran')) NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(30),
    description TEXT,
    recorded_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

