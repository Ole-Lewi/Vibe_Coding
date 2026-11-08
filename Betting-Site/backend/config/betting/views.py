from django.shortcuts import render

# Create your views here.
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Bet, Event, Wallet
from .serializers import (BetSerializer, EventSerializer,
                          PlaceBetSerializer, RegisterSerializer)
from .services import BetError, place_bet


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class EventListView(generics.ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Event.objects.filter(status=Event.Status.UPCOMING).order_by("starts_at")


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    wallet, _ = Wallet.objects.get_or_create(user=request.user)
    return Response({"username": request.user.username, "balance": wallet.balance})


class PlaceBetView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        s = PlaceBetSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        try:
            bet = place_bet(request.user, **s.validated_data)
        except Event.DoesNotExist:
            return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)
        except BetError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(BetSerializer(bet).data, status=status.HTTP_201_CREATED)


class MyBetsView(generics.ListAPIView):
    serializer_class = BetSerializer

    def get_queryset(self):
        return Bet.objects.filter(user=self.request.user).select_related("event").order_by("-created_at")