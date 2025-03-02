require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PRIVATE_APP_ACCESS = process.env.HUBSPOT_ACCESS_TOKEN;

// Route 1: Display Books
app.get('/', async (req, res) => {
    try {
        const properties = 'book_name,author,publication_year';
        const response = await axios.get(`https://api.hubapi.com/crm/v3/objects/2-25549226?properties=${properties}`, {
            headers: {
                Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
                'Content-Type': 'application/json'
            }
        });
        console.log("Fetched data from HubSpot:", JSON.stringify(response.data, null, 2));
        res.render('homepage', { books: response.data.results });
        
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).send('Error fetching books');
    }
});

// Route 2: Show Form to Add/Edit Books
app.get('/update-cobj', (req, res) => {
    res.render('updates', { title: 'Add/Edit Book' });
});

// Route 3: Handle Form Submission
app.post('/update-cobj', async (req, res) => {
    const { book_name, author, publication_year } = req.body;
    try {
        await axios.post(`https://api.hubapi.com/crm/v3/objects/books`, {
            properties: {
                book_name,
                author,
                publication_year
            }
        }, {
            headers: {
                Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
                'Content-Type': 'application/json'
            }
        });
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to add/update book');
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
