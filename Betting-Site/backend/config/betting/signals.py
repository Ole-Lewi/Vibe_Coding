from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Transaction, Wallet


@receiver(post_save, sender=get_user_model())
def create_wallet(sender, instance, created, **kwargs):
    if created:
        wallet = Wallet.objects.create(user=instance)
        Transaction.objects.create(
            user=instance, kind=Transaction.Kind.BONUS, amount=wallet.balance,
            balance_after=wallet.balance, note="Welcome bonus",
        )