<?php

namespace Database\Seeders;

use App\Models\ShoeBrand;
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
        $brands = ShoeBrand::with('measurementTypes')->get();


        $shoe_styles = DB::table('shoe_styles')->get();

        $womenSizes = [5, 6, 7];
        $menSizes   = [7, 8, 9];
        $kidsSizes  = [2, 3, 4];
        $toddlerSizes = [1, 2, 3];
        foreach ($brands as $brand) {
            $women = DB::table('shoe_genders')->where('name', 'Women')->where('shoe_brand_id',$brand->id)->value('id');
            $men   = DB::table('shoe_genders')->where('name', 'Men')->where('shoe_brand_id',$brand->id)->value('id');
            $kid = DB::table('shoe_genders')->where('name', 'Kids')->where('shoe_brand_id',$brand->id)->value('id');
            $toddler = DB::table('shoe_genders')->where('name', 'Toddler')->where('shoe_brand_id',$brand->id)->value('id');
            foreach ($brand->measurementTypes as $type) {
                foreach ($shoe_styles as $style) {
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

                    foreach ($kidsSizes as $size) {
                        DB::table('shoe_sizes')->insert([
                            'shoe_brands_id' => $brand->id,
                            'shoe_genders_id' => $kid,
                            'shoe_measurement_types_id' => $type->id,
                            'shoe_styles_id' => $style->id,
                            'us_size' => $size,
                            'uk_size' => $size - 1,
                            'eu_size' => $size + 33,
                            'min_cm_size' => 24 + ($size - 1) * 0.5,
                            'max_cm_size' => 24 + ($size - 1) * 0.5 + 1.5,
                            'min_in_size' => 9.45 + ($size - 1) * 0.2,
                            'max_in_size' => 9.45 + ($size - 1) * 0.2 + 0.6,
                            'created_at' => now(),
                            'updated_at' => now()
                        ]);
                    }
                    foreach ($toddlerSizes as $size) {
                        DB::table('shoe_sizes')->insert([
                            'shoe_brands_id' => $brand->id,
                            'shoe_genders_id' => $toddler,
                            'shoe_measurement_types_id' => $type->id,
                            'shoe_styles_id' => $style->id,
                            'us_size' => $size,
                            'uk_size' => $size - 1,
                            'eu_size' => $size + 33,
                            'min_cm_size' => 24 + ($size - 0) * 0.5,
                            'max_cm_size' => 24 + ($size - 0) * 0.5 + 1.5,
                            'min_in_size' => 9.45 + ($size - 0) * 0.2,
                            'max_in_size' => 9.45 + ($size - 0) * 0.2 + 0.6,
                            'created_at' => now(),
                            'updated_at' => now()
                        ]);
                    }
                }
            }
        }
    }
}
