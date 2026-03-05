<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ClothsCategory;

class ClothsCategorySeeder extends Seeder
{
    public function run()
    {
        ClothsCategory::insert([
            ['id' => 1, 'name' => 'Shirts'],
            ['id' => 2, 'name' => 'Jeans'],
            ['id' => 3, 'name' => 'T-Shirts'],
        ]);
    }
}