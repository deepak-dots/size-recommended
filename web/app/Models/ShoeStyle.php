<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShoeStyle extends Model
{
    use HasFactory;

    public function shoeCategory()
    {
        return $this->belongsTo(ShoeCategory::class, 'shoe_category_id');
    }
}
