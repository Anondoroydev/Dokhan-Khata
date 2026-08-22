const server = require('../server.js');
const app = server && (server.default || server.app || server);

module.exports = app;
