import { useEffect, useState, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

const ProfesionalEdit = () => {
  const { id } = useParams();
  const [matricula, setMatricula] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [telefono, setTelefono] = useState("");
  const [horarioInicio, setHorarioInicio] = useState("");
  const [horarioFin, setHorarioFin] = useState("");
  const [diasAtencion, setDiasAtencion] = useState<string[]>([]);
  const [duracionTurno, setDuracionTurno] = useState(30);
  const [usuario, setUsuario] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfesional = async () => {
      try {
        const res = await api.get(`/profesionales/${id}/`);
        const p = res.data;
        setMatricula(p.matricula);
        setEspecialidad(p.especialidad);
        setTelefono(p.telefono);
        setHorarioInicio(p.horario_inicio);
        setHorarioFin(p.horario_fin);
        setDiasAtencion(p.dias_atencion);
        setDuracionTurno(p.duracion_turno);
        setUsuario(p.usuario);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfesional();
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/profesionales/${id}/`, {
        matricula,
        especialidad,
        telefono,
        horario_inicio: horarioInicio,
        horario_fin: horarioFin,
        dias_atencion: diasAtencion,
        duracion_turno: duracionTurno,
        usuario: usuario,
      });
     
      navigate("/admin/profesionales/list");
    } catch (err) {
      console.error(err);
      alert("Error actualizando profesional");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Editar Profesional</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
          placeholder="Matrícula"
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          value={especialidad}
          onChange={(e) => setEspecialidad(e.target.value)}
          placeholder="Especialidad"
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="Teléfono"
          className="w-full border p-2 rounded"
        />
        <div className="flex gap-2">
          <input
            type="time"
            value={horarioInicio}
            onChange={(e) => setHorarioInicio(e.target.value)}
            className="w-1/2 border p-2 rounded"
          />
          <input
            type="time"
            value={horarioFin}
            onChange={(e) => setHorarioFin(e.target.value)}
            className="w-1/2 border p-2 rounded"
          />
        </div>
        <input
          type="text"
          value={diasAtencion.join(",")}
          onChange={(e) => setDiasAtencion(e.target.value.split(","))}
          placeholder="Días de atención (ej: Lunes,Martes)"
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          value={duracionTurno}
          onChange={(e) => setDuracionTurno(Number(e.target.value))}
          placeholder="Duración del turno (minutos)"
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          placeholder="ID de usuario"
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
};

export default ProfesionalEdit;
