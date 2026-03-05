<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ClothsMeasurementField;

class ClothsMeasurementFieldSeeder extends Seeder
{
    public function run()
    {
        ClothsMeasurementField::insert([
            ['cloths_brand_id' => 1, 'field_key' => 'chest', 'label' => 'Chest', 'unit' => 'cm', 'is_required' => true, 'is_critical' => true],
            ['cloths_brand_id' => 1, 'field_key' => 'waist', 'label' => 'Waist', 'unit' => 'cm', 'is_required' => true, 'is_critical' => false],
        ]);
    }
}