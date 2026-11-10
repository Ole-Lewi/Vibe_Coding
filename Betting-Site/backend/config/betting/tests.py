from decimal import Decimal
from datetime import timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone

from .models import Bet, Event
from .services import BetError, place_bet, settle_event


class BettingEngineTests(TestCase):
    def setUp(self):
        # Wallet (balance 1000) is created by the post_save signal
        self.user = User.objects.create_user("tester", password="pass12345")
        self.event = Event.objects.create(
            home_team="Gor Mahia",
            away_team="AFC Leopards",
            starts_at=timezone.now() + timedelta(days=1),
            home_odds=Decimal("2.10"),
            draw_odds=Decimal("3.20"),
            away_odds=Decimal("3.40"),
        )

    def balance(self):
        self.user.wallet.refresh_from_db()
        return self.user.wallet.balance

    def test_place_bet_deducts_stake_and_locks_odds(self):
        bet = place_bet(self.user, self.event.id, "HOME", "100")
        self.assertEqual(self.balance(), Decimal("900.00"))
        self.assertEqual(bet.odds, Decimal("2.10"))
        self.assertEqual(bet.status, Bet.Status.PENDING)

    def test_odds_change_does_not_affect_open_bet(self):
        bet = place_bet(self.user, self.event.id, "HOME", "100")
        self.event.home_odds = Decimal("1.50")
        self.event.save()
        bet.refresh_from_db()
        self.assertEqual(bet.odds, Decimal("2.10"))

    def test_insufficient_balance(self):
        with self.assertRaises(BetError):
            place_bet(self.user, self.event.id, "HOME", "5000")
        self.assertEqual(self.balance(), Decimal("1000.00"))

    def test_non_positive_stake(self):
        with self.assertRaises(BetError):
            place_bet(self.user, self.event.id, "HOME", "0")

    def test_cannot_bet_on_finished_event(self):
        self.event.status = Event.Status.FINISHED
        self.event.save()
        with self.assertRaises(BetError):
            place_bet(self.user, self.event.id, "HOME", "100")

    def test_winning_bet_pays_out(self):
        bet = place_bet(self.user, self.event.id, "HOME", "100")
        settle_event(self.event.id, "HOME")
        bet.refresh_from_db()
        self.assertEqual(bet.status, Bet.Status.WON)
        self.assertEqual(self.balance(), Decimal("1110.00"))  # 900 + 210

    def test_losing_bet_pays_nothing(self):
        bet = place_bet(self.user, self.event.id, "HOME", "100")
        settle_event(self.event.id, "AWAY")
        bet.refresh_from_db()
        self.assertEqual(bet.status, Bet.Status.LOST)
        self.assertEqual(self.balance(), Decimal("900.00"))

    def test_cannot_settle_twice(self):
        place_bet(self.user, self.event.id, "HOME", "100")
        settle_event(self.event.id, "HOME")
        with self.assertRaises(BetError):
            settle_event(self.event.id, "AWAY")
        self.assertEqual(self.balance(), Decimal("1110.00"))