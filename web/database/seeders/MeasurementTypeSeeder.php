<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MeasurementTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('shoe_measurement_types')->insert([
            ['code' => 'A', 'name' => 'Foot Length', 'description' => 'Actual foot or brace length', 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'D', 'name' => 'Ball Circumference', 'description' => 'Circumference at ball', 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'E (instep)', 'name' => 'Instep Circumference', 'description' => 'Instep / ankle circumference', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
