-- Script Consolidado de Creación de Base de Datos para Sanmarkiosko
-- (Ejecutar todo este contenido en el SQL Editor de Supabase)

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habilitar extensión para búsquedas (trigramas)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =========================================================================
-- 1. TABLA DE USUARIOS (Estudiantes UNMSM)
-- =========================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    faculty VARCHAR(100),
    career VARCHAR(100),
    year VARCHAR(4), -- Año de ingreso (ej: '2021')
    bio TEXT,
    avatar_url VARCHAR(255),
    phone VARCHAR(20), -- WhatsApp de contacto directo
    is_pro BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3, 2) DEFAULT 5.00 CHECK (rating >= 0.00 AND rating <= 5.00),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Restricción estricta de correo institucional sanmarquino
    CONSTRAINT chk_email_unmsm CHECK (email LIKE '%@unmsm.edu.pe')
);

-- =========================================================================
-- 2. TABLA DE ANUNCIOS (Listings - Productos o Servicios)
-- =========================================================================
CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0.00),
    category VARCHAR(50) NOT NULL,
    image_url VARCHAR(500),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_boosted BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'Activo' CHECK (status IN ('Activo', 'Vendido', 'Inactivo')),
    type VARCHAR(20) DEFAULT 'Producto' CHECK (type IN ('Producto', 'Servicio')),
    stock INTEGER DEFAULT 1 CHECK (stock >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Restricciones de categorías de anuncios admitidas
    CONSTRAINT chk_category CHECK (category IN (
        'Académico', 
        'Comida', 
        'Tecnología', 
        'Vida Diaria', 
        'Otros Servicios', 
        'Otros Productos'
    ))
);

-- =========================================================================
-- 3. TABLA DE ANUNCIOS FAVORITOS
-- =========================================================================
CREATE TABLE IF NOT EXISTS favorites (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, listing_id)
);

-- =========================================================================
-- 4. TABLA DE TRANSACCIONES / HISTORIAL (Reservas realizadas)
-- =========================================================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0.00),
    status VARCHAR(20) DEFAULT 'Completado' CHECK (status IN ('Pendiente', 'Completado', 'Cancelado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 5. INDEXACIÓN PARA MÁXIMA VELOCIDAD Y RENDIMIENTO
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing ON favorites(listing_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_is_boosted ON listings(is_boosted);

-- Índice para búsquedas rápidas por palabras en títulos de productos
CREATE INDEX IF NOT EXISTS idx_listings_title_trgm ON listings USING gin (title gin_trgm_ops);

-- =========================================================================
-- 6. TRIGGERS Y FUNCIONES AUXILIARES PARA ACTUALIZACIÓN DE TIEMPO (UPDATED_AT)
-- =========================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
