const bcrypt = require('bcryptjs');

async function generarHashes() {
    console.log('Generando hashes de contraseñas...\n');

    const clientePassword = 'cliente123';
    const agentePassword = 'agente123';

    const hashCliente = await bcrypt.hash(clientePassword, 10);
    const hashAgente = await bcrypt.hash(agentePassword, 10);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('HASHES GENERADOS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('Hash para contraseña "cliente123":');
    console.log(hashCliente);
    console.log('\nHash para contraseña "agente123":');
    console.log(hashAgente);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('Copia estos hashes y reemplázalos en usuarios.json');
}

generarHashes();

