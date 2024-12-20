const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ensure customers directory exists
async function ensureCustomersDir() {
    const customersDir = path.join(__dirname, 'public', 'customers');
    try {
        await fs.access(customersDir);
    } catch {
        await fs.mkdir(customersDir, { recursive: true });
    }
    return customersDir;
}

// Create customer pages
app.post('/create-page', async (req, res) => {
    try {
        const { customerId, gContent, mContent } = req.body;
        const customersDir = await ensureCustomersDir();

        // Write G page
        await fs.writeFile(
            path.join(customersDir, `${customerId}_g.html`),
            gContent,
            'utf8'
        );

        // Write M page
        await fs.writeFile(
            path.join(customersDir, `${customerId}_m.html`),
            mContent,
            'utf8'
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error creating pages:', error);
        res.status(500).json({ error: 'Failed to create pages' });
    }
});

// Delete customer pages
app.delete('/delete-pages/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const customersDir = await ensureCustomersDir();

        // Delete G page
        try {
            await fs.unlink(path.join(customersDir, `${customerId}_g.html`));
        } catch (e) {
            console.log('G page not found:', e);
        }

        // Delete M page
        try {
            await fs.unlink(path.join(customersDir, `${customerId}_m.html`));
        } catch (e) {
            console.log('M page not found:', e);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting pages:', error);
        res.status(500).json({ error: 'Failed to delete pages' });
    }
});

// Start server
app.listen(port, async () => {
    try {
        const customersDir = await ensureCustomersDir();
        console.log('Customers directory ready:', customersDir);
        console.log(`Server running at http://localhost:${port}`);
    } catch (err) {
        console.error('Error during startup:', err);
    }
});
