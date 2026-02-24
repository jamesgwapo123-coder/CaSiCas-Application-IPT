from django.contrib import admin
from .models import Conversation, Message, Reaction


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'buyer', 'seller', 'listing', 'updated_at']
    list_filter = ['updated_at']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'sender', 'text_preview', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']

    def text_preview(self, obj):
        return obj.text[:60]
    text_preview.short_description = 'Message'
