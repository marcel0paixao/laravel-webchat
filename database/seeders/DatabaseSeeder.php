<?php

namespace Database\Seeders;

use App\Models\{Friendship, User};
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $password = Hash::make('password');
        $users = [
            ['name' => 'Demo One', 'username' => 'demo_one', 'email' => 'demo1@example.com', 'phone' => '+5511999000001'],
            ['name' => 'Demo Two', 'username' => 'demo_two', 'email' => 'demo2@example.com', 'phone' => '+5511999000002'],
            ['name' => 'Demo Three', 'username' => 'demo_three', 'email' => 'demo3@example.com', 'phone' => '+5511999000003'],
            ['name' => 'Demo Four', 'username' => 'demo_four', 'email' => 'demo4@example.com', 'phone' => '+5511999000004'],
            ['name' => 'Admin Demo', 'username' => 'admin_demo', 'email' => 'admin@example.com', 'phone' => '+5511999000005', 'is_admin' => true],
        ];

        $created = collect($users)->map(fn(array $data) => User::updateOrCreate(
            ['email' => $data['email']],
            $data + ['password' => $password, 'email_verified_at' => now(), 'phone_verified_at' => now()]
        ));

        $first = $created->first();
        $created->skip(1)->each(fn(User $user) => Friendship::updateOrCreate(
            ['requester_id' => $first->id, 'addressee_id' => $user->id],
            ['status' => Friendship::ACCEPTED, 'accepted_at' => now()]
        ));
    }
}
