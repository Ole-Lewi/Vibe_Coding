from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Bet, Event, Wallet, Transaction
from .services import settle_event, BetError


@admin.action(description="Settle selected events (uses the result field)")
def settle(modeladmin, request, queryset):
    done = 0
    for e in queryset.exclude(result__isnull=True).exclude(result=""):
        try:
            settle_event(e.pk, e.result)
            done += 1
        except BetError as e:
            continue
    modeladmin.message_user(request, f"Settled {done} event(s).")


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ["__str__", "starts_at", "status", "result"]
    actions = [settle]


admin.site.register(Wallet)
admin.site.register(Bet)
admin.site.register(Transaction)