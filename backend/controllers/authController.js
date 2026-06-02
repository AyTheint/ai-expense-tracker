import bcrypt from 'bcryptjs';  // password hashing
import jwt from 'jsonwebtoken'; // signing and verifying JWTs
import pool from '../db.js'; // PostgreSQL connection pool for database queries
import { defaultCategories } from '../utils/defaultCategories.js';

const signToken = (userId) => 
   jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

export const register = async (req, res) => {
    const { name, email, password, currency = 'USD' } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const client = await pool.connect();
    try {
        const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        await client.query('BEGIN');

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const userResult = await client.query(
            `INSERT INTO users (name, email, password_hash, currency) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id, name, email, currency, created_at`,
            [name, email, passwordHash, currency]
        );
        const user = userResult.rows[0];

        for (const category of defaultCategories) {
            await client.query(
                `INSERT INTO categories (user_id, name, type, icon, color, is_default)
                 VALUES ($1, $2, $3, $4, $5, true)`,
                 [user.id, category.name, category.type, category.icon, category.color]
            );
        }

        await client.query('COMMIT');

        const token = signToken(user.id);
        res.status(201).json({ user, token });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        client.release();
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const result = await pool.query(
            `SELECT id, name, email, password_hash, currency FROM users WHERE email = $1`, 
            [email]);
        
        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = signToken(user.id);
        res.json({ 
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                currency: user.currency,
            }, 
            token 
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getMe = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, currency, created_at FROM users WHERE id = $1`, 
            [req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
