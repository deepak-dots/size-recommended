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
        $shoeBrands = DB::table('shoe_brands')->get();
        $shoeMeasurements = DB::table('shoe_measurement_types')->get();

        foreach ($shoeBrands as $shoeBrand) {
            foreach ($shoeMeasurements as $shoeMeasurement) {
                if (($shoeBrand->name == 'Friendly Shoes' && $shoeMeasurement->code != 'E (instep)')|| $shoeBrand->name != 'Friendly Shoes' ) {
                    DB::table('shoe_brand_measurement_types')->insert([
                        'shoe_brands_id' => $shoeBrand->id,
                        'shoe_measurement_types_id' => $shoeMeasurement->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }
}
