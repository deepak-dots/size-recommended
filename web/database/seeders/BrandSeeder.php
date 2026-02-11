<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('shoe_brands')->insert([
            ['name' => 'BILLY Footwear','created_at' => now(),'updated_at' => now()],
            ['name' => 'Friendly Shoes','created_at' => now(),'updated_at' => now()],
        ]);
    }
}
