<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShoeSize extends Model
{
    use HasFactory;

    public function shoeMeasurementType()
    {
        return $this->belongsTo(ShoeMeasurementType::class, 'shoe_measurement_types_id');
    }
    public function shoeBrand()
    {
        return $this->belongsTo(ShoeBrand::class, 'shoe_brands_id');
    }
    public function shoeGender()
    {
        return $this->belongsTo(ShoeGender::class, 'shoe_genders_id');
    }
    public function shoeStyle()
    {
        return $this->belongsTo(ShoeStyle::class, 'shoe_styles_id');
    }
}
