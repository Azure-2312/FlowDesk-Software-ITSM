const fs = require('fs');
const { Pool } = require('../node_modules/pg');

const env = fs.readFileSync('.env.local', 'utf8');
let dbUrl = '';
for (const line of env.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.split('=')[1].replace(/"/g, '').trim();
  }
}

const pool = new Pool({ connectionString: dbUrl });

// Leer el catálogo canónico de servicios
const doc = fs.readFileSync('DOCUMENTACIÓN/CATALOGO_SERVICIOS_DATOS.md', 'utf8');
const jsonMatch = doc.match(/```json\s*([\s\S]*?)\s*```/);
if (!jsonMatch) {
  console.error('No se encontró el bloque JSON en el markdown');
  process.exit(1);
}

const candidatos = JSON.parse(jsonMatch[1]);

// Normalizador
function normalizar(txt) {
  return (txt || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  const client = await pool.connect();

  try {
    console.log('Iniciando transacción para carga de servicios...');
    await client.query('BEGIN');

    // 1. Obtener categorías
    const resCats = await client.query(`
      SELECT id_categoria, id_tipo_ticket, nombre, codigo_corto, sla_default_respuesta, sla_default_resolucion
      FROM categoria_ticket
      WHERE estado_registro = true
    `);
    const categorias = resCats.rows;

    // 2. Obtener servicios existentes
    const resServs = await client.query(`
      SELECT s.id_servicio, s.codigo_servicio, s.id_tipo_ticket, s.id_categoria, c.nombre as categoria_nombre, s.nombre
      FROM servicio_catalogo s
      LEFT JOIN categoria_ticket c ON s.id_categoria = c.id_categoria
      WHERE s.estado_registro = true
    `);
    const existentes = resServs.rows;

    const excluidos = [];
    const aInsertar = [];

    for (let i = 0; i < candidatos.length; i++) {
      const c = candidatos[i];
      const tipoNum = c.tipo_itil.toLowerCase().includes('incidente') ? 1 : 2;

      // Buscar categoría
      const cat = categorias.find(cat => 
        cat.id_tipo_ticket === tipoNum && 
        normalizar(cat.nombre) === normalizar(c.categoria_funcional)
      );

      if (!cat) {
        throw new Error(`Categoría "${c.categoria_funcional}" (Tipo ${tipoNum}) no encontrada.`);
      }

      const normNombreCand = normalizar(c.nombre);

      let matchSimilar = null;
      let motivo = '';

      for (const ex of existentes) {
        if (ex.id_tipo_ticket !== tipoNum) continue;

        const normNombreEx = normalizar(ex.nombre);

        if (normNombreCand === normNombreEx) {
          matchSimilar = ex;
          motivo = 'Nombre idéntico';
          break;
        }

        // Casos de similitud funcional directa
        if (normNombreCand.includes('buzon') && normNombreCand.includes('compartido') && normNombreEx.includes('buzon') && normNombreEx.includes('compartido')) {
          matchSimilar = ex;
          motivo = 'Mismo servicio de buzones compartidos ya cubierto';
          break;
        }

        if ((normNombreCand.includes('linea movil') || normNombreCand.includes('telefonia movil')) && (normNombreEx.includes('telefonia movil') || normNombreEx.includes('linea movil'))) {
          matchSimilar = ex;
          motivo = 'Mismo servicio de telefonía móvil / línea corporativa';
          break;
        }

        if (normNombreCand.includes('software especializado') && normNombreEx.includes('software especializado')) {
          matchSimilar = ex;
          motivo = 'Mismo servicio de instalación de software especializado con licencia';
          break;
        }
      }

      if (matchSimilar) {
        excluidos.push({
          num: i + 1,
          candidato: c.nombre,
          categoria: c.categoria_funcional,
          tipo: c.tipo_itil,
          existente: `[${matchSimilar.codigo_servicio}] ${matchSimilar.nombre} (${matchSimilar.categoria_nombre})`,
          motivo
        });
      } else {
        aInsertar.push({
          num: i + 1,
          ...c,
          id_tipo_ticket: tipoNum,
          id_categoria: cat.id_categoria,
          codigo_corto: cat.codigo_corto
        });
      }
    }

    console.log(`Candidatos evaluados: ${candidatos.length}`);
    console.log(`Excluidos por similitud: ${excluidos.length}`);
    console.log(`Aprobados para inserción: ${aInsertar.length}`);

    const insertados = [];

    // Mapeo de iconos temáticos acordes a la categoría
    const mapaIconos = {
      CLD: "cloud",
      MAIL: "correo",
      TEL: "telefono",
      PRN: "impresora",
      SEC: "seguridad",
      CAP: "capacitacion",
      BKP: "backup",
      HW: "hardware",
      SW: "software",
      INF: "servidor",
      DB: "base_datos",
      ACC: "usuario",
      RED: "red"
    };

    for (const item of aInsertar) {
      // Validaciones previas
      if (!item.nombre || item.nombre.trim().length === 0 || item.nombre.length > 120) {
        throw new Error(`Nombre inválido en candidato #${item.num}: ${item.nombre}`);
      }
      if (item.sla_resolucion_horas < item.sla_primera_respuesta_horas) {
        throw new Error(`SLA inconsistente en #${item.num}: resolución < respuesta`);
      }
      if (item.id_tipo_ticket === 1) {
        // En incidentes: requiere_aprobacion = false y costo = 0
        item.requiere_aprobacion = false;
        item.costo_referencial = 0.0;
      }

      // Obtener el siguiente correlativo para la categoría
      const resCorrelativo = await client.query(`
        SELECT COALESCE(MAX(substring(codigo_servicio from '([0-9]+)$')::int), 0) + 1 AS siguiente
        FROM servicio_catalogo
        WHERE id_tipo_ticket = $1 AND id_categoria = $2 AND codigo_servicio ~ '[0-9]+$'
      `, [item.id_tipo_ticket, item.id_categoria]);

      const siguienteNum = resCorrelativo.rows[0].siguiente;
      const prefijo = item.id_tipo_ticket === 1 ? 'INC' : 'SOL';
      const codigoGenerado = `SRV-${prefijo}-${item.codigo_corto}-${String(siguienteNum).padStart(3, '0')}`;
      const iconoServicio = mapaIconos[item.codigo_corto] || 'servicio';

      // Insertar en servicio_catalogo
      const resInsert = await client.query(`
        INSERT INTO servicio_catalogo (
          codigo_servicio,
          id_tipo_ticket,
          id_categoria,
          nombre,
          descripcion_comercial,
          entregable,
          requiere_aprobacion,
          sla_horas_resolucion,
          sla_horas_respuesta,
          costo_referencial,
          icono,
          estado_registro,
          esquema_formulario,
          id_departamento_resolutor,
          reglas_escalamiento,
          es_critico
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, '[]'::jsonb, null, '[]'::jsonb, false
        )
        RETURNING id_servicio, codigo_servicio, nombre, id_tipo_ticket, id_categoria
      `, [
        codigoGenerado,
        item.id_tipo_ticket,
        item.id_categoria,
        item.nombre.trim(),
        item.descripcion_comercial.trim(),
        item.entregable_oficial.trim(),
        Boolean(item.requiere_aprobacion),
        item.sla_resolucion_horas,
        item.sla_primera_respuesta_horas,
        Number(item.costo_referencial || 0),
        iconoServicio
      ]);

      const nuevoServicio = resInsert.rows[0];

      // Insertar perfiles habilitados por defecto [2, 3, 4, 5, 8]
      const perfilesDefault = [2, 3, 4, 5, 8];
      for (const idPerfil of perfilesDefault) {
        await client.query(`
          INSERT INTO servicio_catalogo_perfiles (id_servicio, id_perfil)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [nuevoServicio.id_servicio, idPerfil]);
      }

      // Insertar pasos de workflow por defecto
      let ordenPaso = 1;
      await client.query(`
        INSERT INTO servicio_workflow_paso (
          id_servicio, orden, codigo_paso, nombre_paso, rol_ejecutor, es_compuerta_aprobacion, pausa_sla, estado_registro
        ) VALUES ($1, $2, 'SOLICITADO', 'Registro de solicitud o reporte con detalle', 'SOLICITANTE', false, false, true)
      `, [nuevoServicio.id_servicio, ordenPaso++]);

      if (item.requiere_aprobacion) {
        await client.query(`
          INSERT INTO servicio_workflow_paso (
            id_servicio, orden, codigo_paso, nombre_paso, rol_ejecutor, es_compuerta_aprobacion, pausa_sla, estado_registro
          ) VALUES ($1, $2, 'PENDIENTE_APROBACION', 'Aprobación formal de Jefatura de Área', 'JEFE_APROBADOR', true, true, true)
        `, [nuevoServicio.id_servicio, ordenPaso++]);
      }

      await client.query(`
        INSERT INTO servicio_workflow_paso (
          id_servicio, orden, codigo_paso, nombre_paso, rol_ejecutor, es_compuerta_aprobacion, pausa_sla, estado_registro
        ) VALUES ($1, $2, 'ATENCION_TECNICA', 'Diagnóstico y ejecución técnica del servicio', 'SOPORTE_N2', false, false, true)
      `, [nuevoServicio.id_servicio, ordenPaso++]);

      await client.query(`
        INSERT INTO servicio_workflow_paso (
          id_servicio, orden, codigo_paso, nombre_paso, rol_ejecutor, es_compuerta_aprobacion, pausa_sla, estado_registro
        ) VALUES ($1, $2, 'VERIFICACION_ENTREGA', 'Confirmación de conformidad por el usuario', 'SOLICITANTE', false, false, true)
      `, [nuevoServicio.id_servicio, ordenPaso++]);

      insertados.push({
        codigo: nuevoServicio.codigo_servicio,
        nombre: nuevoServicio.nombre,
        tipo: item.tipo_itil,
        categoria: item.categoria_funcional,
        sla_resp: item.sla_primera_respuesta_horas,
        sla_reso: item.sla_resolucion_horas,
        costo: item.costo_referencial,
        aprobacion: item.requiere_aprobacion ? 'Sí' : 'No'
      });
    }

    // Registrar en log de auditoría
    await client.query(`
      INSERT INTO log_auditoria_sistema (
        id_usuario, modulo, accion, descripcion, detalles, direccion_ip
      ) VALUES (
        1, 'CATALOGO_SERVICIOS', 'CARGA_MASIVA',
        $1, $2, '127.0.0.1'
      )
    `, [
      `Carga masiva de ${insertados.length} nuevos servicios en el catálogo ITIL v4 (excluidos 3 duplicados).`,
      JSON.stringify({ total_insertados: insertados.length, total_excluidos: excluidos.length })
    ]);

    await client.query('COMMIT');
    console.log('TRANSACCIÓN COMPLETADA EXITOSAMENTE (COMMIT).');

    // 4. Conteo final de servicios por categoría
    const conteoFinal = await client.query(`
      SELECT 
        tt.nombre as tipo_nombre,
        COALESCE(ct.nombre, 'Sin categoría') as categoria_nombre,
        COUNT(sc.id_servicio) as total_servicios
      FROM servicio_catalogo sc
      JOIN tipo_ticket tt ON sc.id_tipo_ticket = tt.id_tipo_ticket
      LEFT JOIN categoria_ticket ct ON sc.id_categoria = ct.id_categoria
      WHERE sc.estado_registro = true
      GROUP BY tt.nombre, ct.nombre, tt.id_tipo_ticket, ct.orden, ct.id_categoria
      ORDER BY tt.id_tipo_ticket, ct.orden NULLS LAST, ct.nombre
    `);

    console.log('\n========================================');
    console.log(`CONTEO FINAL DE SERVICIOS POR CATEGORÍA`);
    console.log(`========================================`);
    conteoFinal.rows.forEach(r => {
      console.log(`[${r.tipo_nombre}] ${r.categoria_nombre}: ${r.total_servicios} servicio(s)`);
    });

    console.log('\n========================================');
    console.log(`DETALLE DE SERVICIOS INSERTADOS (${insertados.length})`);
    console.log(`========================================`);
    insertados.forEach((s, idx) => {
      console.log(`${idx + 1}. [${s.codigo}] "${s.nombre}" | ${s.categoria} | SLA: ${s.sla_resp}h/${s.sla_reso}h | S/. ${Number(s.costo).toFixed(2)} | Aprob: ${s.aprobacion}`);
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('ERROR EN TRANSACCIÓN, SE REALIZÓ ROLLBACK:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
