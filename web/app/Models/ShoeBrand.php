<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShoeBrand extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    public function measurementTypes()
    {
        return $this->belongsToMany(
            ShoeMeasurementType::class,
            'shoe_brand_measurement_types',
            'shoe_brands_id',
            'shoe_measurement_types_id'
        );
    }
}
