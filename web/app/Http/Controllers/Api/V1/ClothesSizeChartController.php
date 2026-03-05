<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ClothsSizeChart;
use App\Http\Controllers\Api\V1\ApiController;

class ClothesSizeChartController extends ApiController
{
    public function index(Request $request)
    {
        $style_id = $request->query('style_id');

        $sizes = ClothsSizeChart::with('measurements')
            ->where('style_id', $style_id)
            ->orderBy('id', 'asc')
            ->get();

        return $this->successResponse($sizes, 'Clothes size charts retrieved successfully', 200);
    }
}
