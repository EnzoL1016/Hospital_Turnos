import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import publicApi from "../api/publicApi.ts";

const RegistroPaciente = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    dni: "",
    password: "",
    nombre_completo: "",
    fecha_nacimiento: "",
    telefono: "",
    email: "",
    direccion: "",
    obra_social: "",
    numero_afiliado: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await publicApi.post("/api/auth/register/", formData);
      alert("✅ Registro exitoso, ahora puedes iniciar sesión");
      navigate("/login");
    } catch (err: any) {
      console.error(err);
      alert("❌ Error al registrar paciente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-blue-600">Registro de Paciente</h2>

        <input
          type="text"
          name="dni"
          placeholder="DNI"
          value={formData.dni}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          name="nombre_completo"
          placeholder="Nombre completo"
          value={formData.nombre_completo}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="date"
          name="fecha_nacimiento"
          value={formData.fecha_nacimiento}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          name="telefono"
          placeholder="Teléfono"
          value={formData.telefono}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          name="direccion"
          placeholder="Dirección"
          value={formData.direccion}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          name="obra_social"
          placeholder="Obra social"
          value={formData.obra_social}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          name="numero_afiliado"
          placeholder="Número de afiliado"
          value={formData.numero_afiliado}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Registrando..." : "Registrarse"}
        </button>

        <p className="text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Inicia sesión
          </span>
        </p>
      </form>
    </div>
  );
};

export default RegistroPaciente;
