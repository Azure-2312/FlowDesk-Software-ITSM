import ProveedoresWorkspace from "@/modules/proveedores/components/ProveedoresWorkspace";

export default function VistaProveedores({ puedeEditar }: { puedeEditar: boolean }) {
  return <ProveedoresWorkspace puedeEditar={puedeEditar} />;
}
