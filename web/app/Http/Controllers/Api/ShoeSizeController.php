<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ShoesBrand;
use App\Models\ShoesSizeChart;

class ShoeSizeController extends Controller
{
    /**
     * Get all brands
     */
    public function index()
    {
        return ShoesBrand::all();
    }

    /**
     * Find the best shoe size based on user measurements
     */
    public function store(Request $request)
    {
        // ================= VALIDATION =================
        $request->validate([
            'brand_id' => 'required|exists:shoes_brands,id',
            'collection' => 'required|string',
            'category' => 'required|string',
            'unit' => 'required|in:cm,in',
            'measurements' => 'required|array',
            'measurements.left.A' => 'required|numeric',
            'measurements.right.A' => 'required|numeric',
            'width' => 'nullable|string',
        ]);

        $brand = ShoesBrand::findOrFail($request->brand_id);

        // ================= CATEGORY MAP =================
        $categoryMap = [
            'Shoes' => ['Women', 'Men', 'Kids', 'Toddler', 'Adult'],
            'Clothing' => ['Clothing'],
        ];

        $selectedCategory = $request->category;

        // ================= FOOT LENGTHS =================
        $leftLength  = floatval($request->measurements['left']['A']);
        $rightLength = floatval($request->measurements['right']['A']);

        // OLD logic (largest foot)
        $finalLength = max($leftLength, $rightLength);

        // Convert inches → cm
        if ($request->unit === 'in') {
            $leftLength  *= 2.54;
            $rightLength *= 2.54;
            $finalLength *= 2.54;
        }

        // ================= QUERY =================
        $query = ShoesSizeChart::where('brand_id', $brand->id)
            ->where('collection', $request->collection)
            ->whereIn('category', $categoryMap[$selectedCategory] ?? [$selectedCategory]);

        if (!empty($request->width)) {
            $query->where('width_label', $request->width);
        }

        $sizes = $query->get();

        if ($sizes->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No size data found',
            ], 404);
        }

        // ================= HELPER =================
        $findBestSize = function ($footLength, $sizes) {
            $bestSize = null;
            $minDiff = PHP_FLOAT_MAX;

            foreach ($sizes as $size) {
                $diff = abs($footLength - $size->length_a);
                if ($diff < $minDiff) {
                    $minDiff = $diff;
                    $bestSize = $size;
                }
            }

            $hardThreshold = 4;   // cm
            $approxThreshold = 2; // cm

            if ($minDiff > $hardThreshold) {
                return [
                    'error' => 'Measurements too different. Please contact support.'
                ];
            }

            return [
                'us_size' => $bestSize->us_size,
                'eu_size' => $bestSize->eu_size,
                'uk_size' => $bestSize->uk_size,
                'width_label' => $bestSize->width_label,
                'warning' => $minDiff > $approxThreshold
                    ? 'Measurements slightly different from chart. Choose size carefully.'
                    : null
            ];
        };

        // ================= LEFT / RIGHT =================
        $leftResult  = $findBestSize($leftLength, $sizes);
        $rightResult = $findBestSize($rightLength, $sizes);

        // ================= OLD SINGLE RESULT =================
        $bestSize = null;
        $minDiff = PHP_FLOAT_MAX;

        foreach ($sizes as $size) {
            $diff = abs($finalLength - $size->length_a);
            if ($diff < $minDiff) {
                $minDiff = $diff;
                $bestSize = $size;
            }
        }

        if ($minDiff > 4) {
            return response()->json([
                'success' => false,
                'message' => 'Measurements too different. Please contact support.'
            ], 422);
        }

        // ================= RESPONSE =================
        // ================= RESPONSE =================
            return response()->json([
                'success' => true,

                // 🔹 META INFO (STEP-3 needs this)
                'brand_name' => $brand->name,
                'collection' => $request->collection,
                'category'   => $selectedCategory,
                'width_label'=> $request->width ?? $bestSize->width_label,

                // 🔹 LEFT FOOT (React expects result.left)
                'left' => isset($leftResult['error']) ? null : [
                    'us_size' => $leftResult['us_size'],
                    'eu_size' => $leftResult['eu_size'],
                    'uk_size' => $leftResult['uk_size'],
                ],

                // 🔹 RIGHT FOOT (React expects result.right)
                'right' => isset($rightResult['error']) ? null : [
                    'us_size' => $rightResult['us_size'],
                    'eu_size' => $rightResult['eu_size'],
                    'uk_size' => $rightResult['uk_size'],
                ],

                // 🔹 OLD KEYS (DO NOT REMOVE – backward safe)
                'us_size' => $bestSize->us_size,
                'eu_size' => $bestSize->eu_size,
                'uk_size' => $bestSize->uk_size,

                'left_recommended'  => $leftResult,
                'right_recommended' => $rightResult,
            ]);

    }
}
