from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Bet, Event, Wallet
from .services import settle_event


@admin.action(description="Settle selected events (uses the result field)")
def settle(modeladmin, request, queryset):
    for e in queryset.exclude(result__isnull=True).exclude(result=""):
        settle_event(e.pk, e.result)


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ["__str__", "starts_at", "status", "result"]
    actions = [settle]


admin.site.register(Wallet)
admin.site.register(Bet)