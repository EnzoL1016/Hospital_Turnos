# Sistema de Gestión de Turnos Médicos 🏥

¡Bienvenido! Este es un sistema integral de gestión de turnos médicos diseñado para modernizar y simplificar la interacción entre pacientes, profesionales de la salud y administradores. La plataforma ofrece una experiencia de usuario fluida y eficiente, desde la reserva de un turno hasta la gestión de agendas completas.

Este proyecto fue desarrollado con un stack tecnológico moderno, enfocándose en el rendimiento, la escalabilidad y una experiencia de usuario de primer nivel.

---
## ✨ Características Principales

El sistema está diseñado con flujos de trabajo específicos para cada tipo de usuario:

### Para Pacientes 👤
* **Dashboard Personal:** Una vista principal con acceso rápido a todas las funciones.
* **Búsqueda y Reserva de Turnos:** Filtra profesionales por especialidad y consulta sus horarios disponibles para agendar una cita en tiempo real.
* **Gestión de Turnos:** Visualiza tus próximos turnos y tu historial (citas asistidas, no asistidas o canceladas).
* **Cancelación de Turnos:** Cancela tus citas con un solo clic a través de un diálogo de confirmación amigable.
* **Gestión de Inasistencias:** Justifica tus inasistencias pasadas directamente desde tu panel.

### Para Profesionales 🩺
* **Dashboard de Gestión:** Un centro de control para acceder a las agendas y ver los turnos del día.
* **Gestión de Agenda:** Visualiza tus turnos reservados, disponibles y el historial de citas.
* **Control de Asistencia:** Marca el estado de cada turno como "Asistió" o "No Asistió" de forma sencilla.
* **Evaluación de Justificaciones:** Revisa y gestiona las justificaciones enviadas por los pacientes para sus inasistencias.

### Para Administradores (WIP) 🛠️
* Gestión completa de profesionales (alta, baja, modificación).
* Supervisión de agendas y turnos de toda la clínica.
* Generación de reportes y estadísticas.

---
## 🚀 Stack Tecnológico

Este proyecto está dividido en un frontend desacoplado y un backend robusto.

* **Frontend (React):**
    * **Framework:** React con Vite.js
    * **Lenguaje:** TypeScript
    * **Gestión de Estado:** Zustand
    * **Fetching de Datos y Caché:** TanStack Query (React Query)
    * **Estilos:** Tailwind CSS
    * **Notificaciones:** React Hot Toast

* **Backend (Django):**
    * **Framework:** Django
    * **API:** Django REST Framework (DRF)
    * **Base de Datos:** SQLite (para desarrollo, fácilmente escalable a PostgreSQL)

---
## 🏁 Guía de Inicio Rápido (Getting Started)

Para correr este proyecto en tu máquina local, sigue estos pasos:

### Prerrequisitos
* Node.js y npm
* Python y pip
* Git

### 1. Configuración del Backend (Django)

```bash
# 1. Clona el repositorio del backend
git clone <URL_DEL_REPO_BACKEND>
cd <nombre-de-la-carpeta-backend>

# 2. Crea y activa un entorno virtual
python -m venv venv
# En Windows: venv\Scripts\activate
# En macOS/Linux: source venv/bin/activate

# 3. Instala las dependencias
pip install -r requirements.txt

# 4. Aplica las migraciones de la base de datos
python manage.py migrate

# 5. Inicia el servidor
python manage.py runserver
```
Tu backend estará corriendo en `http://127.0.0.1:8000`.

### 2. Configuración del Frontend (React)

```bash
# 1. Clona el repositorio del frontend en una nueva terminal
git clone <URL_DEL_REPO_FRONTEND>
cd <nombre-de-la-carpeta-frontend>

# 2. Instala las dependencias
npm install

# 3. Crea un archivo .env en la raíz y configura la URL de la API
echo "VITE_API_BASE_URL=[http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)" > .env

# 4. Inicia la aplicación
npm run dev
```
Tu frontend estará disponible en `http://localhost:5173`.

---

¡Y listo! Ya puedes explorar la aplicación. ¡Gracias por visitar el proyecto!
