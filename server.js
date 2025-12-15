const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// N8N Proxy
app.post('/api/n8n-chat', async (req, res) => {
  try {
    console.log('📨 Запрос в n8n:', req.body);
    
    const response = await fetch('https://kolipiai.app.n8n.cloud/webhook/a124fd29-1d36-45a8-9fa8-c730967ac9c6/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    console.log('✅ Ответ n8n:', data);
    
    res.json(data);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Сервер запущен: http://0.0.0.0:${PORT}`);
});
