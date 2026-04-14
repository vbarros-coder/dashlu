const fs = require('fs');
const { PDFParse } = require('pdf-parse');

const filePath = process.argv[2] || 'C:\\Users\\eduar\\Downloads\\Addvalora Global Loss Adjusters - 01.pdf';

const dataBuffer = fs.readFileSync(filePath);

new PDFParse(dataBuffer).then(function(data) {
  console.log('=== TEXTO EXTRAÍDO DO PDF ===');
  console.log('Número de páginas:', data.numpages);
  console.log('\n=== PRIMEIROS 5000 CARACTERES ===');
  console.log(data.text.substring(0, 5000));
  console.log('\n=== TOTAL DE CARACTERES ===');
  console.log(data.text.length);
});
