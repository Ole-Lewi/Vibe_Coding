from decimal import Decimal
from django.db import transaction
from .models import Bet, Event, Transaction, Wallet


class BetError(Exception):
    pass


def _record(wallet, kind, amount, bet=None, note=""):
    """The only place a wallet balance changes, so the ledger always matches."""
    wallet.balance += amount
    wallet.save()
    Transaction.objects.create(
        user_id=wallet.user_id, kind=kind, amount=amount,
        balance_after=wallet.balance, bet=bet, note=note,
    )


@transaction.atomic
def place_bet(user, event_id, pick, stake):
    stake = Decimal(stake)
    if stake <= 0:
        raise BetError("Stake must be positive.")

    event = Event.objects.get(pk=event_id)
    if event.status != Event.Status.UPCOMING:
        raise BetError("Betting is closed for this event.")

    wallet = Wallet.objects.select_for_update().get(user=user)
    if wallet.balance < stake:
        raise BetError("Insufficient balance.")

    bet = Bet.objects.create(
        user=user, event=event, pick=pick, stake=stake, odds=event.odds_for(pick)
    )
    _record(wallet, Transaction.Kind.STAKE, -stake, bet=bet, note=str(event))
    return bet


@transaction.atomic
def settle_event(event_id, result):
    event = Event.objects.select_for_update().get(pk=event_id)
    if event.status == Event.Status.FINISHED:
        raise BetError("Event already settled.")

    event.status, event.result = Event.Status.FINISHED, result
    event.save()

    for bet in event.bets.select_for_update().filter(status=Bet.Status.PENDING):
        if bet.pick == result:
            bet.status = Bet.Status.WON
            payout = (bet.stake * bet.odds).quantize(Decimal("0.01"))
            wallet = Wallet.objects.select_for_update().get(user=bet.user)
            _record(wallet, Transaction.Kind.PAYOUT, payout, bet=bet, note=str(event))
        else:
            bet.status = Bet.Status.LOST
        bet.save()