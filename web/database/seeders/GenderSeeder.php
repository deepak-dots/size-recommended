<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GenderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $brands = DB::table('shoes_brands')->pluck('id');

         foreach ($brands as $brandId) {
            DB::table('shoe_genders')->insert([
                ['name' => 'Women', 'shoe_brand_id' => $brandId, 'internal_group' => 'adult', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Men', 'shoe_brand_id' => $brandId, 'internal_group' => 'adult', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }
    }
}
