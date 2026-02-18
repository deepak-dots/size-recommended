<?php

namespace Database\Seeders;

use App\Models\ShoeStyle;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShoeStyleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $shoeStyles = [
            'Core Skate',
            'Classic Lace High Tops',
            'Comfort',
        ];
        $brands = DB::table('shoe_brands')->pluck('id');
        $genders = DB::table('shoe_genders')->pluck('id');
        foreach ($shoeStyles as $style) {
            foreach ($brands as $brandId) {
                foreach ($genders as $genderId) {
                    ShoeStyle::create([
                        'name' => $style,
                        'width_group' => 'medium',
                        'model_group' => 'standard',
                        'shoe_brands_id' => $brandId,
                        'shoe_genders_id' => $genderId,
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                }
            }
        }
    }
}
