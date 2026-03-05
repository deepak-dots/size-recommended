<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClothsBrandRule extends Model
{
    use HasFactory;

    protected $table = 'cloths_brand_rules';

    protected $fillable = [
        'cloths_brand_id',
        'rule_key',
        'rule_value',
    ];

    protected $casts = [
        'rule_value' => 'array',
    ];

    public function brand()
    {
        return $this->belongsTo(ClothsBrand::class, 'cloths_brand_id');
    }

    

}