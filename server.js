const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'list.json');
const UNITS = ['kg', 'litre', 'pcs'];

fs.mkdirSync(DATA_DIR, { recursive: true });
let items = [];
try { items = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch (e) { items = []; }

// Write to a temp file first so a crash can never corrupt the saved list.
function save() {
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(items, null, 2));
  fs.renameSync(tmp, DATA_FILE);
}
const validQty = q => typeof q === 'number' && isFinite(q) && q > 0 && q <= 100000;

const app = express();
app.use(express.json());

app.get(['/', '/index.html'], (req, res) => {
  const rootFile = path.join(__dirname, 'index.html');
  const pubFile = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(rootFile)) return res.sendFile(rootFile);
  if (fs.existsSync(pubFile)) return res.sendFile(pubFile);
  res.status(404).send('index.html not found');
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/items', (req, res) => res.json(items));

app.post('/api/items', (req, res) => {
  const name = String(req.body.name || '').trim().slice(0, 80);
  const qty = Number(req.body.qty);
  const unit = req.body.unit;
  if (!name || !validQty(qty) || !UNITS.includes(unit)) return res.status(400).json({ error: 'Check name, quantity and unit' });
  // Same item and unit already on the list? Add to it instead of repeating it.
  const same = items.find(i => i.name.toLowerCase() === name.toLowerCase() && i.unit === unit);
  if (same) { same.qty = Math.round((same.qty + qty) * 100) / 100; save(); return res.json(same); }
  const item = { id: crypto.randomUUID(), name, qty, unit, createdAt: Number(req.body.createdAt) || Date.now() };
  items.push(item);
  save();
  res.status(201).json(item);
});

app.patch('/api/items/:id', (req, res) => {
  const item = items.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  if (validQty(req.body.qty)) item.qty = req.body.qty;
  save();
  res.json(item);
});

app.delete('/api/items/:id', (req, res) => {
  items = items.filter(i => i.id !== req.params.id);
  save();
  res.json({ ok: true });
});

app.listen(PORT, () => console.log('Shop list running on port ' + PORT));
