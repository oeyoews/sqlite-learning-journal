// server.js
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');
const cors = require('cors'); // 引入 cors 中间件
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// 获取所有笔记
app.get('/notes', (req, res) => {
  db.all('SELECT * FROM notes ORDER BY created_at DESC', (err, rows) => {
    console.log(rows)
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 新增笔记
app.post('/notes', (req, res) => {
  const { title, content } = req.body;
  db.run(
    `INSERT INTO notes (title, content) VALUES (?, ?)`,
    [title, content],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// 删除笔记
app.delete('/notes/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM notes WHERE id = ?`, id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deletedID: id });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
