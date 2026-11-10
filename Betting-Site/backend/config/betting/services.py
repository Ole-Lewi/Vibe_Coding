from decimal import Decimal
from django.db import transaction
from .models import Bet, Event, Wallet


class BetError(Exception):
    pass


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
    if event.status == Event.Status.FINISHED:
        raise BetError("event already settled.")
    
    wallet.balance -= stake
    wallet.save()
    return Bet.objects.create(
        user=user, event=event, pick=pick, stake=stake, odds=event.odds_for(pick)
    )


@transaction.atomic
def settle_event(event_id, result):
    event = Event.objects.select_for_update().get(pk=event_id)
    event.status, event.result = Event.Status.FINISHED, result
    event.save()

    for bet in event.bets.select_for_update().filter(status=Bet.Status.PENDING):
        if bet.pick == result:
            bet.status = Bet.Status.WON
            wallet = Wallet.objects.select_for_update().get(user=bet.user)
            wallet.balance += (bet.stake * bet.odds).quantize(Decimal("0.01"))
            wallet.save()
        else:
            bet.status = Bet.Status.LOST
        bet.save()