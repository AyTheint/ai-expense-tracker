import pool from '../db.js';

const formatCurrency = (value, currency = 'USD') =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(value);

export const getNotifications = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                b.id,
                b.amount,
                b.period,
                c.name AS category_name,
                COALESCE(SUM(t.amount), 0) AS spent,
                u.currency
            FROM budgets b
            JOIN categories c ON c.id = b.category_id
            JOIN users u ON u.id = b.user_id
            LEFT JOIN transactions t ON t.category_id = b.category_id
                AND t.user_id = b.user_id
                AND t.type = 'expense'
                AND (
                    (b.period = 'monthly' AND t.transaction_date >= DATE_TRUNC('month', CURRENT_DATE))
                    OR (b.period = 'weekly' AND t.transaction_date >= DATE_TRUNC('week', CURRENT_DATE))
                    OR (b.period = 'yearly' AND t.transaction_date >= DATE_TRUNC('year', CURRENT_DATE))
                )
            WHERE b.user_id = $1
            GROUP BY b.id, c.name, u.currency
            ORDER BY spent DESC`,
            [req.userId]
        );

        const notifications = result.rows.reduce((list, row) => {
            const amount = parseFloat(row.amount);
            const spent = parseFloat(row.spent);
            if (!amount || amount === 0) return list;

            const percent = Math.round((spent / amount) * 100);
            const label = `${row.category_name} budget`;
            let message = null;
            let severity = null;

            if (percent >= 100) {
                severity = 'over_budget';
                message = `You are over your ${row.period} budget for ${row.category_name} by ${formatCurrency(
                    spent - amount,
                    row.currency
                )}.`;
            } else if (percent >= 90) {
                severity = 'warning';
                message = `You're at ${percent}% of your ${row.period} budget for ${row.category_name}.`; 
            } else if (percent >= 75) {
                severity = 'notice';
                message = `You've used ${percent}% of your ${row.period} budget for ${row.category_name}.`;
            }

            if (message) {
                list.push({
                    id: `budget-${row.id}`,
                    title: label,
                    message,
                    timestamp: 'Today',
                    severity,
                });
            }

            return list;
        }, []);

        res.json(notifications);
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};