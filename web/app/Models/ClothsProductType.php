<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClothsProductType extends Model
{
    use HasFactory;

    protected $table = 'cloths_product_types';

    protected $fillable = [
        'category_id',
        'cloths_brand_id',
        'cloths_category_id',
        'name',
        'gender',
        'size_category',
    ];

    public function brand()
    {
        return $this->belongsTo(ClothsBrand::class, 'cloths_brand_id');
    }

    public function category()
    {
        return $this->belongsTo(ClothsCategory::class, 'cloths_category_id');
    }

    public function styles()
    {
        return $this->hasMany(ClothsStyle::class, 'product_type_id');
    }
}