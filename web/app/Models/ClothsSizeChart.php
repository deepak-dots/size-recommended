<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClothsSizeChart extends Model
{
    use HasFactory;

    protected $table = 'cloths_size_charts';

    protected $fillable = [
        'style_id',
        'age_group',
        'alpha_size',
        'uk_size',
        'eu_size',
        'us_size',
        'display_order'
    ];

    protected $casts = [
        'measurement_values' => 'array',
    ];

    public function style()
    {
        return $this->belongsTo(ClothsStyle::class, 'style_id');
    }

    public function measurements()
    {
        return $this->hasMany(ClothsSizeChartMeasurement::class, 'size_chart_id');
    }
}