-- PactMaker Studio Database Schema
-- Criado em: 2024

USE pactmaker;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) NULL,
    subscription ENUM('free', 'pro', 'enterprise') DEFAULT 'free',
    preferences JSON DEFAULT ('{"theme": "light", "language": "pt-BR", "notifications": true}'),
    last_login DATETIME NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_subscription (subscription)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    dimensions JSON NOT NULL,
    materials JSON NOT NULL,
    price JSON NOT NULL,
    template VARCHAR(100),
    preview VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de projetos/facas
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    dimensions JSON NOT NULL,
    customizations JSON,
    knife_data JSON,
    status ENUM('draft', 'generated', 'exported') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir dados iniciais
INSERT INTO users (name, email, password) VALUES 
('Admin', 'admin@pactmaker.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2u') -- senha: 123456
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO products (name, category, description, dimensions, materials, price, template, preview) VALUES 
('Caixa de Bolo Simples', 'alimentos', 'Caixa quadrada para bolos e tortas', 
 '{"width": {"min": 15, "max": 50, "default": 25}, "height": {"min": 5, "max": 20, "default": 10}, "depth": {"min": 15, "max": 50, "default": 25}}',
 '["papel_300g", "papel_250g"]',
 '{"base": 0.85, "per_cm": 0.02}',
 'caixa_bolo_simples',
 '/assets/images/caixa_bolo_simples.jpg'),

('Sacola com Alça Vazada', 'sacolas', 'Sacola tradicional com alça vazada',
 '{"width": {"min": 20, "max": 40, "default": 30}, "height": {"min": 25, "max": 50, "default": 35}, "handle": {"min": 5, "max": 15, "default": 8}}',
 '["papel_300g", "kraft_180g"]',
 '{"base": 0.65, "per_cm": 0.015}',
 'sacola_alca_vazada',
 '/assets/images/sacola_alca_vazada.jpg'),

('Caixa com Visor', 'alimentos', 'Caixa com janela de acetato para visualização',
 '{"width": {"min": 15, "max": 40, "default": 25}, "height": {"min": 8, "max": 25, "default": 12}, "depth": {"min": 15, "max": 40, "default": 25}}',
 '["papel_300g", "acetato_0.2mm"]',
 '{"base": 1.20, "per_cm": 0.03}',
 'caixa_visor',
 '/assets/images/caixa_visor.jpg')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Mostrar tabelas criadas
SHOW TABLES;
