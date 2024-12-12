const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');
const Visitor = require('./Visitor'); // Import Visitor model
const Event = require('./Event'); // Import Event model

const Participant = sequelize.define('Participant', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    is_organizer: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    visitor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Visitor,
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    event_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Event,
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    }
}, {
    tableName: 'Participants',
    timestamps: true
});

// Associations
Participant.belongsTo(Visitor, { foreignKey: 'visitor_id' });
Participant.belongsTo(Event, { foreignKey: 'event_id' });

Visitor.hasMany(Participant, { foreignKey: 'visitor_id' });
Event.hasMany(Participant, { foreignKey: 'event_id' });

module.exports = Participant;