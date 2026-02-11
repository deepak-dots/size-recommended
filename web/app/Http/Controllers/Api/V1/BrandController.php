<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ShoeBrand;
use App\Http\Controllers\Api\V1\ApiController;

class BrandController extends ApiController
{
    /**
     * Get all brands
     */
    public function index()
    {
        $brands = ShoeBrand::select('id', 'name')
            ->orderBy('id', 'asc') // optional: sort by ID
            ->get();
        return $this->successResponse($brands, 'Brands retrieved successfully', 200);
    }
}
