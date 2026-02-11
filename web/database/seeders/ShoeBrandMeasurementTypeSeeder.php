<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShoeBrandMeasurementTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $shoeBrands= DB::table('shoe_brands')->pluck('id');
        $shoeMeasurements = DB::table('shoe_measurement_types')->pluck('id');

        foreach ($shoeBrands as $shoeBrand) {
            foreach ($shoeMeasurements as $shoeMeasurement) {
                DB::table('shoe_brand_measurement_types')->insert([
                    'shoe_brands_id' => $shoeBrand,
                    'shoe_measurement_types_id' => $shoeMeasurement,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
