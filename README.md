# Sistema de Gestión de Turnos Médicos

Aplicación full-stack para la gestión de turnos médicos, construida con Django y React. El sistema proporciona flujos de trabajo distintos para pacientes, profesionales y administradores para optimizar la reserva, gestión y seguimiento de citas.

## Estado del Proyecto

Este proyecto se encuentra actualmente en una etapa de **MVP (Producto Mínimo Viable)**. Las características principales para los flujos de paciente y profesional están implementadas y funcionales. El panel de administración y las funcionalidades avanzadas están en desarrollo activo.

---
## Features

#### Flujo de Paciente
* Búsqueda de profesionales por especialidad y visualización de horarios disponibles.
* Reserva, consulta y cancelación de turnos.
* Gestión y justificación de inasistencias pasadas.
* Dashboard personal con accesos directos a las acciones principales.

#### Flujo de Profesional
* Visualización y gestión de agenda de turnos por día/mes.
* Seguimiento de asistencia de pacientes (marcar como "Asistió" o "No Asistió").
* Revisión y gestión de las justificaciones de inasistencias enviadas por los pacientes.

#### Flujo de Administrador (En Desarrollo)
* Operaciones CRUD para profesionales.
* Supervisión global de agendas.
* Generación de reportes.

---
## Tech Stack

| Área    | Tecnología                                       |
| :------ | :----------------------------------------------- |
| **Backend** | Django, Django REST Framework, SQLite3 (dev)     |
| **Frontend** | React, TypeScript, Vite, TanStack Query, Zustand |
| **Styling** | Tailwind CSS                                     |
| **UI/UX** | React Hot Toast, Headless UI (implícito)         |

---
## Setup para Desarrollo Local

Para levantar el entorno en una máquina local, clona ambos repositorios y sigue las instrucciones para cada uno.

#### Prerrequisitos
* Node.js & npm
* Python & pip
* Git

### 1. Backend (Django)

```bash
# 1. Clonar y moverse al directorio
git clone <URL_DEL_REPO_BACKEND>
cd <nombre-de-la-carpeta-backend>

# 2. Crear y activar el entorno virtual
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Ejecutar migraciones
python manage.py migrate

# 5. Levantar el servidor de desarrollo
python manage.py runserver
```
El backend estará disponible en `http://127.0.0.1:8000`.

### 2. Frontend (React)

```bash
# 1. Clonar y moverse al directorio (en una nueva terminal)
git clone <URL_DEL_REPO_FRONTEND>
cd <nombre-de-la-carpeta-frontend>

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Crea un archivo .env en la raíz del proyecto y añade la siguiente línea:
VITE_API_BASE_URL=[http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)

# 4. Levantar el servidor de desarrollo
npm run dev
```
El frontend estará disponible en `http://localhost:5173`.
