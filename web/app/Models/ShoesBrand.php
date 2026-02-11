<?php

// 1. app/Models/ShoesBrand.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShoesBrand extends Model
{
    protected $fillable = ['name'];

    public function sizeCharts(): HasMany
    {
        return $this->hasMany(ShoesSizeChart::class, 'brand_id');
    }
}
