const express = require('express');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/takeuserinput.html');
});

app.get('/about-us', (req, res) => {
    res.send('Hello World');
});

app.post('/submit', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    res.send(`Hello ${name} ${email}`);
});

// New API endpoint that takes name and returns with Hello World
app.post('/api/greet', (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    res.json({ message: `Hello World ${name}` });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});