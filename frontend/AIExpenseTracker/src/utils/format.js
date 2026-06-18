export const formatCurrency = (amount, currency = 'USD') => {
    const value = Number(amount) || 0;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};

export const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const value = String(dateStr);
    const normalized = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value)
        ? value
        : /^\d{4}-\d{2}-\d{2}$/.test(value)
            ? value
            : value.replace(' ', 'T');
    return new Date(normalized).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

export const formatMonth = (yyyyMm) => {
    if (!yyyyMm) return '';
    const [year, month] = yyyyMm.split('-');
    const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    // return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

export const todayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const timeAgo = (date) => {
    if (!date) return '—';
    const value = String(date);
    const normalized = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value)
        ? value
        : /^\d{4}-\d{2}-\d{2}$/.test(value)
            ? value
            : value.replace(' ', 'T');
    const diffMs = Date.now() - new Date(normalized).getTime();
    if (diffMs < 0) return 'just now';
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(date);
};
