const fs = require('fs');

let types = fs.readFileSync('src/types/index.ts', 'utf8');

// Update ServicioCatalogo
types = types.replace(
`  estado_registro: boolean;
  pasos?: ServicioWorkflowPaso[];
}`,
`  estado_registro: boolean;
  motivo_inactivacion?: string | null;
  fecha_inactivacion?: string | null;
  usuario_inactivacion?: number | null;
  usuario_inactivacion_nombre?: string | null;
  pasos?: ServicioWorkflowPaso[];
}`
);

// Update ElementoConfiguracion
types = types.replace(
`  relaciones_padre?: CIRelacion[];
  relaciones_hijo?: CIRelacion[];
  fecha_creacion: string;
}`,
`  relaciones_padre?: CIRelacion[];
  relaciones_hijo?: CIRelacion[];
  fecha_creacion: string;
  estado_registro?: boolean;
  motivo_inactivacion?: string | null;
  fecha_inactivacion?: string | null;
  usuario_inactivacion?: number | null;
  usuario_inactivacion_nombre?: string | null;
}`
);

// Update Activo
types = types.replace(
`  costo_compra?: number | null;
  fecha_creacion: string;
}`,
`  costo_compra?: number | null;
  fecha_creacion: string;
  estado_registro?: boolean;
  motivo_inactivacion?: string | null;
  fecha_inactivacion?: string | null;
  usuario_inactivacion?: number | null;
}`
);

fs.writeFileSync('src/types/index.ts', types, 'utf8');
console.log('src/types/index.ts successfully updated');
