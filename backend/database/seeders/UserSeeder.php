<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Create admin user
        DB::table('users')->insert([
            'name' => 'Razan Dwekat',
            'email' => 'razan@gmail.com',
            'password' => Hash::make('123456'),
            'role' => 'admin',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create manager user
        DB::table('users')->insert([
            'name' => 'Ahmed Manager',
            'email' => 'ahmed@example.com',
            'password' => Hash::make('123456'),
            'role' => 'manager',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create employee user
        DB::table('users')->insert([
            'name' => 'Mohamed Employee',
            'email' => 'mohamed@example.com',
            'password' => Hash::make('123456'),
            'role' => 'employee',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
