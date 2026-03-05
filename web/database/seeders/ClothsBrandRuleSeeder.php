<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ClothsBrandRule;

class ClothsBrandRuleSeeder extends Seeder
{
    public function run()
    {
        ClothsBrandRule::insert([
            [
                'cloths_brand_id' => 1,
                'rule_key' => 'S',
                'rule_value' => json_encode([
                    'chest' => ['min' => 34, 'max' => 37],
                    'waist' => ['min' => 28, 'max' => 31],
                ]),
            ],
            [
                'cloths_brand_id' => 1,
                'rule_key' => 'M',
                'rule_value' => json_encode([
                    'chest' => ['min' => 38, 'max' => 40],
                    'waist' => ['min' => 32, 'max' => 34],
                ]),
            ],
            [
                'cloths_brand_id' => 1,
                'rule_key' => 'L',
                'rule_value' => json_encode([
                    'chest' => ['min' => 41, 'max' => 43],
                    'waist' => ['min' => 35, 'max' => 37],
                ]),
            ],
        ]);
    }
}