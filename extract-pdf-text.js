const fs = require('fs');
const path = require('path');

// Usar pdf-parse que já está instalado
const pdfParse = require('pdf-parse');

const pdfPath = process.argv[2] || 'C:\\Users\\eduar\\Downloads\\Addvalora Global Loss Adjusters - 01.pdf';

async function extractText() {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    
    console.log('=== INFORMAÇÕES DO PDF ===');
    console.log('Páginas:', data.numpages);
    console.log('Tamanho do texto:', data.text.length);
    console.log('\n=== PRIMEIRAS 2000 POSIÇÕES ===');
    console.log(data.text.substring(0, 2000));
    console.log('\n=== POSIÇÕES 2000-4000 ===');
    console.log(data.text.substring(2000, 4000));
    console.log('\n=== POSIÇÕES 4000-6000 ===');
    console.log(data.text.substring(4000, 6000));
    
    // Salvar em arquivo para análise
    const outputPath = path.join(__dirname, 'pdf-extracted-text.txt');
    fs.writeFileSync(outputPath, data.text);
    console.log('\n=== TEXTO COMPLETO SALVO EM ===');
    console.log(outputPath);
  } catch (err) {
    console.error('Erro:', err.message);
  }
}

extractText();
