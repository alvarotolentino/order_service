const apiRoute = require('./v1');

function init(server) {
  server.use('/api', apiRoute);
}

module.exports = {
  init: init,
};
