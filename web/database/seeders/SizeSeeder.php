<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SizeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $brands= DB::table('shoe_brands')->get();

        $women = DB::table('shoe_genders')->where('name', 'Women')->value('id');
        $men   = DB::table('shoe_genders')->where('name', 'Men')->value('id');
        $shoe_measurement_types= DB::table('shoe_measurement_types')->get();
        $shoe_styles= DB::table('shoe_styles')->get();
        
        $womenSizes = [5, 6, 7, 8, 9, 10, 11];
        $menSizes   = [7, 8, 9, 10, 11, 12, 13];
        foreach($brands as $brand) {
            foreach($shoe_measurement_types as $type) {
                foreach($shoe_styles as $style) {
                    
                    foreach ($womenSizes as $size) {
                        DB::table('shoe_sizes')->insert([
                            'shoe_brands_id' => $brand->id,
                            'shoe_genders_id' => $women,
                            'shoe_measurement_types_id' => $type->id,
                            'shoe_styles_id' => $style->id,
                            'us_size' => $size,
                            'uk_size' => $size - 2,
                            'eu_size' => $size + 30,
                            'min_cm_size' => 22 + ($size - 5) * 0.5,
                            'max_cm_size' => 22 + ($size - 5) * 0.5 + 1.5,
                            'min_in_size' => 8.66 + ($size - 5) * 0.2,
                            'max_in_size' => 8.66 + ($size - 5) * 0.2 + 0.6,
                            'created_at' => now(),
                            'updated_at' => now()
                        ]);
                    }
            
                    foreach ($menSizes as $size) {
                        DB::table('shoe_sizes')->insert([
                            'shoe_brands_id' => $brand->id,
                            'shoe_genders_id' => $men,
                            'shoe_measurement_types_id' => $type->id,
                            'shoe_styles_id' => $style->id,
                            'us_size' => $size,
                            'uk_size' => $size - 1,
                            'eu_size' => $size + 33,
                            'min_cm_size' => 24 + ($size - 7) * 0.5,
                            'max_cm_size' => 24 + ($size - 7) * 0.5 + 1.5,
                            'min_in_size' => 9.45 + ($size - 7) * 0.2,
                            'max_in_size' => 9.45 + ($size - 7) * 0.2 + 0.6,
                            'created_at' => now(),
                            'updated_at' => now()
                        ]);
                    }
                }
            }
        }
    }
}
