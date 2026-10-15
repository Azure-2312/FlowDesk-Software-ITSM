import ProblemasWorkspace from "@/modules/problemas/components/ProblemasWorkspace";

export default function VistaProblemas({ puedeCrear }: { puedeCrear: boolean }) {
  return <ProblemasWorkspace puedeCrear={puedeCrear} />;
}
