<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ClothsMeasurementField;
use Illuminate\Http\Response;
use App\Http\Controllers\Api\V1\ApiController;

class ClothsMeasurementController extends ApiController
{

    public function index(Request $request)
    {
        $style_id = $request->query('style_id');

        $measurements = ClothsMeasurementField::where('style_id', $style_id)
            ->get(['id', 'field_key', 'label', 'input_type']);

        if ($measurements->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No measurements found for this style'
            ], 404);
        }

        return $this->successResponse($measurements, 'Clothes measurements retrieved successfully', 200);
    }
}
