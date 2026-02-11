<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ShoesSizeChart;

class ShoesSizeChartSeeder extends Seeder
{
    public function run()
    {
        $brandBillyId = 1; // Billy Footwear
        $brandFriendlyId = 2; // Friendly Shoes

        $sizes = [
            // ===== BILLY WOMEN =====
            [
                'brand_id' => $brandBillyId,
                'brand_name' => 'Billy',
                'collection' => 'Main',
                'category' => 'Women',
                'width_label' => 'Medium',
                'us_size' => '6',
                'eu_size' => '36-37',
                'uk_size' => '4',
                'length_a' => 23.2,
                'footbed_b' => 20.3,
                'footbed_w_c' => 21.3,
                'ball_circ_d' => 25.4,
                'ankle_circ_e' => 27.3,
            ],
            [
                'brand_id' => $brandBillyId,
                'brand_name' => 'Billy',
                'collection' => 'Main',
                'category' => 'Women',
                'width_label' => 'Wide',
                'us_size' => '6',
                'eu_size' => '36-37',
                'uk_size' => '4',
                'length_a' => 23.2,
                'footbed_b' => 20.3,
                'footbed_w_c' => 21.3,
                'ball_circ_d' => 25.7,
                'ankle_circ_e' => 27.6,
            ],
            // ... Add other Billy Women sizes here
            // ===== BILLY MEN =====
            [
                'brand_id' => $brandBillyId,
                'brand_name' => 'Billy',
                'collection' => 'Main',
                'category' => 'Men',
                'width_label' => 'Medium',
                'us_size' => '7',
                'eu_size' => '40',
                'uk_size' => '6.5',
                'length_a' => 24.8,
                'footbed_b' => 24.8,
                'footbed_w_c' => 25.4,
                'ball_circ_d' => 24.8,
                'ankle_circ_e' => 29.2,
            ],
            // ... Add other Billy Men sizes
            // ===== BILLY KIDS =====
            [
                'brand_id' => $brandBillyId,
                'brand_name' => 'Billy',
                'collection' => 'Main',
                'category' => 'Kids',
                'width_label' => 'Medium',
                'us_size' => '5',
                'eu_size' => '20',
                'uk_size' => '4 Toddler',
                'length_a' => 12.2,
                'footbed_b' => 15.2,
                'footbed_w_c' => 15.2,
                'ball_circ_d' => 15.2,
                'ankle_circ_e' => 18.4,
            ],
            [
                'brand_id' => $brandBillyId,
                'brand_name' => 'Billy',
                'collection' => 'Main',
                'category' => 'Kids',
                'width_label' => 'Medium',
                'us_size' => '6',
                'eu_size' => '22',
                'uk_size' => '5 Toddler',
                'length_a' => 13.2,
                'footbed_b' => 15.9,
                'footbed_w_c' => 15.9,
                'ball_circ_d' => 15.9,
                'ankle_circ_e' => 19.4,
            ],
            // ===== FRIENDLY SHOES KIDS =====
            [
                'brand_id' => $brandFriendlyId,
                'brand_name' => 'Friendly Shoes',
                'collection' => 'Main',
                'category' => 'Kids',
                'width_label' => 'Medium',
                'us_size' => '10',
                'eu_size' => 28,
                'uk_size' => '10',
                'length_a' => 17.1,
                'footbed_b' => 19.0,
                'footbed_w_c' => 19.0,
                'ball_circ_d' => 19.0,
                'ankle_circ_e' => 19.4,
            ],
            [
                'brand_id' => $brandFriendlyId,
                'brand_name' => 'Friendly Shoes',
                'collection' => 'Main',
                'category' => 'Kids',
                'width_label' => 'Medium',
                'us_size' => '11',
                'eu_size' => 29,
                'uk_size' => '11',
                'length_a' => 18.0,
                'footbed_b' => 18.6,
                'footbed_w_c' => 18.6,
                'ball_circ_d' => 18.6,
                'ankle_circ_e' => 20.0,
            ],
            // ... Continue Friendly Shoes sizes
        ];

        foreach ($sizes as $s) {
            // Update if brand_id + category + us_size exists, otherwise create
            ShoesSizeChart::updateOrCreate(
                [
                    'brand_id' => $s['brand_id'],
                    'category' => $s['category'],
                    'us_size' => $s['us_size'],
                ],
                $s
            );
        }
    }
}
