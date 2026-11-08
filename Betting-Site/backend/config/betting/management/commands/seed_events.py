from datetime import timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from betting.models import Event

FIXTURES = [
    ("Gor Mahia", "AFC Leopards", "2.10", "3.20", "3.40"),
    ("Arsenal", "Chelsea", "1.95", "3.50", "3.80"),
    ("Real Madrid", "Barcelona", "2.30", "3.40", "2.90"),
    ("Tusker", "KCB", "1.80", "3.30", "4.50"),
]


class Command(BaseCommand):
    def handle(self, *args, **opts):
        for i, (h, a, ho, do, ao) in enumerate(FIXTURES, start=1):
            Event.objects.get_or_create(
                home_team=h, away_team=a,
                defaults=dict(starts_at=timezone.now() + timedelta(days=i),
                              home_odds=Decimal(ho), draw_odds=Decimal(do),
                              away_odds=Decimal(ao)),
            )
        self.stdout.write("Seeded events.")