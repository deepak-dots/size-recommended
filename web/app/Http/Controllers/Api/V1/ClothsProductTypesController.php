<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ClothsProductType;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V1\ApiController;

class ClothsProductTypesController extends ApiController
{
    /**
     * Return all product types for a given brand
     */
     public function index($category_id)
    {
        $types = ClothsProductType::select('id', 'name', 'category_id', 'gender', 'size_category')
            ->where('category_id', $category_id)
            ->orderBy('id', 'asc')
            ->get();

        return $this->successResponse($types, 'Product types retrieved successfully', 200);
    }
}