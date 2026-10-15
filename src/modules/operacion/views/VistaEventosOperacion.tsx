import EventosWorkspace from "@/modules/operacion/components/EventosWorkspace";

export default function VistaEventosOperacion({ perfil }: { perfil: number }) {
  return <EventosWorkspace perfil={perfil} />;
}
