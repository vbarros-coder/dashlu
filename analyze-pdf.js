const fs = require('fs');
const pdfParse = require('pdf-parse');

const pdfPath = 'C:\\Users\\eduar\\Downloads\\Addvalora Global Loss Adjusters - 01.pdf';

async function analyzePDF() {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    
    console.log('=== ANÁLISE DO PDF ===');
    console.log('Páginas:', data.numpages);
    console.log('Tamanho do texto:', data.text.length);
    
    // Procurar por operações/equipes
    const operacoes = ['Consultoria', 'Fiança', 'Garantia', 'Property', 'RC Geral', 'RC Profissional', 'Engenharia', 'Transportes'];
    console.log('\n=== OPERAÇÕES ENCONTRADAS ===');
    operacoes.forEach(op => {
      const regex = new RegExp(op, 'gi');
      const matches = data.text.match(regex);
      if (matches) {
        console.log(`${op}: ${matches.length} ocorrências`);
      }
    });
    
    // Procurar por reguladores/nomes de equipe
    console.log('\n=== AMOSTRA DO TEXTO (primeiras 3000 chars) ===');
    console.log(data.text.substring(0, 3000));
    
  } catch (err) {
    console.error('Erro:', err.message);
  }
}

analyzePDF();
