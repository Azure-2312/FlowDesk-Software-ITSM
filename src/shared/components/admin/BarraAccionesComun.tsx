"use client";

import React from "react";

export interface BarraAccionesComunProps {
  versionPublicada?: number;
  fechaPublicada?: string;
  autorPublicada?: string;
  hayBorrador?: boolean;
  guardando?: boolean;
  publicando?: boolean;
  bloqueadoPorOtro?: string;
  puedePublicar?: boolean;
  puedeEditar?: boolean;
  onGuardarBorrador?: () => void;
  onVistaPrevia?: () => void;
  onAbrirPublicar?: () => void;
  onDescartar?: () => void;
  onRestaurarFabrica?: () => void;
  onVerHistorial?: () => void;
  onExportar?: () => void;
  onImportar?: () => void;
}

/**
 * BarraAccionesComun: Removida la barra de borrador vs publicado
 * para simplificar la interfaz visual de las vistas administrativas.
 */
export const BarraAccionesComun: React.FC<BarraAccionesComunProps> = () => {
  return null;
};
