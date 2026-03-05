<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ClothsStyle;

class ClothsStyleSeeder extends Seeder
{
    public function run()
    {
        ClothsStyle::insert([
            ['cloths_product_type_id' => 1, 'name' => 'Casual Shirt', 'slug' => 'casual-shirt'],
            ['cloths_product_type_id' => 2, 'name' => 'Slim Jeans', 'slug' => 'slim-jeans'],
            ['cloths_product_type_id' => 3, 'name' => 'Round Neck T-Shirt', 'slug' => 'round-neck-tshirt'],
        ]);
    }
}