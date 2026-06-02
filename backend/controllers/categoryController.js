import pool from '../db.js';

export const getCategories = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM categories WHERE user_id = $1 ORDER BY created_at`, 
            [req.userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createCategory = async (req, res) => {
    const { name, type, icon, color } = req.body;

    if (!name || !type) {
        return res.status(400).json({ message: 'Name and type are required' });
    }

    if (!['income', 'expense'].includes(type)) { // if (type !== 'income' && type !== 'expense') {
        return res.status(400).json({ message: 'Type must be either income or expense' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO categories (user_id, name, type, icon, color, is_default) 
             VALUES ($1, $2, $3, $4, $5, false) 
             RETURNING *`, 
            [req.userId, name, type, icon || null, color || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') { // unique_violation
            return res.status(400).json({ message: 'Category with this name already exists' });
        }
        console.error('Error creating category:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, type, icon, color } = req.body;

    if (type != null && !['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: 'Type must be either income or expense' });
    }

    try {
        const result = await pool.query(
            `UPDATE categories
            SET name = COALESCE($1, name),
             type = COALESCE($2, type), 
             icon = COALESCE($3, icon), 
             color = COALESCE($4, color)
            WHERE id = $5 AND user_id = $6
            RETURNING *`,
            [name, type, icon, color, id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') { // unique_violation
            return res.status(400).json({ message: 'Category with this name already exists' });
        }   
        console.error('Error updating category:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING id`,
            [id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        console.error('Error deleting category:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
