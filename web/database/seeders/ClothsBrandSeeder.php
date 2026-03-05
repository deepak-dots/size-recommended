<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ClothsBrand;

class ClothsBrandSeeder extends Seeder
{
    public function run()
    {
        ClothsBrand::insert([
            ['id' => 1, 'cloths_category_id' => 1, 'name' => 'Levis', 'slug' => 'levis'],
            ['id' => 2, 'cloths_category_id' => 3, 'name' => 'Nike', 'slug' => 'nike'],
        ]);
    }
}