import { redirect } from "next/navigation";

interface Props {
  params: {
    slug: string[];
  };
}

export default function RedireccionRutasLegadasAdmin({ params }: Props) {
  const ruta = params.slug.join("/");

  if (ruta.startsWith("procesos/cambios/formulario")) {
    redirect("/plataforma/cambios/configuracion?vista=campos");
  }
  if (ruta.startsWith("procesos/cambios/flujo-evaluacion")) {
    redirect("/plataforma/cambios/cab?vista=miembros");
  }
  if (ruta.startsWith("procesos/cambios/notificaciones-calendario")) {
    redirect("/plataforma/cambios/configuracion?vista=calendario");
  }
  if (ruta.startsWith("procesos/cambios/tipos-requisitos")) {
    redirect("/plataforma/cambios/configuracion?vista=autoridad");
  }
  if (ruta.startsWith("procesos/cambios")) {
    redirect("/plataforma/cambios/configuracion");
  }

  if (ruta.startsWith("procesos/problemas/formulario")) {
    redirect("/plataforma/problemas/configuracion?vista=campos");
  }
  if (ruta.startsWith("procesos/problemas/flujo")) {
    redirect("/plataforma/problemas/configuracion");
  }
  if (ruta.startsWith("procesos/problemas/relaciones")) {
    redirect("/plataforma/problemas/configuracion");
  }
  if (ruta.startsWith("procesos/problemas")) {
    redirect("/plataforma/problemas/configuracion");
  }

  if (ruta.startsWith("procesos/incidentes")) {
    redirect("/plataforma/incidentes/configuracion");
  }
  if (ruta.startsWith("procesos/solicitudes")) {
    redirect("/plataforma/solicitudes/configuracion");
  }

  // Rutas de administración general
  if (ruta.startsWith("usuarios")) {
    redirect("/plataforma/seguridad/usuarios");
  }
  if (ruta.startsWith("perfiles")) {
    redirect("/plataforma/seguridad/perfiles");
  }
  if (ruta.startsWith("departamentos-empresa")) {
    redirect("/plataforma/organizacion/departamentos-empresa");
  }
  if (ruta.startsWith("departamentos")) {
    redirect("/plataforma/organizacion/grupos-ti");
  }
  if (ruta.startsWith("tecnicos")) {
    redirect("/plataforma/organizacion/grupos-ti?vista=tecnicos");
  }

  redirect("/plataforma/inicio");
}
