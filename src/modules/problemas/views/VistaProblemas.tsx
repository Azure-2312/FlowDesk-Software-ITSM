import ProblemasWorkspace from "@/modules/problemas/components/ProblemasWorkspace";

export default function VistaProblemas({ puedeCrear = false }: { puedeCrear?: boolean }) {
  return <ProblemasWorkspace puedeCrear={puedeCrear} />;
}
