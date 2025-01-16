const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 40000;


app.use(bodyParser.json());


app.use(express.static(__dirname))
server = app.listen(4444, () => {
    console.log('server activated !')
})

app.post('/save-annotations', (req, res) => {
  const annotations = req.body.annotations;

  // Generate a unique filename for the annotations
  const filePath = path.join(__dirname, 'annotations', `annotations_${Date.now()}.json`);

  // Write annotations to a JSON file
  fs.writeFile(filePath, JSON.stringify(annotations, null, 2), (err) => {
    if (err) {
      console.error('Error saving annotations:', err);
      res.status(500).json({ message: 'Error al guardar las anotaciones' });
    } else {
      res.json({ message: 'Anotaciones guardadas correctamente', filePath });
    }
  });
})

// Start the server