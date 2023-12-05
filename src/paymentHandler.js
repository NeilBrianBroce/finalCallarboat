const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 5500;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Enable CORS for all routes
app.use(cors());

app.post('/submit-form', async (req, res) => {
    try {
        const { company_name, subsciptPlan, subsciptFee, paymentMethodSelect } = req.body;

        // Prepare data for Paymongo API
        const paymongoData = {
            app_key: process.env.PAYMONGO_APP_KEY || 'your_default_app_key',
            secret_key: process.env.PAYMONGO_SECRET_KEY || 'your_default_secret_key',
            password: process.env.PAYMONGO_PASSWORD || 'your_default_password',
            data: {
                attributes: {
                    livemode: false,
                    type: 'gcash',
                    amount: parseInt(subsciptFee),
                    currency: 'PHP',
                    // ... add other attributes as needed
                },
            },
        };

        const response = await axios.post('https://api4wrd-v1.kpa.ph/paymongo/v1/create', paymongoData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const resData = response.data;

        if (resData.status === 200) {
            res.json({ success: true, message: 'Form submitted successfully!' });
        } else {
            res.status(500).json({ success: false, error: response.data });
        }
    } catch (error) {
        console.error('Error processing form submission:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
