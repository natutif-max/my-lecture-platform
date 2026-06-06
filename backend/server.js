const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const LECTURES_DIR = path.join(__dirname, 'lectures');
if (!fs.existsSync(LECTURES_DIR)) {
    fs.mkdirSync(LECTURES_DIR);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, LECTURES_DIR),
    filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

app.get('/api/lectures', (req, res) => {
    fs.readdir(LECTURES_DIR, (err, files) => {
        if (err) return res.status(500).json({ error: 'Ошибка чтения папки' });
        const htmlFiles = files.filter(f => f.endsWith('.html'));
        res.json(htmlFiles);
    });
});

app.get('/api/lecture/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(LECTURES_DIR, filename);
    if (!fs.existsSync(filepath)) return res.status(404).json({ error: 'Файл не найден' });
    res.sendFile(filepath);
});

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });
    res.json({ message: 'Лекция добавлена', filename: req.file.originalname });
});

app.delete('/api/lecture/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(LECTURES_DIR, filename);
    if (!fs.existsSync(filepath)) return res.status(404).json({ error: 'Файл не найден' });
    fs.unlinkSync(filepath);
    res.json({ message: 'Лекция удалена' });
});

app.put('/api/lecture/:filename', express.text(), (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(LECTURES_DIR, filename);
    if (!fs.existsSync(filepath)) return res.status(404).json({ error: 'Файл не найден' });
    fs.writeFileSync(filepath, req.body);
    res.json({ message: 'Лекция обновлена' });
});

app.listen(PORT, () => {
    console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
});