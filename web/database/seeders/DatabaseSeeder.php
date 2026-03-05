<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            // ShoesBrandSeeder::class,
            // ShoesSizeChartSeeder::class,
            // BrandSeeder::class,
            // ProductCategorySeeder::class,
            // ShoesBrandSeeder::class,
            // GenderSeeder::class,
            // MeasurementTypeSeeder::class,
            // ShoeBrandMeasurementTypeSeeder::class,
            // ShoeStyleSeeder::class,
            // SizeSeeder::class,
            ClothsCategorySeeder::class,
            ClothsBrandSeeder::class,
            ClothsBrandRuleSeeder::class,
            ClothsProductTypeSeeder::class,
            ClothsStyleSeeder::class,
            ClothsMeasurementFieldSeeder::class,
            ClothsSizeChartSeeder::class,

        ]);
    }
}
