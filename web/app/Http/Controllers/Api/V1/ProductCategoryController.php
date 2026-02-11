<?php
namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use App\Http\Controllers\Api\V1\ApiController;
use App\Models\ProductCategory;

class ProductCategoryController extends ApiController
{
    /**
     * Get product categories
     */
    public function getProductCategories()
    {
        $categories = ProductCategory::all();
        return $this->successResponse($categories, 'Product categories retrieved successfully', 200);
    }

}