<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClothsStyle extends Model
{
    use HasFactory;

    protected $table = 'cloths_styles';

    protected $fillable = [
        'product_type_id',
        'name',
    ];

    public function productType()
    {
        return $this->belongsTo(ClothsProductType::class, 'product_type_id');
    }

    public function sizeCharts()
    {
        return $this->hasMany(ClothsSizeChart::class, 'cloths_style_id');
    }
}