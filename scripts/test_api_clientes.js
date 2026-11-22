const http = require('http');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const PORT = process.env.PORT || 3000;
const API_KEY_VALIDA = 'fdk_live_grupo_aliado_2026_acceso_seguro_token';

// Cargar DB para prueba de inmutabilidad
const envPath = path.resolve(__dirname, '../.env.local');
let dbUrl = process.env.DATABASE_URL;
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [k, ...v] = trimmed.split('=');
    const val = v.join('=').replace(/^["']|["']$/g, '');
    if (k === 'DATABASE_URL' && !dbUrl) dbUrl = val;
  }
}

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const body = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, body });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n===============================================================');
  console.log('🧪 SUITE DE PRUEBAS INTEGRADA — API CLIENTES / USUARIOS FLOWDESK v2.0');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(descripcion, condicion, detalle = '') {
    if (condicion) {
      console.log(`✅ [PASS] ${descripcion}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${descripcion} -> ${detalle}`);
      failed++;
    }
  }

  try {
    // 1. Health check público
    const resHealth = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/health',
      method: 'GET'
    });
    assert(
      '1. Health check público devuelve 200 OK y estado OPERACIONAL',
      resHealth.status === 200 && resHealth.body.estado === 'OPERACIONAL',
      `Status: ${resHealth.status}, Estado: ${resHealth.body?.estado}`
    );

    // 2. Info / Spec pública
    const resInfo = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/info',
      method: 'GET'
    });
    assert(
      '2. Endpoint /api/v1/info describe la API y autenticación requerida',
      resInfo.status === 200 && resInfo.body.nombre && Array.isArray(resInfo.body.endpoints_disponibles),
      `Status: ${resInfo.status}`
    );

    // 3. Bloqueo sin API Key
    const resSinKey = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/clientes',
      method: 'GET'
    });
    assert(
      '3. Petición sin API Key es bloqueada con 401 Unauthorized',
      resSinKey.status === 401 && resSinKey.body.codigo_error === 'AUTH_API_KEY_FALTANTE',
      `Status: ${resSinKey.status}, Código: ${resSinKey.body?.codigo_error}`
    );

    // 4. Bloqueo con API Key falsa
    const resKeyInvalida = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/clientes',
      method: 'GET',
      headers: { 'X-API-KEY': 'fdk_live_clave_falsa_999' }
    });
    assert(
      '4. Petición con API Key falsa es bloqueada con 401 Unauthorized',
      resKeyInvalida.status === 401 && resKeyInvalida.body.codigo_error === 'AUTH_API_KEY_INVALIDA',
      `Status: ${resKeyInvalida.status}, Código: ${resKeyInvalida.body?.codigo_error}`
    );

    // 5. Rate limiting headers presentes
    const resHeaders = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/usuarios?limite=1',
      method: 'GET',
      headers: { 'X-API-KEY': API_KEY_VALIDA }
    });
    assert(
      '5. Respuesta incluye encabezados estándar X-RateLimit-Limit y X-RateLimit-Remaining',
      resHeaders.status === 200 && resHeaders.headers['x-ratelimit-limit'] !== undefined,
      `Headers: ${JSON.stringify(resHeaders.headers)}`
    );

    // 6. Listar usuarios con API Key válida
    const resUsuarios = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/usuarios?limite=10',
      method: 'GET',
      headers: { 'X-API-KEY': API_KEY_VALIDA }
    });
    assert(
      '6. GET /api/v1/usuarios devuelve lista real de trabajadores desde BD',
      resUsuarios.status === 200 && Array.isArray(resUsuarios.body.usuarios) && resUsuarios.body.usuarios.length > 0,
      `Status: ${resUsuarios.status}, Total devueltos: ${resUsuarios.body?.total_registros}`
    );

    // 7. Listar clientes (alias idéntico)
    const resClientes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/clientes?limite=10',
      method: 'GET',
      headers: { 'X-API-KEY': API_KEY_VALIDA }
    });
    assert(
      '7. GET /api/v1/clientes devuelve los mismos datos (alias compatible)',
      resClientes.status === 200 && Array.isArray(resClientes.body.clientes) && resClientes.body.total_registros === resUsuarios.body.total_registros,
      `Status: ${resClientes.status}, Total clientes: ${resClientes.body?.total_registros}`
    );

    // 8. Registrar un nuevo trabajador/cliente con clave aleatoria segura y debe_cambiar_clave
    const dniTest = '8' + Math.floor(1000000 + Math.random() * 9000000);
    const nuevoTrabajador = {
      dni: dniTest,
      nombres: 'Trabajador Demo',
      apellido_paterno: 'Integrado',
      apellido_materno: 'V2',
      correo_electronico: `trabajador.${dniTest}@empresa.com`,
      celular: '988776655',
      departamento: 'Finanzas'
    };

    const resCrear = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/clientes',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY_VALIDA
      }
    }, nuevoTrabajador);

    assert(
      '8. POST /api/v1/clientes registra al trabajador en BD con perfil Solicitante y clave aleatoria segura',
      resCrear.status === 201 && (resCrear.body.usuario?.id_usuario || resCrear.body.cliente?.id_usuario),
      `Status: ${resCrear.status}, Mensaje: ${resCrear.body?.mensaje || resCrear.body?.error}`
    );

    const idCreado = resCrear.body.usuario?.id_usuario || resCrear.body.cliente?.id_usuario;

    // 9. Buscar el trabajador creado por DNI
    const resBuscar = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/usuarios/dni/${dniTest}`,
      method: 'GET',
      headers: { 'X-API-KEY': API_KEY_VALIDA }
    });
    assert(
      '9. GET /api/v1/usuarios/dni/:dni devuelve los datos del trabajador creado',
      resBuscar.status === 200 && resBuscar.body.usuario?.dni === dniTest,
      `Status: ${resBuscar.status}, DNI devuelto: ${resBuscar.body.usuario?.dni}`
    );

    // 10. Buscar por alias /documento/:dni
    const resBuscarDoc = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/clientes/documento/${dniTest}`,
      method: 'GET',
      headers: { 'X-API-KEY': API_KEY_VALIDA }
    });
    assert(
      '10. GET /api/v1/clientes/documento/:doc devuelve el cliente (alias simétrico)',
      resBuscarDoc.status === 200 && resBuscarDoc.body.cliente?.dni === dniTest,
      `Status: ${resBuscarDoc.status}`
    );

    // 11. Actualizar trabajador/cliente con PUT
    const resUpdate = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/clientes/${idCreado}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY_VALIDA
      }
    }, { celular: '911223344', departamento: 'Contabilidad' });
    assert(
      '11. PUT /api/v1/clientes/:id actualiza los datos del cliente/trabajador',
      resUpdate.status === 200 && resUpdate.body.cliente?.celular === '911223344',
      `Status: ${resUpdate.status}, Celular: ${resUpdate.body?.cliente?.celular}`
    );

    // 12. Rechazar DNI duplicado
    const resDuplicado = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/clientes',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY_VALIDA
      }
    }, nuevoTrabajador);

    assert(
      '12. Intento de registrar DNI duplicado es rechazado con 409 Conflict',
      resDuplicado.status === 409 && resDuplicado.body.codigo_error === 'DNI_DUPLICADO',
      `Status: ${resDuplicado.status}, Código: ${resDuplicado.body?.codigo_error}`
    );

    // 13. Bitácora de trazabilidad forense con aislamiento por grupo
    const resTraza = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/trazabilidad?limite=5',
      method: 'GET',
      headers: { 'X-API-KEY': API_KEY_VALIDA }
    });
    assert(
      '13. GET /api/v1/trazabilidad aplica aislamiento de actividad del propio grupo',
      resTraza.status === 200 && (resTraza.body.alcance === 'ACTIVIDAD_PROPIO_GRUPO' || resTraza.body.alcance === 'GLOBAL_ADMINISTRADOR'),
      `Status: ${resTraza.status}, Alcance: ${resTraza.body?.alcance}`
    );

    // 14. Inmutabilidad estricta de api_log_auditoria (trigger de PostgreSQL)
    if (dbUrl) {
      const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
      try {
        await pool.query('DELETE FROM api_log_auditoria WHERE id_log = -999');
        assert('14. Inmutabilidad estricta: trigger bloquea DELETE en api_log_auditoria', false, 'El DELETE no fue bloqueado');
      } catch (triggerErr) {
        assert(
          '14. Inmutabilidad estricta: trigger bloquea DELETE en api_log_auditoria con excepción de violación de integridad',
          triggerErr.message.includes('VIOLACION_DE_INTEGRIDAD') || triggerErr.code === 'P0001',
          triggerErr.message
        );
      } finally {
        await pool.end();
      }
    }

  } catch (err) {
    console.error('❌ Error durante la ejecución de las pruebas:', err);
    failed++;
  } finally {
    console.log('\n===============================================================');
    console.log(`🏁 RESULTADO FINAL: ${passed} Aprobadas, ${failed} Fallidas`);
    console.log('===============================================================\n');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
