<?php

namespace Tests\Feature;

use App\Models\{Conversation, ConversationParticipant, Friendship, Message, User, UserReport};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminModerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_and_group_reports_store_reason_details_and_context()
    {
        $reporter = User::factory()->create(['username'=>'reporter','phone'=>'+20000000001','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        $reported = User::factory()->create(['username'=>'reported','phone'=>'+20000000002','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        Friendship::create(['requester_id'=>$reporter->id,'addressee_id'=>$reported->id,'status'=>'accepted','accepted_at'=>now()]);
        $direct = \App\Http\Controllers\Api\MessageController::directConversationFor($reporter->id, $reported->id);
        Sanctum::actingAs($reporter);

        $this->postJson('/api/reports/'.$reported->id, ['reason'=>'Harassment','details'=>'Repeated abuse.'])
            ->assertCreated();
        $this->assertDatabaseHas('user_reports', [
            'reporter_id'=>$reporter->id,
            'reported_id'=>$reported->id,
            'conversation_id'=>$direct->id,
            'target_type'=>'user',
            'reason'=>'Harassment',
            'details'=>'Repeated abuse.',
            'status'=>'open',
        ]);

        $group = Conversation::create(['type'=>'group','name'=>'Bad group','created_by'=>$reported->id]);
        ConversationParticipant::create(['conversation_id'=>$group->id,'user_id'=>$reporter->id,'role'=>'member','joined_at'=>now()]);
        ConversationParticipant::create(['conversation_id'=>$group->id,'user_id'=>$reported->id,'role'=>'owner','joined_at'=>now()]);
        $this->postJson('/api/conversations/groups/'.$group->hash.'/report', ['reason'=>'Scam','details'=>'Suspicious links.'])
            ->assertCreated();
        $this->assertDatabaseHas('user_reports', [
            'reporter_id'=>$reporter->id,
            'conversation_id'=>$group->id,
            'target_type'=>'group',
            'reason'=>'Scam',
            'details'=>'Suspicious links.',
        ]);
    }

    public function test_admin_can_ban_user_and_banned_user_is_locked_out()
    {
        $admin = User::factory()->create(['username'=>'admin','phone'=>'+20000000003','email_verified_at'=>now(),'phone_verified_at'=>now(),'is_admin'=>true]);
        $reported = User::factory()->create(['username'=>'to-ban','phone'=>'+20000000004','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        $report = UserReport::create(['reporter_id'=>$admin->id,'reported_id'=>$reported->id,'target_type'=>'user','reason'=>'Spam','status'=>'open']);

        $this->actingAs($admin)->post('/admin/reports/'.$report->id.'/ban-user', ['reason'=>'Spam confirmed','details'=>'Many reports.'])
            ->assertRedirect();
        $this->assertNotNull($reported->fresh()->banned_at);
        $this->assertDatabaseHas('app_notifications', ['user_id'=>$reported->id,'type'=>'account_banned','actor_id'=>null]);

        $reported = $reported->fresh();
        $this->actingAs($reported)->get('/home')->assertRedirect('/banned');
        Sanctum::actingAs($reported);
        $this->getJson('/api/conversations')->assertStatus(423);

        $this->actingAs($admin)->post('/admin/reports/'.$report->id.'/unban-user')->assertRedirect();
        $this->assertNull($reported->fresh()->banned_at);
        $this->assertDatabaseHas('app_notifications', ['user_id'=>$reported->id,'type'=>'account_unbanned','actor_id'=>null]);
    }

    public function test_admin_can_ban_group_and_messages_are_blocked()
    {
        $admin = User::factory()->create(['username'=>'group-admin','phone'=>'+20000000005','email_verified_at'=>now(),'phone_verified_at'=>now(),'is_admin'=>true]);
        $owner = User::factory()->create(['username'=>'group-owner-ban','phone'=>'+20000000006','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        $member = User::factory()->create(['username'=>'group-member-ban','phone'=>'+20000000007','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        $group = Conversation::create(['type'=>'group','name'=>'Reported group','created_by'=>$owner->id]);
        ConversationParticipant::create(['conversation_id'=>$group->id,'user_id'=>$owner->id,'role'=>'owner','joined_at'=>now()]);
        ConversationParticipant::create(['conversation_id'=>$group->id,'user_id'=>$member->id,'role'=>'member','joined_at'=>now()]);
        Message::create(['conversation_id'=>$group->id,'from'=>$owner->id,'to'=>$owner->id,'message'=>'Evidence','type'=>'text']);
        $report = UserReport::create(['reporter_id'=>$member->id,'reported_id'=>$owner->id,'conversation_id'=>$group->id,'target_type'=>'group','reason'=>'Scam','status'=>'open']);

        $this->actingAs($admin)->get('/admin/reports/'.$report->id)->assertOk()->assertDontSee('Ban user');
        $this->actingAs($admin)->post('/admin/reports/'.$report->id.'/ban-group', ['reason'=>'Scam confirmed'])->assertRedirect();
        $this->assertNotNull($group->fresh()->banned_at);
        $this->assertNull($owner->fresh()->banned_at);
        $this->assertDatabaseHas('app_notifications', ['user_id'=>$owner->id,'type'=>'group_banned','actor_id'=>null]);
        $this->assertDatabaseHas('messages', ['conversation_id'=>$group->id,'type'=>'system','message'=>'Reported group was banned by moderation.']);

        Sanctum::actingAs($member);
        $this->postJson('/api/messages/store', ['conversation_hash'=>$group->hash,'message'=>'hello'])->assertForbidden();

        $this->actingAs($admin)->post('/admin/reports/'.$report->id.'/unban-group')->assertRedirect();
        $this->assertNull($group->fresh()->banned_at);
        $this->assertDatabaseHas('app_notifications', ['user_id'=>$owner->id,'type'=>'group_unbanned','actor_id'=>null]);
        $this->assertDatabaseHas('messages', ['conversation_id'=>$group->id,'type'=>'system','message'=>'Reported group was unbanned by moderation.']);
    }

    public function test_admin_cannot_use_social_account_actions()
    {
        $admin = User::factory()->create(['username'=>'no-block-admin','phone'=>'+20000000008','email_verified_at'=>now(),'phone_verified_at'=>now(),'is_admin'=>true]);
        $user = User::factory()->create(['username'=>'cannot-be-blocked-by-admin','phone'=>'+20000000009','email_verified_at'=>now(),'phone_verified_at'=>now()]);
        $conversation = Conversation::create(['type'=>'group','name'=>'Admin blocked from chat','created_by'=>$user->id]);
        ConversationParticipant::create(['conversation_id'=>$conversation->id,'user_id'=>$admin->id,'role'=>'member','joined_at'=>now()]);

        $this->actingAs($admin)->get('/')->assertRedirect('/admin/reports');
        $this->actingAs($admin)->get('/home')->assertRedirect('/admin/reports');
        $this->actingAs($admin)->get('/chat/'.$conversation->hash)->assertRedirect('/admin/reports');
        $this->actingAs($user)->get('/@'.$admin->username)->assertNotFound();
        Sanctum::actingAs($admin);
        $this->getJson('/api/profiles/search?handle=@no-block-admin')->assertOk()->assertJsonPath('users', []);
        $this->postJson('/api/blocks/'.$user->id)->assertForbidden();
        Sanctum::actingAs($user);
        $this->postJson('/api/blocks/'.$admin->id)->assertNotFound();
        $this->actingAs($admin)->post('/profile', ['name'=>'Changed','bio'=>'Nope'])->assertForbidden();
        $this->actingAs($admin)->delete('/user', ['password'=>'password'])->assertForbidden();
    }
}
