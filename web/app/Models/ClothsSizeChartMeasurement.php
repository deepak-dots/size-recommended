<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClothsSizeChartMeasurement extends Model
{
    use HasFactory;

    protected $table = 'cloths_size_chart_measurements';

    protected $fillable = [
        'size_chart_id',
        'field_key',
        'garment_value',
        'min_value',
        'max_value',
        'min_value_inches',
        'max_value_inches'
    ];

    public function sizeChart()
    {
        return $this->belongsTo(ClothsSizeChart::class, 'size_chart_id');
    }

}