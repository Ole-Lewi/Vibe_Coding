from django.db import models

# Create your models here.
from decimal import Decimal
from django.conf import settings
from django.db import models


class Event(models.Model):
    class Status(models.TextChoices):
        UPCOMING = "UPCOMING"
        LIVE = "LIVE"
        FINISHED = "FINISHED"

    class Outcome(models.TextChoices):
        HOME = "HOME"
        DRAW = "DRAW"
        AWAY = "AWAY"

    sport = models.CharField(max_length=50, default="football")
    home_team = models.CharField(max_length=100)
    away_team = models.CharField(max_length=100)
    starts_at = models.DateTimeField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.UPCOMING)
    result = models.CharField(max_length=4, choices=Outcome.choices, null=True, blank=True)
    home_odds = models.DecimalField(max_digits=6, decimal_places=2)
    draw_odds = models.DecimalField(max_digits=6, decimal_places=2)
    away_odds = models.DecimalField(max_digits=6, decimal_places=2)

    def odds_for(self, pick):
        return {"HOME": self.home_odds, "DRAW": self.draw_odds, "AWAY": self.away_odds}[pick]

    def __str__(self):
        return f"{self.home_team} vs {self.away_team}"


class Wallet(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("1000.00"))


class Bet(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING"
        WON = "WON"
        LOST = "LOST"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="bets")
    pick = models.CharField(max_length=4, choices=Event.Outcome.choices)
    stake = models.DecimalField(max_digits=10, decimal_places=2)
    odds = models.DecimalField(max_digits=6, decimal_places=2)  # locked at placement
    status = models.CharField(max_length=7, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)