<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClothsBrand extends Model
{
    use HasFactory;

    protected $table = 'cloths_brands';

    protected $fillable = [
        'name',
    ];

    public function productTypes()
    {
        return $this->hasMany(ClothsProductType::class, 'cloths_brand_id');
    }

    public function measurementFields()
    {
        return $this->hasMany(ClothsMeasurementField::class, 'cloths_brand_id');
    }

    public function rules()
    {
        return $this->hasMany(ClothsBrandRule::class, 'cloths_brand_id');
    }
}