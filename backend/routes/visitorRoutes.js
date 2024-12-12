const express = require('express');
const Visitor = require('../models/Visitor'); // Asegúrate de que esta ruta sea correcta
const Participant = require('../models/Participant');
const router = express.Router();

// Ruta para crear un visitante
router.post('/visitors', async (req, res) => {
    const { name, email, phone, national_id, country, city } = req.body;

    try {
        // Crear un nuevo visitante con valores generados automáticamente para ID y tiempos
        const visitor = await Visitor.create({
            name,
            email_address: email, // Asegurarse de que el campo coincida con el modelo
            phone_number: phone, // Asegurarse de que el campo coincida con el modelo
            national_id,
            country,
            city,
            arrival_time: new Date(), // Asignar tiempo de llegada actual automáticamente
            departure_time: new Date(new Date().getTime() + 3600000) // Generar automáticamente la salida después de una hora
        });

        return res.status(201).json({
            message: 'Visitor created successfully',
            visitor
        });
    } catch (error) {
        console.error('Error creating visitor:', error);
        return res.status(500).json({
            message: 'An error occurred while creating the visitor',
            error: error.message
        });
    }
});

// Ruta para verificar el correo del visitante
router.post('/visitors/check-email', async (req, res) => {
    const { email } = req.body;

    try {
        const visitor = await Visitor.findOne({ where: { email_address: email } });

        if (!visitor) {
            return res.status(404).json({
                message: 'Email not found'
            });
        }

        return res.status(200).json({
            message: 'Email verified successfully',
            visitor
        });
    } catch (error) {
        console.error('Error verifying email:', error);
        return res.status(500).json({
            message: 'An error occurred while verifying the email',
            error: error.message
        });
    }
});

router.get('/visitors/:visitorId/subscriptions', async (req, res) => {
    const { visitorId } = req.params;
    try {
        const subscriptions = await Participant.findAll({
            where: { visitor_id: visitorId },
            include: Event
        });
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las suscripciones' });
    }
});


// Ruta para obtener un visitante por correo electrónico (nombre de ruta cambiado)
router.get('/visitors-by-email', async (req, res) => {
    const { email } = req.query;

    try {
        const visitor = await Visitor.findOne({ where: { email_address: email } });

        if (!visitor) {
            return res.status(404).json({ message: 'Visitor not found' });
        }

        return res.status(200).json(visitor);
    } catch (error) {
        console.error('Error fetching visitor by email:', error);
        return res.status(500).json({ message: 'An error occurred while fetching the visitor', error: error.message });
    }
});



module.exports = router;
