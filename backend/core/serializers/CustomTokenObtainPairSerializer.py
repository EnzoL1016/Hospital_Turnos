from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.rol
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        profesional_id = getattr(self.user, "profesional", None)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'role': self.user.rol,
            'profesional_id': profesional_id.id if profesional_id else None,
        }
        return data
