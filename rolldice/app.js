/*app.js*/
const express = require("express");
const { logs } = require('@opentelemetry/api-logs');

// Create a logger
const logger = logs.getLogger('default');

const PORT = parseInt(process.env.PORT || "80");
const app = express();

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

app.get('/rolldice', (req, res) => {
  const result = getRandomNumber(1, 6);
  logger.emit({
    severity: 'INFO',
    message: `Rolled a dice and got: ${result}`,
    attributes: {
      'dice.result': result,
    },
  });
  res.send(result.toString());
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});