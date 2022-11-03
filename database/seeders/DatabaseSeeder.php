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
            'message' => 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam, incidunt. Aliquam facilis optio excepturi dolorum.'
        ]);

        \App\Models\Message::create([
            'from' => 1,
            'to' => 3,
            'message' => 'Lorem ipsum dolor sit amet.'
        ]);

        \App\Models\Message::create([
            'from' => 1,
            'to' => 4,
            'message' => 'Lorem ipsum dolor sit amet consectetur adipisicing elit.'
        ]);

        \App\Models\Message::create([
            'from' => 4,
            'to' => 1,
            'message' => 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure quo error provident corporis consectetur quam maxime est laboriosam, magni facere minus facilis dolores ea architecto!'
        ]);

        \App\Models\Message::create([
            'from' => 2,
            'to' => 5,
            'message' => 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Libero ad labore ipsam rerum? Beatae, sunt reprehenderit consectetur cum delectus ullam, ipsa aperiam at commodi quaerat minus nisi dolores error, assumenda sit modi minima? Quae optio explicabo, sequi laudantium repellendus harum consequuntur rem quaerat ducimus dolore voluptas, qui molestiae non labore? Est aut dignissimos neque, dolorum, sunt vitae quidem dolorem assumenda at deserunt quae quo distinctio tempora, doloribus fuga iure?'
        ]);

        \App\Models\Message::create([
            'from' => 6,
            'to' => 7,
            'message' => 'Lorem, ipsum dolor.'
        ]);

        \App\Models\Message::create([
            'from' => 7,
            'to' => 1,
            'message' => 'Lorem, ipsum dolor. aaaaaa aaaaaa aaaaaa '
        ]);
    }
}
