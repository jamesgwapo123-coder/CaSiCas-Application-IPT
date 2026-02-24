from django.db.models import Q
from rest_framework import viewsets, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Conversation, Message, Reaction
from .serializers import ConversationSerializer, MessageSerializer, ReactionSerializer


class ConversationViewSet(viewsets.ModelViewSet):
    """
    list:   GET  /api/messaging/conversations/         — my conversations
    create: POST /api/messaging/conversations/         — start a conversation
    retrieve: GET /api/messaging/conversations/{id}/   — conversation detail
    messages: GET /api/messaging/conversations/{id}/messages/  — messages in thread
    send:   POST /api/messaging/conversations/{id}/send/       — send a message
    read:   POST /api/messaging/conversations/{id}/read/       — mark all as read
    react:  POST /api/messaging/conversations/{id}/react/      — add/toggle reaction
    """
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Conversation.objects.filter(
            Q(buyer=self.request.user) | Q(seller=self.request.user)
        )

    def create(self, request):
        """Start or resume a conversation with a seller about a listing."""
        listing_id = request.data.get('listing')
        seller_id = request.data.get('seller')

        if not seller_id:
            return Response({'error': 'seller is required'}, status=status.HTTP_400_BAD_REQUEST)

        if int(seller_id) == request.user.id:
            return Response({'error': 'Cannot message yourself'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if conversation already exists
        filters = Q(buyer=request.user, seller_id=seller_id) | Q(buyer_id=seller_id, seller=request.user)
        if listing_id:
            filters &= Q(listing_id=listing_id)

        existing = Conversation.objects.filter(filters).first()
        if existing:
            serializer = self.get_serializer(existing)
            return Response(serializer.data)

        # Create new conversation
        conversation = Conversation.objects.create(
            buyer=request.user,
            seller_id=seller_id,
            listing_id=listing_id,
        )

        # If an initial message was provided, create it
        initial_text = request.data.get('message', '').strip()
        if initial_text:
            Message.objects.create(
                conversation=conversation,
                sender=request.user,
                text=initial_text,
            )

        serializer = self.get_serializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Get all messages in a conversation."""
        conversation = self.get_object()
        messages = conversation.messages.select_related('sender').prefetch_related('reactions__user').all()
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        """Send a message (text and/or image) to a conversation."""
        conversation = self.get_object()
        text = request.data.get('text', '').strip()
        image = request.FILES.get('image')

        if not text and not image:
            return Response({'error': 'text or image is required'}, status=status.HTTP_400_BAD_REQUEST)

        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            text=text,
            image=image,
        )

        # Update conversation timestamp
        conversation.save()

        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def read(self, request, pk=None):
        """Mark all messages in this conversation as read (for current user)."""
        conversation = self.get_object()
        updated = conversation.messages.filter(is_read=False).exclude(
            sender=request.user
        ).update(is_read=True)
        return Response({'marked_read': updated})

    @action(detail=True, methods=['post'])
    def react(self, request, pk=None):
        """Add or remove a reaction on a message."""
        message_id = request.data.get('message_id')
        emoji = request.data.get('emoji')

        if not message_id or not emoji:
            return Response({'error': 'message_id and emoji are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify message belongs to this conversation
        conversation = self.get_object()
        try:
            message = conversation.messages.get(id=message_id)
        except Message.DoesNotExist:
            return Response({'error': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)

        # Toggle: remove if exists, add if not
        existing = Reaction.objects.filter(message=message, user=request.user, emoji=emoji).first()
        if existing:
            existing.delete()
            return Response({'action': 'removed', 'emoji': emoji})
        else:
            Reaction.objects.create(message=message, user=request.user, emoji=emoji)
            return Response({'action': 'added', 'emoji': emoji}, status=status.HTTP_201_CREATED)
