const net = require('net');
const { exec } = require('child_process');
const path = require('path');
const os = require('os');

function checkPort(port, host = '127.0.0.1', timeout = 800) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function main() {
  const isRunning = await checkPort(5432);
  if (isRunning) {
    console.log('\x1b[32m✔ [FlowDesk DB]\x1b[0m PostgreSQL está activo en puerto 5432.');
    process.exit(0);
  }

  console.log('\x1b[33m⚡ [FlowDesk DB]\x1b[0m PostgreSQL no está activo. Iniciando servicio local...');
  
  const pgData = path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'pgsql', 'data');
  const pgLog = path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'pgsql', 'logfile.log');

  exec(`pg_ctl start -D "${pgData}" -l "${pgLog}"`, async (err) => {
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 300));
      if (await checkPort(5432)) {
        console.log('\x1b[32m✔ [FlowDesk DB]\x1b[0m PostgreSQL iniciado correctamente en puerto 5432.');
        process.exit(0);
      }
    }
    console.warn('\x1b[31m✖ [FlowDesk DB]\x1b[0m Advertencia: Verifique la base de datos en puerto 5432.');
    process.exit(0);
  });
}

main();
