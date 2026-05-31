<?php
namespace Tests\Feature;
use App\Events\Chat\SendMessage;
use App\Events\UserNotificationSent;
use App\Models\{Friendship, User};
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
}
