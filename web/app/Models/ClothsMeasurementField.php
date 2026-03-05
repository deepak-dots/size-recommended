<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClothsMeasurementField extends Model
{
    use HasFactory;

    protected $table = 'cloths_measurement_fields';

    protected $fillable = [
        'style_id',
        'field_key',
        'label',
        'input_type',
    ];

    public function style()
    {
        return $this->belongsTo(ClothsStyle::class, 'style_id');
    }
}