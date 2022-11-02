<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // \App\Models\User::factory(10)->create();

        \App\Models\User::create([
            'name' => 'Marcelo',
            'email' => 'Marcelo@marcelo.com',
            'password' => Hash::make('12345678')
        ]);

        \App\Models\User::create([
            'name' => 'Rodrigo',
            'email' => 'Rodrigo@rodrigo.com',
            'password' => Hash::make('12345678')
        ]);

        \App\Models\User::create([
            'name' => 'Cloe',
            'email' => 'Cloe@cloe.com',
            'password' => Hash::make('12345678')
        ]);

        \App\Models\User::create([
            'name' => 'Marcelo2',
            'email' => 'Marcelo2@marcelo.com',
            'password' => Hash::make('12345678')
        ]);

        \App\Models\User::create([
            'name' => 'Adm',
            'email' => 'adm@adm.com',
            'password' => Hash::make('12345678')
        ]);

        \App\Models\User::create([
            'name' => 'Usuario',
            'email' => 'Usuario@usuario.com',
            'password' => Hash::make('12345678')
        ]);

        \App\Models\User::create([
            'name' => 'Ana',
            'email' => 'Ana@ana.com',
            'password' => Hash::make('12345678')
        ]);

        \App\Models\Message::create([
            'from' => 1,
            'to' => 2,
            'message' => 'aaaaa1 aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa '
        ]);

        \App\Models\Message::create([
            'from' => 1,
            'to' => 3,
            'message' => 'aaaaaa2 aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa '
        ]);

        \App\Models\Message::create([
            'from' => 1,
            'to' => 4,
            'message' => 'aaaaaa3 aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa '
        ]);

        \App\Models\Message::create([
            'from' => 4,
            'to' => 1,
            'message' => 'aaaaaa4 aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa '
        ]);

        \App\Models\Message::create([
            'from' => 2,
            'to' => 5,
            'message' => 'aaaaaa5 aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa '
        ]);

        \App\Models\Message::create([
            'from' => 6,
            'to' => 7,
            'message' => 'aaaaaa6 aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa '
        ]);

        \App\Models\Message::create([
            'from' => 7,
            'to' => 1,
            'message' => 'aaaaaa7 aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa aaaaaa '
        ]);
    }
}
