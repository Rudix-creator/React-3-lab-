CREATE TABLE IF NOT EXISTS roles (
    role_id     SERIAL PRIMARY KEY,
    role_name   VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS discount_coupons (
    coupon_id         SERIAL PRIMARY KEY,
    code              VARCHAR(50) UNIQUE NOT NULL,
    discount_percent  NUMERIC(5,2) NOT NULL,
    description       VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS users (
    user_id     SERIAL PRIMARY KEY,
    full_name   VARCHAR(150) NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL, 
    role_id     INTEGER REFERENCES roles(role_id) DEFAULT 1,
    coupon_id   INTEGER REFERENCES discount_coupons(coupon_id), 
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
    category_id     SERIAL PRIMARY KEY,
    category_name   VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
    service_id        SERIAL PRIMARY KEY,
    name              VARCHAR(150) NOT NULL,
    description       TEXT,
    duration_minutes  INTEGER NOT NULL DEFAULT 30,
    price             NUMERIC(10,2) NOT NULL,
    discount_percent  NUMERIC(5,2) NOT NULL DEFAULT 0, 
    category_id       INTEGER REFERENCES categories(category_id),
    image_url         TEXT,
    created_at        TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
    appointment_id     SERIAL PRIMARY KEY,
    user_id            INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    service_id         INTEGER NOT NULL REFERENCES services(service_id) ON DELETE CASCADE,
    appointment_date   DATE NOT NULL,
    appointment_time   TIME NOT NULL,
    status             VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at         TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
    payment_id      SERIAL PRIMARY KEY,
    appointment_id  INTEGER NOT NULL REFERENCES appointments(appointment_id) ON DELETE CASCADE,
    amount          NUMERIC(10,2) NOT NULL,
    payment_method  VARCHAR(50) NOT NULL DEFAULT 'card',
    status          VARCHAR(20) NOT NULL DEFAULT 'paid',
    paid_at         TIMESTAMP DEFAULT NOW()
);

INSERT INTO roles (role_name) VALUES ('user'), ('admin')
ON CONFLICT DO NOTHING;

INSERT INTO discount_coupons (code, discount_percent, description) VALUES
    ('WELCOME10', 10, 'Приветственная скидка 10%'),
    ('VIP20', 20, 'VIP-купон 20%'),
    ('FRIEND5', 5, 'Скидка за приглашение друга 5%')
ON CONFLICT DO NOTHING;

INSERT INTO users (full_name, email, password, role_id, coupon_id) VALUES
    ('Админ Админов', 'admin@shop.ru', 'admin123', 2, NULL),
    ('Иван Иванов', 'ivan@mail.ru', 'user123', 1, 2),
    ('Мария Петрова', 'maria@mail.ru', 'user123', 1, NULL)
ON CONFLICT DO NOTHING;

INSERT INTO categories (category_name) VALUES
    ('Стрижки'),
    ('Маникюр'),
    ('Массаж'),
    ('Косметология'),
    ('SPA')
ON CONFLICT DO NOTHING;

INSERT INTO services (name, description, duration_minutes, price, discount_percent, category_id, image_url) VALUES
    ('Женская стрижка', 'Стрижка любой сложности', 60, 1500, 0, 1, NULL),
    ('Мужская стрижка', 'Классическая мужская стрижка', 30, 800, 10, 1, NULL),
    ('Окрашивание', 'Окрашивание в один тон', 120, 3500, 0, 1, NULL),
    ('Маникюр классический', 'Обрезной маникюр', 60, 1200, 0, 2, NULL),
    ('Маникюр с покрытием', 'Маникюр + гель-лак', 90, 1800, 15, 2, NULL),
    ('Массаж спины', 'Расслабляющий массаж спины', 45, 2000, 0, 3, NULL),
    ('Массаж всего тела', 'Общий расслабляющий массаж', 90, 3500, 20, 3, NULL),
    ('Чистка лица', 'Механическая чистка лица', 60, 2500, 0, 4, NULL),
    ('Пилинг', 'Химический пилинг лица', 40, 2200, 0, 4, NULL),
    ('SPA-день', 'Комплексная SPA-программа', 180, 6000, 0, 5, NULL)
ON CONFLICT DO NOTHING;
