<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('product_categories')->insert([
            ['name' => 'Shoes','created_at' => now(), 'updated_at' => now()],
            ['name' => 'Clothing','created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
