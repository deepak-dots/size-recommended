<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ClothsSizeChart;
use App\Models\ClothsMeasurementField;
use App\Models\ClothsBrandRule;
use App\Models\ClothSize;
use App\Http\Controllers\Api\V1\ApiController;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ClothsSizeFinderController extends ApiController
{
    /**
     * Get measurement fields for a style
     */

    public function findClothSize(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'brand_id' => 'required|exists:cloths_brands,id',
            'category_id' => 'nullable|exists:cloths_categories,id',
            'style_id' => 'nullable|exists:cloths_styles,id',
            'product_type_id' => 'nullable|exists:cloths_product_types,id',
            'measurements' => 'required|array',
            'measurements.*' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse($validator->errors()->first(), 422);
        }

        $brandId = $request->brand_id;
        $categoryId = $request->category_id;
        $productTypeId = $request->product_type_id;
        $styleId = $request->style_id ?? null;
        $measurements = $request->measurements;
        $unit = $request->unit ?? 'cm';

        // Base query for size charts
        $sizeChartQuery = ClothsSizeChart::query();

        if (!empty($productTypeId)) {
            $sizeChartQuery->whereHas('style', function ($q) use ($productTypeId) {
                $q->where('product_type_id', $productTypeId);
            });
        }

        if ($styleId) {
            $sizeChartQuery->where('style_id', $styleId);
        }

        $candidateCharts  = [];

        foreach ($measurements as $fieldKey => $inputValue) {

            // $normalizedKey = strtolower(trim($fieldKey));
            $normalizedKey = Str::snake(trim($fieldKey));

            $query = clone $sizeChartQuery;

            $query->whereHas('measurements', function ($q) use ($normalizedKey, $inputValue, $unit) {

                $q->whereRaw('LOWER(field_key) = ?', [$normalizedKey]);
                
                if ($unit === 'inch') {
                    $q->where(function ($sub) use ($inputValue) {
                        $sub->whereNull('min_value_inches')
                            ->orWhere('min_value_inches', '<=', $inputValue);
                    })->where(function ($sub) use ($inputValue) {
                        $sub->whereNull('max_value_inches')
                            ->orWhere('max_value_inches', '>=', $inputValue);
                    });
                } else { // default cm
                    $q->where(function ($sub) use ($inputValue) {
                        $sub->whereNull('min_value')
                            ->orWhere('min_value', '<=', $inputValue);
                    })->where(function ($sub) use ($inputValue) {
                        $sub->whereNull('max_value')
                            ->orWhere('max_value', '>=', $inputValue);
                    });
                }

                // ->where(function ($sub) use ($inputValue) {
                //     $sub->whereNull('min_value')
                //         ->orWhere('min_value', '<=', $inputValue);
                // })

                // ->where(function ($sub) use ($inputValue) {
                //     $sub->whereNull('max_value')
                //         ->orWhere('max_value', '>=', $inputValue);
                // });
            });

            $candidateCharts[] = $query->pluck('id')->toArray();
        }

        // Find intersection across all measurements
        if (empty($candidateCharts)) {
            return $this->successResponse(null, 'No matching size found', 200);
        }

        $commonChartIds = call_user_func_array('array_intersect', $candidateCharts);

        if (empty($commonChartIds)) {
            return $this->successResponse(null, 'No matching size found', 200);
        }

        $finalChart = ClothsSizeChart::with('style')
            ->whereIn('id', $commonChartIds)
            ->orderBy('id', 'desc')
            ->first();


        return $this->successResponse([
            'recommended_size' => [
                'uk_size' => $finalChart->uk_size,
                'style'   => $finalChart->style->name,
                'eu_size' => $finalChart->eu_size,
                'us_size' => $finalChart->us_size,
            ],
            'all_chart_ids' => $commonChartIds
        ], 'Cloth size found successfully', 200);
    }
}
