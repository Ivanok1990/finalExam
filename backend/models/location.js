const { DataTypes } = require("sequelize");
const sequelize = require("../db/database"); // Conexión a la base de datos

const Location = sequelize.define("Location", {
    room_id: {
        type: DataTypes.STRING,
        primaryKey: true, // Clave primaria
        allowNull: false,
        unique: true,
    },
    setting: {
        type: DataTypes.ENUM("virtual", "on-ground"), // Virtual o presencial
        allowNull: false,
    },
    space_limit: {
        type: DataTypes.INTEGER, // Límite de capacidad
        allowNull: false,
    },
}, {
    tableName: "Locations", // Nombre explícito de la tabla
    timestamps: true, // Incluye campos createdAt y updatedAt
});

module.exports = Location;
