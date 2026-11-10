const net = require('net');
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

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
  const dbUrl = process.env.DATABASE_URL || '';
  const esRemoto = dbUrl && !dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1');

  if (esRemoto) {
    console.log('\x1b[32m✔ [FlowDesk DB]\x1b[0m Usando base de datos remota / Supabase.');
    process.exit(0);
  }

  const isRunning = await checkPort(5432);
  if (isRunning) {
    console.log('\x1b[32m✔ [FlowDesk DB]\x1b[0m PostgreSQL está activo en puerto 5432.');
    process.exit(0);
  }

  console.log('\x1b[33m⚡ [FlowDesk DB]\x1b[0m PostgreSQL no está activo. Iniciando servicio local...');
  
  const pgBin = path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'pgsql', 'bin', 'pg_ctl.exe');
  const pgCmd = fs.existsSync(pgBin) ? pgBin : 'pg_ctl';
  const pgData = path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'pgsql', 'data');
  const pgLog = path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'pgsql', 'logfile.log');

  try {
    const child = spawn(pgCmd, ['start', '-D', pgData, '-l', pgLog], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    });
    child.unref();
  } catch (e) {
    console.error('Error al invocar pg_ctl:', e.message);
  }

  for (let i = 0; i < 25; i++) {
    await new Promise((r) => setTimeout(r, 300));
    if (await checkPort(5432)) {
      console.log('\x1b[32m✔ [FlowDesk DB]\x1b[0m PostgreSQL iniciado correctamente en puerto 5432.');
      process.exit(0);
    }
  }

  console.warn('\x1b[31m✖ [FlowDesk DB]\x1b[0m Advertencia: Verifique la base de datos en puerto 5432.');
  process.exit(0);
}

main();
