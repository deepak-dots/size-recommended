<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ClothsProductType;

class ClothsProductTypeSeeder extends Seeder
{
    public function run()
    {
        ClothsProductType::insert([
            [
                'cloths_brand_id' => 1,
                'cloths_category_id' => 1, // Shirts
                'name' => 'Shirt',
                'slug' => 'shirt',
            ],
            [
                'cloths_brand_id' => 1,
                'cloths_category_id' => 2, // Jeans
                'name' => 'Jeans',
                'slug' => 'jeans',
            ],
            [
                'cloths_brand_id' => 2,
                'cloths_category_id' => 3, // T-Shirts
                'name' => 'T-Shirt',
                'slug' => 't-shirt',
            ],
        ]);
    }
}