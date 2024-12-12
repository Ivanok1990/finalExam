const express = require('express');
const Participant = require('../models/Participant'); // Asegúrate de que la ruta sea correcta
const Visitor = require('../models/Visitor');
const { Op } = require("sequelize");
const Event = require('../models/Event');

const router = express.Router();

// Ruta para agregar un participante
router.post('/add-participant', async (req, res) => {
    const { visitor_id, event_id, is_organizer } = req.body;

    try {
        // Verificar si el visitor_id y event_id existen
        const visitor = await Visitor.findByPk(visitor_id);
        const event = await Event.findByPk(event_id);

        if (!visitor) {
            return res.status(404).json({ message: 'Visitor not found' });
        }

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Buscar si el visitante ya está registrado en un evento en la misma fecha y horario
        const conflictingEvent = await Participant.findOne({
            where: { visitor_id },
            include: {
                model: Event,
                where: {
                    date: event.date,
                    [Op.or]: [
                        {
                            start_time: {
                                [Op.between]: [event.start_time, event.end_time]
                            }
                        },
                        {
                            end_time: {
                                [Op.between]: [event.start_time, event.end_time]
                            }
                        },
                        {
                            [Op.and]: [
                                { start_time: { [Op.lte]: event.start_time } },
                                { end_time: { [Op.gte]: event.end_time } }
                            ]
                        }
                    ]
                }
            }
        });

        if (conflictingEvent) {
            return res.status(400).json({
                message: 'You cannot register for overlapping events.'
            });
        }

        // Crear el participante
        const participant = await Participant.create({
            visitor_id,
            event_id,
            is_organizer
        });

        return res.status(201).json({
            message: 'Participant successfully added.',
            participant
        });
    } catch (error) {
        console.error('Error creating participant:', error);
        return res.status(500).json({
            message: 'An error occurred while creating the participant.',
            error: error.message
        });
    }
});

router.get('/events/:eventId/participants', async (req, res) => {
    const { eventId } = req.params;

    try {
        const participants = await Participant.findAll({
            where: { event_id: eventId },
            include: [
                {
                    model: Visitor,
                    attributes: ['id', 'name', 'email_address'] // Incluye los datos relevantes del visitante
                }
            ]
        });

        if (!participants || participants.length === 0) {
            return res.status(404).json({ message: 'No participants found for this event.' });
        }

        res.json(participants);
    } catch (error) {
        console.error('Error fetching participants:', error);
        res.status(500).json({ message: 'An error occurred while fetching participants.', error: error.message });
    }
});

module.exports = router;

