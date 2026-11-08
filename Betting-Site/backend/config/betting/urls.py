from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path("auth/register/", views.RegisterView.as_view()),
    path("auth/login/", TokenObtainPairView.as_view()),
    path("auth/refresh/", TokenRefreshView.as_view()),
    path("me/", views.me),
    path("events/", views.EventListView.as_view()),
    path("bets/", views.MyBetsView.as_view()),
    path("bets/place/", views.PlaceBetView.as_view()),
]