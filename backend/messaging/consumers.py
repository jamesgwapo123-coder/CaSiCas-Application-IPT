import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token


class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time chat messaging."""

    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group = f'chat_{self.conversation_id}'

        # Authenticate via token in query string
        self.user = await self.authenticate()
        if not self.user:
            await self.close()
            return

        # Verify user is part of this conversation
        if not await self.is_participant():
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group'):
            await self.channel_layer.group_discard(self.room_group, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        text = data.get('text', '').strip()

        if not text:
            return

        # Save message to database
        message = await self.save_message(text)

        # Broadcast to room
        await self.channel_layer.group_send(
            self.room_group,
            {
                'type': 'chat_message',
                'id': message['id'],
                'sender': message['sender'],
                'sender_username': message['sender_username'],
                'text': message['text'],
                'created_at': message['created_at'],
            }
        )

    async def chat_message(self, event):
        """Send message to WebSocket client."""
        await self.send(text_data=json.dumps({
            'id': event['id'],
            'sender': event['sender'],
            'sender_username': event['sender_username'],
            'text': event['text'],
            'created_at': event['created_at'],
        }))

    @database_sync_to_async
    def authenticate(self):
        """Authenticate user via token in query string."""
        query_string = self.scope.get('query_string', b'').decode()
        params = dict(p.split('=') for p in query_string.split('&') if '=' in p)
        token_key = params.get('token')

        if not token_key:
            return None

        try:
            token = Token.objects.get(key=token_key)
            return token.user
        except Token.DoesNotExist:
            return None

    @database_sync_to_async
    def is_participant(self):
        """Check if user is part of the conversation."""
        from .models import Conversation
        from django.db.models import Q
        return Conversation.objects.filter(
            id=self.conversation_id
        ).filter(
            Q(buyer=self.user) | Q(seller=self.user)
        ).exists()

    @database_sync_to_async
    def save_message(self, text):
        """Save a message and return serializable data."""
        from .models import Conversation, Message
        conversation = Conversation.objects.get(id=self.conversation_id)
        message = Message.objects.create(
            conversation=conversation,
            sender=self.user,
            text=text,
        )
        conversation.save()  # Update timestamp
        return {
            'id': message.id,
            'sender': self.user.id,
            'sender_username': self.user.username,
            'text': message.text,
            'created_at': message.created_at.isoformat(),
        }
