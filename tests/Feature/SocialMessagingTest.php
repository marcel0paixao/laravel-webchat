<?php
namespace Tests\Feature;
use App\Events\Chat\{SendMessage, UserTyping};
use App\Events\UserNotificationSent;
use App\Models\{AppNotification, Conversation, ConversationParticipant, Friendship, Message, MessageStatus, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\{Event, Storage};
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
class SocialMessagingTest extends TestCase
{
    use RefreshDatabase;
    public function test_only_friends_can_exchange_messages()
    {
        $a = User::factory()->create(['username'=>'alpha','phone'=>'+10000000001','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        $b = User::factory()->create(['username'=>'beta','phone'=>'+10000000002','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        Sanctum::actingAs($a);
        $this->postJson('/api/messages/store', ['to'=>$b->id, 'message'=>'Blocked'])->assertForbidden();
        Friendship::create(['requester_id'=>$a->id,'addressee_id'=>$b->id,'status'=>'accepted','accepted_at'=>now()]);
        Event::fake([SendMessage::class]);
        $this->postJson('/api/messages/store', ['to'=>$b->id, 'message'=>'Allowed'])->assertCreated();
        Event::assertDispatched(SendMessage::class);
    }
    public function test_profile_search_uses_immutable_handle()
    {
        $me = User::factory()->create(['username'=>'me','phone'=>'+10000000003','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        User::factory()->create(['username'=>'marcelo','phone'=>'+10000000004','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        Sanctum::actingAs($me);
        $this->getJson('/api/profiles/search?handle=@mar')->assertOk()->assertJsonPath('users.0.username', 'marcelo');
    }
    public function test_chat_media_has_one_week_expiration()
    {
        Storage::fake('minio');
        $a = User::factory()->create(['username'=>'sender','phone'=>'+10000000005','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        $b = User::factory()->create(['username'=>'receiver','phone'=>'+10000000006','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        Friendship::create(['requester_id'=>$a->id,'addressee_id'=>$b->id,'status'=>'accepted','accepted_at'=>now()]);
        Sanctum::actingAs($a);
        $this->post('/api/messages/store', ['to'=>$b->id, 'attachments'=>[UploadedFile::fake()->image('photo.jpg')]], ['Accept'=>'application/json'])->assertCreated()->assertJsonPath('message.attachments.0.media_type', 'image');
        $this->assertDatabaseHas('message_attachments', ['disk'=>'minio','media_type'=>'image']);
    }
    public function test_friend_request_requires_acceptance_and_notifies_users()
    {
        Event::fake([UserNotificationSent::class]);
        $a = User::factory()->create(['username'=>'requester','phone'=>'+10000000007','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        $b = User::factory()->create(['username'=>'receiver','phone'=>'+10000000008','email_verified_at'=>now(),'phone_verified_at'=>now()]);

        Sanctum::actingAs($a);
        $this->postJson('/api/friends/' . $b->id)->assertCreated()->assertJsonPath('friendship.status', 'pending');
        $this->postJson('/api/friends/' . $b->id)->assertOk()->assertJsonPath('friendship.status', 'pending');
        $this->assertDatabaseHas('app_notifications', ['user_id'=>$b->id, 'actor_id'=>$a->id, 'type'=>'friend_request_created']);
        Event::assertDispatched(UserNotificationSent::class);

        Sanctum::actingAs($b);
        $this->postJson('/api/friends/' . $a->id . '/accept')->assertOk()->assertJsonPath('friendship.status', 'accepted');
        $this->assertDatabaseHas('app_notifications', ['user_id'=>$a->id, 'actor_id'=>$b->id, 'type'=>'friend_request_accepted']);
    }
    public function test_direct_conversation_includes_friendship_status_for_partner()
    {
        $a = User::factory()->create(['username'=>'chat-a','phone'=>'+10000000016','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        $b = User::factory()->create(['username'=>'chat-b','phone'=>'+10000000017','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        Friendship::create(['requester_id'=>$a->id,'addressee_id'=>$b->id,'status'=>'accepted','accepted_at'=>now()]);
        Sanctum::actingAs($a);
        $conversation = \App\Http\Controllers\Api\MessageController::directConversationFor($a->id, $b->id);

        $this->getJson('/api/conversations/'.$conversation->hash)
            ->assertOk()
            ->assertJsonPath('conversation.partner.friendship_status', 'accepted');
    }

    public function test_opening_conversation_marks_all_incoming_messages_as_read()
    {
        $reader = User::factory()->create(['username'=>'reader','phone'=>'+10000000022','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        $sender = User::factory()->create(['username'=>'sender','phone'=>'+10000000023','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        Friendship::create(['requester_id'=>$reader->id,'addressee_id'=>$sender->id,'status'=>'accepted','accepted_at'=>now()]);
        $conversation = \App\Http\Controllers\Api\MessageController::directConversationFor($reader->id, $sender->id);

        $older = Message::create(['conversation_id'=>$conversation->id,'from'=>$sender->id,'to'=>$reader->id,'message'=>'Older','type'=>'text']);
        $latest = Message::create(['conversation_id'=>$conversation->id,'from'=>$sender->id,'to'=>$reader->id,'message'=>'Latest','type'=>'text']);
        Message::create(['conversation_id'=>$conversation->id,'from'=>$reader->id,'to'=>$sender->id,'message'=>'Mine','type'=>'text']);
        MessageStatus::create(['message_id'=>$latest->id,'user_id'=>$reader->id,'delivered_at'=>now()]);

        Sanctum::actingAs($reader);
        $this->getJson('/api/messages/load?conversation_hash='.$conversation->hash)->assertOk();

        $own = Message::where('conversation_id', $conversation->id)->where('from', $reader->id)->first();
        $this->assertNotNull(MessageStatus::where('message_id', $older->id)->where('user_id', $reader->id)->value('read_at'));
        $this->assertNotNull(MessageStatus::where('message_id', $latest->id)->where('user_id', $reader->id)->value('read_at'));
        $this->assertNull(MessageStatus::where('message_id', $own->id)->where('user_id', $reader->id)->first());
    }

    public function test_typing_is_not_broadcast_when_users_are_blocked()
    {
        Event::fake([UserTyping::class]);
        $a = User::factory()->create(['username'=>'typing-a','phone'=>'+10000000020','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        $b = User::factory()->create(['username'=>'typing-b','phone'=>'+10000000021','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        Friendship::create(['requester_id'=>$a->id,'addressee_id'=>$b->id,'status'=>'accepted','accepted_at'=>now()]);
        $conversation = \App\Http\Controllers\Api\MessageController::directConversationFor($a->id, $b->id);
        \App\Models\UserBlock::create(['blocker_id'=>$a->id,'blocked_id'=>$b->id]);

        Sanctum::actingAs($b);
        $this->postJson('/api/typing', ['conversation_hash'=>$conversation->hash])->assertNoContent();
        Event::assertNotDispatched(UserTyping::class);

        Sanctum::actingAs($a);
        $this->postJson('/api/typing', ['conversation_hash'=>$conversation->hash])->assertNoContent();
        Event::assertNotDispatched(UserTyping::class);
    }

    public function test_block_removes_friendship_and_unblock_does_not_restore_it()
    {
        $a = User::factory()->create(['username'=>'blocker','phone'=>'+10000000018','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        $b = User::factory()->create(['username'=>'blocked','phone'=>'+10000000019','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        Friendship::create(['requester_id'=>$a->id,'addressee_id'=>$b->id,'status'=>'accepted','accepted_at'=>now()]);
        Sanctum::actingAs($a);

        $this->postJson('/api/blocks/'.$b->id)
            ->assertCreated()
            ->assertJsonPath('is_blocked_by_me', true)
            ->assertJsonPath('friendship_status', null);
        $this->assertDatabaseMissing('friendships', ['requester_id'=>$a->id,'addressee_id'=>$b->id]);
        $this->assertDatabaseHas('user_blocks', ['blocker_id'=>$a->id,'blocked_id'=>$b->id]);

        $this->deleteJson('/api/blocks/'.$b->id)
            ->assertOk()
            ->assertJsonPath('is_blocked_by_me', false)
            ->assertJsonPath('friendship_status', null);
        $this->assertDatabaseMissing('user_blocks', ['blocker_id'=>$a->id,'blocked_id'=>$b->id]);
        $this->assertDatabaseMissing('friendships', ['requester_id'=>$a->id,'addressee_id'=>$b->id]);

        $this->postJson('/api/friends/'.$b->id)->assertCreated()->assertJsonPath('friendship.status', 'pending');
    }

    public function test_existing_direct_conversation_cannot_bypass_friendship_requirement()
    {
        $a = User::factory()->create(['username'=>'former-a','phone'=>'+10000000009','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        $b = User::factory()->create(['username'=>'former-b','phone'=>'+10000000010','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        Friendship::create(['requester_id'=>$a->id,'addressee_id'=>$b->id,'status'=>'accepted','accepted_at'=>now()]);
        Sanctum::actingAs($a);
        $conversation = \App\Http\Controllers\Api\MessageController::directConversationFor($a->id, $b->id);
        Friendship::between($a->id, $b->id)->delete();

        $this->postJson('/api/messages/store', ['conversation_hash'=>$conversation->hash, 'message'=>'Nope'])->assertForbidden();
    }
    public function test_notifications_can_be_marked_read_and_cleared()
    {
        $user = User::factory()->create(['username'=>'notify-me','phone'=>'+10000000011','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        $actor = User::factory()->create(['username'=>'notify-actor','phone'=>'+10000000012','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        $notification = AppNotification::create(['user_id'=>$user->id,'actor_id'=>$actor->id,'type'=>'friend_request_created','title'=>'Friend request','body'=>'Hello']);
        Sanctum::actingAs($user);

        $this->patchJson('/api/notifications/'.$notification->id.'/read')->assertOk();
        $this->assertNotNull($notification->fresh()->read_at);
        $this->deleteJson('/api/notifications')->assertNoContent();
        $this->assertDatabaseMissing('app_notifications', ['id'=>$notification->id]);
    }
    public function test_group_owner_can_manage_members_and_leave_transfers_ownership()
    {
        $owner = User::factory()->create(['username'=>'group-owner','phone'=>'+10000000013','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        $member = User::factory()->create(['username'=>'group-member','phone'=>'+10000000014','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        $other = User::factory()->create(['username'=>'group-other','phone'=>'+10000000015','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        $newMember = User::factory()->create(['username'=>'group-new','phone'=>'+10000000016','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        $conversation = Conversation::create(['type'=>'group','name'=>'Old name','created_by'=>$owner->id]);
        ConversationParticipant::create(['conversation_id'=>$conversation->id,'user_id'=>$owner->id,'role'=>'owner','joined_at'=>now()]);
        ConversationParticipant::create(['conversation_id'=>$conversation->id,'user_id'=>$member->id,'role'=>'member','joined_at'=>now()]);
        ConversationParticipant::create(['conversation_id'=>$conversation->id,'user_id'=>$other->id,'role'=>'member','joined_at'=>now()]);
        Friendship::create(['requester_id'=>$owner->id,'addressee_id'=>$newMember->id,'status'=>'accepted','accepted_at'=>now()]);
        Message::create(['conversation_id'=>$conversation->id,'from'=>$owner->id,'to'=>$owner->id,'message'=>'Original group history','type'=>'text']);
        Sanctum::actingAs($owner);

        $this->patchJson('/api/conversations/groups/'.$conversation->hash, ['name'=>'New name'])->assertOk()->assertJsonPath('conversation.name', 'New name');
        $this->postJson('/api/conversations/groups/'.$conversation->hash.'/members', ['user_ids'=>[$newMember->id]])->assertOk()->assertJsonFragment(['id'=>$newMember->id]);
        $this->assertDatabaseHas('conversation_participants', ['conversation_id'=>$conversation->id,'user_id'=>$newMember->id,'role'=>'member','left_at'=>null]);
        $this->assertDatabaseHas('messages', ['conversation_id'=>$conversation->id,'message'=>$owner->name.' added '.$newMember->name.' to the group.','type'=>'system']);
        $this->assertDatabaseHas('app_notifications', ['user_id'=>$newMember->id,'type'=>'group_added']);
        $this->postJson('/api/conversations/groups/'.$conversation->hash.'/members/'.$member->id.'/promote')->assertOk();
        $this->assertDatabaseHas('conversation_participants', ['conversation_id'=>$conversation->id,'user_id'=>$member->id,'role'=>'admin']);
        $this->assertDatabaseHas('messages', ['conversation_id'=>$conversation->id,'message'=>$member->name.' is now an admin.','type'=>'system']);
        $this->postJson('/api/conversations/groups/'.$conversation->hash.'/members/'.$member->id.'/demote')->assertOk();
        $this->assertDatabaseHas('conversation_participants', ['conversation_id'=>$conversation->id,'user_id'=>$member->id,'role'=>'member']);
        $this->deleteJson('/api/conversations/groups/'.$conversation->hash.'/members/'.$other->id)->assertOk();
        Sanctum::actingAs($other);
        $this->getJson('/api/messages/load?conversation_hash='.$conversation->hash)->assertOk();
        $this->postJson('/api/messages/store', ['conversation_hash'=>$conversation->hash, 'message'=>'Nope'])->assertNotFound();
        Sanctum::actingAs($owner);
        $this->deleteJson('/api/conversations/groups/'.$conversation->hash.'/leave')->assertOk()->assertJsonPath('conversation.current_user_left_at', fn($leftAt) => filled($leftAt));
        $this->assertDatabaseHas('conversation_participants', ['conversation_id'=>$conversation->id,'user_id'=>$owner->id]);
        $this->assertDatabaseHas('messages', ['conversation_id'=>$conversation->id,'message'=>$owner->name.' left the group.','type'=>'system']);
        $this->assertDatabaseHas('conversation_participants', ['conversation_id'=>$conversation->id,'role'=>'owner','left_at'=>null]);
        $this->getJson('/api/messages/load?conversation_hash='.$conversation->hash)->assertOk()->assertJsonFragment(['message'=>'Original group history']);
    }
}
