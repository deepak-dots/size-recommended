<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ClothsStyle;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V1\ApiController;

class ClothsStylesController extends ApiController
{
    /**
     * Return all styles for a given product type (and optionally brand)
     */
    public function index($product_type_id)
    {
        $styles = ClothsStyle::select('id', 'name', 'product_type_id')
            ->where('product_type_id', $product_type_id)
            ->orderBy('id', 'asc')
            ->get();

        return $this->successResponse($styles, 'Clothes styles retrieved successfully', 200);
    }
}