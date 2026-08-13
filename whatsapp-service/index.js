const express = require('express');
const cors = require('cors');
const { PORT } = require('./config');
const { checkInitialSession } = require('./services/whatsapp.service');
const whatsappRoutes = require('./routes/whatsapp.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/', whatsappRoutes);

// Auto-restore previous session if credentials exist
checkInitialSession();

// Start Server
app.listen(PORT, () => {
    console.log(`WhatsApp Microservice running on port ${PORT}`);
});