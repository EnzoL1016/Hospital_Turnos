# proyecto/backend/hospital_api/urls.py

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Incluimos core.urls bajo /api/
    path('api/', include('core.urls')),
]