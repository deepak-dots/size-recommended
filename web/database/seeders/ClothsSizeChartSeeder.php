<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ClothsSizeChart;

class ClothsSizeChartSeeder extends Seeder
{
    public function run()
    {
        ClothsSizeChart::insert([
            [
                'cloths_style_id' => 1,
                'age_group' => 'Adult',
                'alpha_size' => 'S',
                'measurement_values' => json_encode([
                    'chest_min' => 34, 'chest_max' => 37,
                    'waist_min' => 28, 'waist_max' => 31
                ]),
            ],
            [
                'cloths_style_id' => 1,
                'age_group' => 'Adult',
                'alpha_size' => 'M',
                'measurement_values' => json_encode([
                    'chest_min' => 37, 'chest_max' => 40,
                    'waist_min' => 31, 'waist_max' => 34
                ]),
            ],
        ]);
    }
}