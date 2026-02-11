<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\V1\ApiController;
use App\Models\ShoeBrand;
use Illuminate\Http\Request;

class ShoeMeasurementController extends ApiController
{
    public function index(Request $request)
    {
        $shoeBrands = ShoeBrand::with('measurementTypes')->find($request->query('brand_id'));
        if (!$shoeBrands) {
            return $this->errorResponse('Shoe brand not found', 404);
        }
        return $this->successResponse($shoeBrands, 'Shoe measurements retrieved successfully', 200);
    }
}