// backend/server.js
const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

app.get('/api/asin', async (req, res) => {
    const { asin, marketplace } = req.query;

    if (!asin || !marketplace) {
        return res.status(400).json({ error: 'Faltan parámetros ASIN o marketplace.' });
    }

    const url = `https://www.amazon.${marketplace}/dp/${asin}`;

    try {
        const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36');
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const data = await page.evaluate(() => {
            const title = document.getElementById('productTitle')?.innerText?.trim() || null;
            const bullets = Array.from(document.querySelectorAll('#feature-bullets ul li'))
                .slice(0, 5)
                .map(li => li.innerText.trim().replace(/\s+/g, ' '));
            const description = document.getElementById('productDescription')?.innerText?.trim() ||
                document.querySelector('#productDescription_feature_div')?.innerText?.trim() || null;
            return { title, bullets, description };
        });

        await browser.close();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'No se pudo obtener la información del producto.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
