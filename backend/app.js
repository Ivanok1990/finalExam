const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const sequelize = require("./db/database"); // Importar conexión a la base de datos
const Location = require("./models/Location"); // Importar modelos
const Visitor = require("./models/Visitor");
const Event = require("./models/Event");
const Participant = require("./models/Participant");
const eventRoutes = require("./routes/events");
const participantRoutes = require('./routes/participantRoutes');
const visitorRoutes = require('./routes/visitorRoutes');

const app = express();
const PORT = 5000;

// Crear servidor HTTP y WebSocket
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
    },
});

// Middleware
app.use(cors());
app.use(express.json());

// Probar la conexión a la base de datos y sincronizar modelos
(async () => {
    try {
        await sequelize.authenticate();
        console.log("Conexión a la base de datos establecida exitosamente.");

        // Sincronizar los modelos con la base de datos
        await sequelize.sync({ alter: true }); // Usa `force: true` solo para desarrollo, esto elimina y crea las tablas
        console.log("Modelos sincronizados con la base de datos.");
    } catch (error) {
        console.error("Error al conectar o sincronizar la base de datos:", error);
    }
})();

//rutas del backend
app.use("/events", eventRoutes);
app.use('/api', participantRoutes);
app.use('/api', visitorRoutes);

// Rutas básicas para verificar la API
app.get("/", (req, res) => {
    res.send("Servidor funcionando correctamente.");
});


app.set("io", io);
// Manejar conexiones WebSocket
io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.id);

    socket.on("disconnect", () => {
        console.log("Usuario desconectado:", socket.id);
    });
});


// Emitir actualizaciones en tiempo real
app.post("/events", async (req, res) => {
    const { topic, description, location_id, date, start_time, end_time } = req.body;
    try {
        const newEvent = await Event.create({
            topic,
            description,
            location_id,
            date,
            start_time,
            end_time,
        });

        // Obtener eventos actualizados
        const events = await Event.findAll();
        io.emit("eventUpdate", events); // Enviar actualizaciones en tiempo real a todos los clientes

        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ error: "Error al crear el evento" });
    }
});




// Iniciar el servidor HTTP y WebSocket
httpServer.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});




















