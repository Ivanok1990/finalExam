const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('EventManagement', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
});


sequelize.authenticate()
    .then(() => {
        console.log('Connection established successfully.');
    })
    .catch((error) => {
        console.error('Unable to connect to the database:', error);
    });

module.exports = sequelize;
