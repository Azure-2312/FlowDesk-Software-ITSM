interface Props {
  titulo: string;
  descripcion: string;
}

export default function EnConstruccion({ titulo, descripcion }: Props) {
  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina">
        <div>
          <h1>{titulo}</h1>
          <p className="subtitulo">{descripcion}</p>
        </div>
      </div>
      <div className="aviso-construccion">
        Este módulo todavía no está construido — es parte de una siguiente
        entrega del proyecto.
      </div>
    </div>
  );
}
