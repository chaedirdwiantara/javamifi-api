-- JavaMiFi Database Schema
-- Execute this SQL in your Supabase SQL Editor

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url VARCHAR(500),
  specs JSONB DEFAULT '{}'::jsonb,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  customer_name VARCHAR(200) NOT NULL,
  customer_email VARCHAR(200) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_address TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending',
  midtrans_transaction_id VARCHAR(100) UNIQUE,
  midtrans_order_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(200) NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to products table
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to orders table
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample categories
INSERT INTO categories (name, icon) VALUES
  ('SIM Card', 'sim-card'),
  ('Modem', 'router'),
  ('Accessories', 'wrench')
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, category_id, image_url, specs, stock) 
SELECT 
  'JavaMiFi Prepaid 30GB',
  '30GB data for 30 days, suitable for light browsing and social media',
  150000,
  (SELECT id FROM categories WHERE name = 'SIM Card' LIMIT 1),
  'https://via.placeholder.com/300x300.png?text=30GB+SIM',
  '{"data": "30GB", "validity": "30 days", "speed": "4G LTE"}'::jsonb,
  100
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'JavaMiFi Prepaid 30GB');

INSERT INTO products (name, description, price, category_id, image_url, specs, stock) 
SELECT 
  'JavaMiFi Unlimited Monthly',
  'Unlimited data with FUP 50GB, perfect for heavy users',
  250000,
  (SELECT id FROM categories WHERE name = 'SIM Card' LIMIT 1),
  'https://via.placeholder.com/300x300.png?text=Unlimited+SIM',
  '{"data": "Unlimited", "validity": "30 days", "speed": "4G LTE", "fup": "50GB"}'::jsonb,
  150
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'JavaMiFi Unlimited Monthly');

INSERT INTO products (name, description, price, category_id, image_url, specs, stock) 
SELECT 
  'MiFi Portable Router',
  'Portable 4G LTE router supporting up to 10 devices',
  850000,
  (SELECT id FROM categories WHERE name = 'Modem' LIMIT 1),
  'https://via.placeholder.com/300x300.png?text=MiFi+Router',
  '{"battery": "3000mAh", "devices": "10", "network": "4G LTE"}'::jsonb,
  50
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'MiFi Portable Router');

INSERT INTO products (name, description, price, category_id, image_url, specs, stock) 
SELECT 
  'USB Data Cable',
  'High-speed USB Type-C data cable for modem connectivity',
  50000,
  (SELECT id FROM categories WHERE name = 'Accessories' LIMIT 1),
  'https://via.placeholder.com/300x300.png?text=USB+Cable',
  '{"length": "1.5m", "type": "USB Type-C"}'::jsonb,
  200
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'USB Data Cable');

-- Verification queries (run these to check if setup was successful)
SELECT 'Categories Count:' AS info, COUNT(*) AS count FROM categories
UNION ALL
SELECT 'Products Count:' AS info, COUNT(*) AS count FROM products
UNION ALL
SELECT 'Orders Count:' AS info, COUNT(*) AS count FROM orders
UNION ALL
SELECT 'Order Items Count:' AS info, COUNT(*) AS count FROM order_items;
