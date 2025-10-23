import useAuthStore from '../store/authStore';

const DashboardAdmin = () => {
  const user = useAuthStore(state => state.user);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">
        Bienvenido al Panel de Administración
      </h2>
      <p className="text-gray-600">
        Utiliza el menú lateral para gestionar profesionales, crear agendas y acceder a los reportes del sistema.
      </p>
      <p className="mt-4 text-sm text-gray-500">
        Sesión iniciada como: <strong>{user?.username}</strong> (Rol: <strong>{user?.role}</strong>)
      </p>
    </div>
  );
};

export default DashboardAdmin;
