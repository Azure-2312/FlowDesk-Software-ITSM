import { redirect } from "next/navigation";

interface Props {
  params: {
    slug: string[];
  };
}

export default function RedireccionRutasLegadasAdmin({ params }: Props) {
  const ruta = params.slug.join("/");

  if (ruta.startsWith("procesos/cambios/formulario")) {
    redirect("/plataforma/cambios/configuracion/formulario");
  }
  if (ruta.startsWith("procesos/cambios/flujo-evaluacion")) {
    redirect("/plataforma/cambios/configuracion/flujo-evaluacion");
  }
  if (ruta.startsWith("procesos/cambios/notificaciones-calendario")) {
    redirect("/plataforma/cambios/configuracion/notificaciones-calendario");
  }
  if (ruta.startsWith("procesos/cambios/tipos-requisitos")) {
    redirect("/plataforma/cambios/configuracion/tipos-requisitos");
  }
  if (ruta.startsWith("procesos/cambios")) {
    redirect("/plataforma/cambios/configuracion/formulario");
  }

  if (ruta.startsWith("procesos/problemas/formulario")) {
    redirect("/plataforma/problemas/configuracion/formulario");
  }
  if (ruta.startsWith("procesos/problemas/flujo")) {
    redirect("/plataforma/problemas/configuracion/flujo");
  }
  if (ruta.startsWith("procesos/problemas/relaciones")) {
    redirect("/plataforma/problemas/configuracion/relaciones");
  }
  if (ruta.startsWith("procesos/problemas")) {
    redirect("/plataforma/problemas/configuracion/formulario");
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
    redirect("/plataforma/organizacion/departamentos");
  }
  if (ruta.startsWith("tecnicos")) {
    redirect("/plataforma/organizacion/tecnicos");
  }

  redirect("/plataforma/dashboard");
}
