<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClothsCategory extends Model
{
    use HasFactory;

    protected $table = 'cloths_categories';

    protected $fillable = [
        'name',
        'brand_id',
    ];

    public function productTypes()
    {
        return $this->hasMany(ClothsProductType::class, 'cloths_category_id');
    }
}