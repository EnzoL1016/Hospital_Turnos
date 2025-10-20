# core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from core.views.PacienteViewSet import PacienteViewSet
from core.views.ProfesionalViewSet import ProfesionalViewSet
from core.views.AgendaViewSet import AgendaViewSet
from core.views.TurnoViewSet import TurnoViewSet
from core.views.InasistenciaViewSet import InasistenciaViewSet
from core.views.ReportesViewSet import ReportesViewSet
from core.views.RegistroPacienteView import RegistroPacienteView
from core.views.CustomTokenObtainPairView import CustomTokenObtainPairView
from core.views.RegistroProfesionalView import RegistroProfesionalView
from core.views.JustificarInasistenciaView import JustificarInasistenciaView
from core.views.EvaluarInasistenciaView import EvaluarInasistenciaView

router = DefaultRouter()
router.register(r'pacientes', PacienteViewSet, basename='pacientes')
router.register(r'profesionales', ProfesionalViewSet, basename='profesionales')
router.register(r'agendas', AgendaViewSet, basename='agendas')
router.register(r'turnos', TurnoViewSet, basename='turnos')
router.register(r'inasistencias', InasistenciaViewSet, basename='inasistencias')
router.register(r'reportes', ReportesViewSet, basename='reportes')

urlpatterns = [
    # AUTH
    path("auth/register/", RegistroPacienteView.as_view(), name="register_paciente"),
    path("auth/login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # PROFESIONAL (registro)
    path("profesionales/registro/", RegistroProfesionalView.as_view(), name="registro_profesional"),

    # 📌 NUEVA RUTA para aprobar/rechazar inasistencias
    path(
        "inasistencias/<int:pk>/evaluar/",
        EvaluarInasistenciaView.as_view(),
        name="evaluar-inasistencia"
    ),

    # ROUTER
    path("", include(router.urls)),
]
