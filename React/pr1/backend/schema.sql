TRUNCATE TABLE services RESTART IDENTITY CASCADE;
TRUNCATE TABLE categories RESTART IDENTITY CASCADE;

INSERT INTO categories (category_name) VALUES
    ('Периферия'),      
    ('Аудио'),          
    ('Мониторы'),       
    ('Комплектующие'),  
    ('Услуги сервиса')  
ON CONFLICT DO NOTHING;

INSERT INTO services (name, description, duration_minutes, price, discount_percent, category_id, image_url) VALUES
    ('Клавиатура механика', 'Игровая механическая клавиатура с RGB', 0, 3500, 10, 1, 'https://avatars.mds.yandex.net/i?id=c4b1cadbaed514ee77cd20b2c28bcd6f52bd5e66-5334983-images-thumbs&n=13'),
    ('Мышь игровая', 'Оптическая мышь с сенсором 16000 DPI', 0, 1200, 0, 1, 'https://avatars.mds.yandex.net/i?id=c679ea979f8b490f5c63d730a0266aca_l-9182048-images-thumbs&n=13'),
    ('Веб-камера Full HD', 'Камера для стримов и видеозвонков', 0, 2200, 0, 1, 'https://avatars.mds.yandex.net/i?id=f49975f8123ac1bdac3debe022df8efeab019954-12555434-images-thumbs&n=13'),
    ('Коврик для мыши XXL', 'Огромный коврик на весь стол 900x400мм', 0, 900, 0, 1, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=500&q=60'),
    
    ('Наушники с микрофоном', 'Полноразмерные наушники 7.1', 0, 2800, 0, 2, 'https://avatars.mds.yandex.net/i?id=16977c8a8a5f0fa58a83a4710534424af576f3cc-10244499-images-thumbs&n=13'),
    ('Студийный микрофон', 'Конденсаторный микрофон USB', 0, 4500, 15, 2, 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=500&q=60'),
    
    ('Монитор 24" 144Hz', 'Игровой монитор для киберспорта', 0, 15000, 15, 3, 'https://avatars.mds.yandex.net/i?id=0f8d0904d70dca0a220542f95224b3d2e4b3479f-9222921-images-thumbs&n=13'),
    ('Монитор 27" 4K', 'Профессиональный монитор для дизайнеров', 0, 28000, 0, 3, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=500&q=60'),
    
    ('Видеокарта RTX 4060', 'Отличная карта для современных игр в Full HD', 0, 35000, 5, 4, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=500&q=60'),
    ('Процессор Intel i5', 'Шестиядерный процессор 12-го поколения', 0, 16000, 0, 4, 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=500&q=60'),
    ('Оперативная память 16GB', 'Комплект 2x8GB DDR4 3200MHz', 0, 4000, 0, 4, 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=500&q=60'),
    ('SSD накопитель 1TB', 'Быстрый M.2 NVMe накопитель', 0, 7500, 10, 4, 'https://images.unsplash.com/photo-1628557044797-f21a177c37ec?auto=format&fit=crop&w=500&q=60'),
    
    ('Сборка ПК', 'Профессиональная сборка из ваших комплектующих', 120, 3000, 0, 5, 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=500&q=60'),
    ('Установка Windows + ПО', 'Установка ОС, драйверов и базовых программ', 60, 1500, 0, 5, 'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?auto=format&fit=crop&w=500&q=60'),
    ('Чистка ноутбука', 'Замена термопасты и чистка от пыли', 45, 2000, 20, 5, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=500&q=60')
ON CONFLICT DO NOTHING;

UPDATE services 
SET image_url = 'https://avatars.mds.yandex.net/i?id=582c117986aa8e019fcf1c239939db5023da4c1b-5887379-images-thumbs&n=13' 
WHERE name = 'SSD накопитель 1TB';


UPDATE services 
SET image_url = 'https://avatars.mds.yandex.net/i?id=ca04dc66c52516f81693d2786ccf3622bccf313a-5210601-images-thumbs&n=13' 
WHERE name = 'Коврик для мыши XXL';

UPDATE services 
SET image_url = 'https://avatars.mds.yandex.net/i?id=70a36430f00c18b7b2b45e70e965fba70ee16065-4211909-images-thumbs&n=13' 
WHERE name = 'Монитор 24" 144Hz';

UPDATE services 
SET image_url = 'https://avatars.mds.yandex.net/i?id=d53898b9f9df508cfaa9ebedb5476117e6995220-8376176-images-thumbs&n=13' 
WHERE name = 'Монитор 27" 4K';

UPDATE services 
SET image_url = 'https://avatars.mds.yandex.net/i?id=a54aff1e32d29a73d0997a770cfb402c12f6440e-4220123-images-thumbs&n=13' 
WHERE name = 'Процессор Intel i5';



ALTER TABLE users ADD COLUMN address VARCHAR(255);


INSERT INTO categories (category_name) VALUES ('Аудио');