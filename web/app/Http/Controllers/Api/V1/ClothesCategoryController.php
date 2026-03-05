<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ClothsCategory;
use App\Http\Controllers\Api\V1\ApiController;

class ClothesCategoryController extends ApiController
{
    public function index(Request $request, $brand_id = null)
    {
        $categories = ClothsCategory::select('id', 'name', 'brand_id')
            ->where('brand_id', $brand_id)
            ->orderBy('id', 'asc')
            ->get();

        return $this->successResponse($categories, 'Clothes categories retrieved successfully', 200);
    }
}
