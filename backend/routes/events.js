const express = require("express");
const Event = require("../models/Event");
const Location = require("../models/Location");
const Participant = require("../models/Participant");
const Visitor = require("../models/Visitor");
const { Op } = require("sequelize");
const router = express.Router();

// Obtener todos los eventos
router.get("/", async (req, res) => {
    try {
        const events = await Event.findAll({ include: Location });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los eventos" });
    }
});

// Obtener ubicaciones
router.get("/locations", async (req, res) => {
    try {
        const locations = await Location.findAll(); // Extraer todas las ubicaciones
        res.json(locations); // Enviar las ubicaciones como JSON
    } catch (error) {
        console.error("Error al obtener ubicaciones:", error);
        res.status(500).json({ error: "Error al obtener ubicaciones." });
    }
});

// Obtener los participantes de un evento
router.get("/events/:eventId/participants", async (req, res) => {
    const { eventId } = req.params;

    try {
        // Buscar participantes del evento
        const participants = await Participant.findAll({
            where: { event_id: eventId },
            include: [
                {
                    model: Visitor,
                    attributes: ["id", "name", "email_address"] // Devuelve información relevante del visitante
                }
            ]
        });

        if (!participants || participants.length === 0) {
            return res.status(404).json({ message: "No participants found for this event." });
        }

        res.json(participants);
    } catch (error) {
        console.error("Error fetching participants:", error);
        res.status(500).json({ message: "An error occurred while fetching participants.", error: error.message });
    }
});

// Crear un nuevo evento
router.post("/", async (req, res) => {
    const { topic, description, location_id, date, start_time, end_time, organizer_email } = req.body;

    try {
        // Validar que el correo del organizador exista
        const organizer = await Visitor.findOne({ where: { email_address: organizer_email } });

        if (!organizer) {
            return res.status(404).json({ message: "Organizer email not found" });
        }

        // Buscar si ya existe un evento en la misma ubicación y horario
        const conflictingEvent = await Event.findOne({
            where: {
                location_id: location_id,
                date: date,
                [Op.or]: [
                    {
                        start_time: {
                            [Op.between]: [start_time, end_time],
                        },
                    },
                    {
                        end_time: {
                            [Op.between]: [start_time, end_time],
                        },
                    },
                    {
                        [Op.and]: [
                            { start_time: { [Op.lte]: start_time } },
                            { end_time: { [Op.gte]: end_time } },
                        ],
                    },
                ],
            },
        });

        if (conflictingEvent) {
            return res.status(400).json({
                error: "Ya existe un evento en este lugar y horario.",
            });
        }

        // Crear el nuevo evento si no hay conflictos
        const newEvent = await Event.create({
            topic,
            description,
            location_id,
            date,
            start_time,
            end_time,
        });

        // Crear al organizador como participante del evento
        await Participant.create({
            visitor_id: organizer.id,
            event_id: newEvent.id,
            is_organizer: true,
        });

        // Emitir eventos actualizados
        const events = await Event.findAll({ include: Location });
        req.app.get("io").emit("eventUpdate", events);

        res.status(201).json(newEvent);
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ error: "Error al crear el evento." });
    }
});

module.exports = router;
