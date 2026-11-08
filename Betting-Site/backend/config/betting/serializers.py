from decimal import Decimal
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Bet, Event


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ["id", "sport", "home_team", "away_team", "starts_at",
                  "home_odds", "draw_odds", "away_odds"]


class BetSerializer(serializers.ModelSerializer):
    event_name = serializers.CharField(source="event.__str__", read_only=True)

    class Meta:
        model = Bet
        fields = ["id", "event_name", "pick", "stake", "odds", "status", "created_at"]


class PlaceBetSerializer(serializers.Serializer):
    event_id = serializers.IntegerField()
    pick = serializers.ChoiceField(choices=Event.Outcome.choices)
    stake = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal("1"))