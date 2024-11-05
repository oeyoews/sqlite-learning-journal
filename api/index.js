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
    if (err) {
      return res.status(500).json({
        code: 500,
        data: null,
        msg: err.message,
      });
    }
    res.json({
      code: 200,
      data: rows,
      msg: '',
    });
  });
});

// 新增笔记
app.post('/notes', (req, res) => {
  const { title, content } = req.body;

  // 获取本地时区的当前时间, 时间格式为 xxxx-xx-xx xx:xx:xx
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000; // 偏移量转换为毫秒
  const localISOTime = new Date(date - offset)
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');

  db.run(
    `INSERT INTO notes (title, content, created_at) VALUES (?, ?, ?)`,
    [title, content, localISOTime],
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

module.exports = app;
