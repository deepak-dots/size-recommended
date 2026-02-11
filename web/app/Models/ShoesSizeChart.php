<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShoesSizeChart extends Model
{
    protected $fillable = [
        'brand_id',
        'brand_name',
        'collection',
        'category',
        'width_label',
        'us_size',
        'eu_size',
        'uk_size',
        'length_a',
        'footbed_b',
        'footbed_w_c',
        'ball_circ_d',
        'ankle_circ_e',
    ];

    public function brand(): BelongsTo
    {
        return $this->belongsTo(ShoesBrand::class, 'brand_id');
    }
}
