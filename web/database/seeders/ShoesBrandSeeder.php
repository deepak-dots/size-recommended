<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShoesBrandSeeder extends Seeder
{
    public function run()
    {
        $brands = [
            ['name' => 'BILLY Footwear'],
            ['name' => 'Friendly Shoes']
        ];

        foreach ($brands as $brand) {
            DB::table('shoe_brands')->updateOrInsert(
                ['name' => $brand['name']],
                ['created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
