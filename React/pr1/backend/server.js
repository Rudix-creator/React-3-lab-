const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
});

pool.on('connect', () => console.log('Подключение к PostgreSQL установлено'));
pool.on('error', (err) => console.error('Ошибка подключения к PostgreSQL:', err));

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query(`
            SELECT u.user_id, u.full_name, u.email, u.role_id, u.address, c.discount_percent as coupon_discount
            FROM users u
            LEFT JOIN discount_coupons c ON u.coupon_id = c.coupon_id
            WHERE u.email = $1 AND u.password = $2
        `, [email, password]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        res.json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories ORDER BY category_name');
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/categories', async (req, res) => {
    try {
        const { category_name } = req.body;
        if (!category_name || category_name.trim() === "") {
            return res.status(400).json({ error: 'Название категории не может быть пустым' });
        }
        const check = await pool.query('SELECT * FROM categories WHERE LOWER(category_name) = LOWER($1)', [category_name.trim()]);
        if (check.rows.length > 0) {
            return res.status(400).json({ error: 'Такая категория уже существует!' });
        }
        const result = await pool.query('INSERT INTO categories (category_name) VALUES ($1) RETURNING *', [category_name.trim()]);
        res.status(201).json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/categories/:id', async (req, res) => {
    try {
        await pool.query('UPDATE services SET category_id = NULL WHERE category_id = $1', [req.params.id]);
        await pool.query('DELETE FROM categories WHERE category_id = $1', [req.params.id]);
        res.json({ message: 'Категория удалена' });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/coupons', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM discount_coupons');
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/coupons', async (req, res) => {
    try {
        const { code, discount_percent } = req.body;
        if (!code || !discount_percent) return res.status(400).json({ error: 'Заполните код и процент' });
        const result = await pool.query('INSERT INTO discount_coupons (code, discount_percent) VALUES ($1, $2) RETURNING *', [code, discount_percent]);
        res.status(201).json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/coupons/:id', async (req, res) => {
    try {
        const { code, discount_percent } = req.body;
        await pool.query('UPDATE discount_coupons SET code = $1, discount_percent = $2 WHERE coupon_id = $3', [code, discount_percent, req.params.id]);
        res.json({ message: 'Купон изменен' });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/coupons/:id', async (req, res) => {
    try {
        await pool.query('UPDATE users SET coupon_id = NULL WHERE coupon_id = $1', [req.params.id]);
        await pool.query('DELETE FROM discount_coupons WHERE coupon_id = $1', [req.params.id]);
        res.json({ message: 'Купон удален' });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { user_id, items } = req.body;
        await pool.query('BEGIN');
        let firstOrderId = null;
        
        for (let item of items) {
            const appt = await pool.query(
                "INSERT INTO appointments (service_id, user_id, appointment_date, appointment_time, status) VALUES ($1, $2, CURRENT_DATE, CURRENT_TIME, $3) RETURNING appointment_id",
                [item.service_id, user_id, String(item.quantity)]
            );
            if (!firstOrderId) firstOrderId = appt.rows[0].appointment_id;
            
            await pool.query(
                "INSERT INTO payments (appointment_id, amount) VALUES ($1, $2)",
                [appt.rows[0].appointment_id, item.finalPrice * item.quantity]
            );
        }
        await pool.query('COMMIT');
        res.json({ message: 'Заказ успешно оформлен', order_id: firstOrderId });
    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/users/:id/orders', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                ROW_NUMBER() OVER (PARTITION BY sub.user_id ORDER BY sub.appointment_date, sub.appointment_time) as user_order_number,
                sub.appointment_date,
                sub.items_summary,
                sub.total_quantity,
                sub.total_amount
            FROM (
                SELECT 
                    a.user_id,
                    a.appointment_date,
                    a.appointment_time,
                    STRING_AGG(s.name || ' (' || COALESCE(NULLIF(REGEXP_REPLACE(a.status, '\\D', '', 'g'), ''), '1') || ' шт.)', ', ') as items_summary,
                    SUM(COALESCE(NULLIF(REGEXP_REPLACE(a.status, '\\D', '', 'g'), '')::INTEGER, 1)) as total_quantity,
                    SUM(p.amount) as total_amount
                FROM appointments a
                JOIN services s ON a.service_id = s.service_id
                JOIN payments p ON a.appointment_id = p.appointment_id
                WHERE a.user_id = $1
                GROUP BY a.user_id, a.appointment_date, a.appointment_time
            ) sub
            ORDER BY sub.appointment_date DESC, sub.appointment_time DESC
        `, [req.params.id]);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/services', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.*, COALESCE(c.category_name, 'Нет категории') as category_name 
            FROM services s
            LEFT JOIN categories c ON s.category_id = c.category_id
            ORDER BY s.service_id DESC
        `);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/services/:id', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.*, COALESCE(c.category_name, 'Нет категории') as category_name 
            FROM services s 
            LEFT JOIN categories c ON s.category_id = c.category_id 
            WHERE s.service_id = $1
        `, [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Не найдено' });
        res.json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/services/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM services WHERE service_id = $1', [req.params.id]);
        res.json({ message: 'Услуга удалена' });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/services/:id/discount', async (req, res) => {
    try {
        const { discount_percent } = req.body;
        const result = await pool.query('UPDATE services SET discount_percent = $1 WHERE service_id = $2 RETURNING *', [discount_percent, req.params.id]);
        res.json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT user_id, full_name, email, role_id, coupon_id, address FROM users');
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/users/:id/coupon', async (req, res) => {
    try {
        const { coupon_id } = req.body;
        const result = await pool.query('UPDATE users SET coupon_id = $1 WHERE user_id = $2 RETURNING *', [coupon_id || null, req.params.id]);
        res.json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/users/:id/credentials', async (req, res) => {
    try {
        const { email, password, address } = req.body;
        await pool.query('UPDATE users SET email = $1, password = $2, address = $3 WHERE user_id = $4', [email, password, address, req.params.id]);
        res.json({ message: 'Данные обновлены' });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));