const { DataTypes } = require("sequelize");
const sequelize = require("../db/database"); // Conexión a la base de datos
const Location = require("./Location"); // Importar modelo Location

const Event = sequelize.define("Event", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Clave primaria
        autoIncrement: true, // Autoincremento
    },
    topic: {
        type: DataTypes.STRING, // Título del evento
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT, // Descripción
        allowNull: false,
    },
    date: {
        type: DataTypes.DATEONLY, // Fecha (YYYY-MM-DD)
        allowNull: false,
    },
    start_time: {
        type: DataTypes.TIME, // Hora de inicio (HH:MM:SS)
        allowNull: false,
    },
    end_time: {
        type: DataTypes.TIME, // Hora de finalización (HH:MM:SS)
        allowNull: false,
    },
}, {
    tableName: "Events", // Nombre explícito de la tabla
    timestamps: true, // Incluye campos createdAt y updatedAt
});

// Relación con Location
Event.belongsTo(Location, { foreignKey: "location_id" }); // Clave foránea en Event
Location.hasMany(Event, { foreignKey: "location_id" }); // Una Location puede tener varios Events

module.exports = Event;
