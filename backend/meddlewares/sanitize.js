/**
 * Recursively strips MongoDB operator keys (starting with `$` or containing `.`)
 * from plain objects and arrays to prevent NoSQL operator injection.
 */
const sanitizeValue = (value) => {
    if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i += 1) {
            sanitizeValue(value[i]);
        }
        return value;
    }

    if (value && typeof value === 'object') {
        for (const key of Object.keys(value)) {
            if (key.startsWith('$') || key.includes('.')) {
                delete value[key];
            } else {
                sanitizeValue(value[key]);
            }
        }
    }

    return value;
};

const sanitizeInput = (req, res, next) => {
    if (req.body) sanitizeValue(req.body);
    if (req.params) sanitizeValue(req.params);
    next();
};

module.exports = sanitizeInput;

