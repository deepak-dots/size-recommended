<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\ApiController;

use App\Http\Controllers\Controller;
use App\Jobs\ImportShoeCSVJob;
use App\Jobs\ImportSizeJob;
use App\Models\ShoeBrand;
use App\Models\ShoeGender;
use App\Models\ShoeMeasurementType;
use App\Models\ShoeSize;
use App\Models\ShoeStyle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ShoesSizeController extends ApiController
{
    public function index()
    {
        $sizes = ShoeSize::select('id', 'shoe_genders_id', 'us_size', 'uk_size', 'eu_size')
            ->orderBy('id', 'asc')
            ->get();
        return $this->successResponse($sizes, 'Shoe sizes retrieved successfully', 200);
    }

    // Find size based on user input
    public function findSize(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'brand_id' => 'required|integer|exists:shoe_brands,id',
            'shoe_type' => 'required|integer|exists:shoe_genders,id',
            'measurements' => 'required|array',
            'measurements.left' => 'required|array',
            'measurements.left.*' => 'required|numeric',
            'measurements.right' => 'required|array',
            'measurements.right.*' => 'required|numeric',
            'unit' => 'nullable|string|in:cm,inches',
            'insertRemoval' => 'nullable|boolean',
            'styleId' => 'nullable|integer|exists:shoe_styles,id'
        ]);

        if ($validator->fails()) {
            return $this->errorResponse($validator->errors()->first(), 422);
        }

        $brandId = $request->brand_id;
        $gender = ShoeGender::find($request->shoe_type);
        $unit = $request->unit ?? 'cm';
        $measurements = $request->measurements;
        $styleId = $request->styleId ?? null;
        $insertRemoval = $request->insertRemoval ?? false;

        $brand = ShoeBrand::with('measurementTypes')->find($brandId);
        $brandMeasurements = $brand->measurementTypes;

        $footLength = [];

        $measurements = $request->measurements;

        // Ensure arrays exist
        $leftArray  = $measurements['left'] ?? [];
        $rightArray = $measurements['right'] ?? [];

        // Get last values
        $lastLeftValue  = !empty($leftArray) ? end($leftArray) : null;
        $lastRightValue = !empty($rightArray) ? end($rightArray) : null;


        foreach ($brandMeasurements as $measurement) {

            $left  = $measurements['left'][$measurement->id]  ?? 0;
            $right = $measurements['right'][$measurement->id] ?? 0;

            if ($left <= 0 || $right <= 0) {
                continue;
            }

            // Left-right difference validation
            if ($unit === 'cm' && abs($left - $right) > 0.5) {
                return $this->successResponse(
                    null,
                    'Left and right foot measurements differ significantly. Consider trying both sizes.',
                    200
                );
            }

            if ($unit === 'inches' && abs($left - $right) > 0.2) {
                return $this->successResponse(
                    null,
                    'Left and right foot measurements differ significantly. Consider trying both sizes.',
                    200
                );
            }

            // Take larger foot
            $footLength[$measurement->id] = max($left, $right);
        }

        if (empty($footLength)) {
            return $this->errorResponse('Invalid measurements provided.', 422);
        }

        $sizeQuery = ShoeSize::with('shoeMeasurementType', 'shoeBrand', 'shoeGender', 'shoeStyle')
            ->where('shoe_genders_id', $gender->id)
            ->where('shoe_brands_id', $brandId);

        if ($styleId) {
            $sizeQuery->where('shoe_styles_id', $styleId);
        }

        // Insert removal buffer
        $insertBuffer = 0;


        if ($insertRemoval) {

            $group = strtolower(trim($gender->internal_group));

            if ($unit === 'cm') {

                if (in_array($group, ['adult', 'men', 'women'])) {
                    $insertBuffer = 1.4;
                } elseif (in_array($group, ['kids', 'kids & toddler', 'toddler'])) {
                    $insertBuffer = 1.1;
                } else {
                    $insertBuffer = 0.6;
                }
            } else { // inches

                if (in_array($group, ['adult', 'men', 'women'])) {
                    $insertBuffer = 0.56;
                } elseif (in_array($group, ['kids', 'kids & toddler', 'toddler'])) {
                    $insertBuffer = 0.43;
                } else {
                    $insertBuffer = 0.25;
                }
            }
        }

        // $matchedSizes = [];

        $candidateUkSizes = [];


        $maxSizes = ShoeSize::where('shoe_genders_id', $gender->id)
            ->where('shoe_brands_id', $brandId)
            ->when($styleId, function ($q) use ($styleId) {
                $q->where('shoe_styles_id', $styleId);
            })
            ->selectRaw('
            MAX(max_cm_size) as max_cm_size,
            MAX(max_in_size) as max_in_size
        ')
            ->first();

        if ($unit === 'cm') {
            $maxSizeValue = $maxSizes->max_cm_size;
        }

        if ($unit === 'inches') {
            $maxSizeValue = $maxSizes->max_in_size;
        }


        $removal_message = false;


        foreach ($footLength as $measurementId => $length) {
            // Slightly big check when insertRemoval is FALSE
            if (!$insertRemoval && $maxSizeValue) {

                $difference = $length - $maxSizeValue;

                if ($unit === 'cm') {

                    // Check approx 1.4 cm bigger (allow small tolerance)
                    if ($difference > 0 && $difference <= 1.4) {

                        return $this->successResponse(
                            null,
                            'Your measurement is slightly above the maximum size. You may consider enabling insert removal for better fitting.',
                            200
                        );
                    }
                } else { // inches

                    // 1.4 cm ≈ 0.55 inches
                    if ($difference > 0 && $difference <= 0.55) {

                        return $this->successResponse(
                            null,
                            'Your measurement is slightly above the maximum size. You may consider enabling insert removal for better fitting.',
                            200
                        );
                    }
                }
            }

            $effectiveLength = $length - $insertBuffer;

            if ($insertRemoval) {

                if ($length == $lastLeftValue) {
                    //$effectiveLength = $length - $insertBuffer;

                    $effectiveLength = $length - $insertBuffer;

                    $difference = $length - $maxSizeValue;
                } else if ($length == $lastRightValue) {
                    //$effectiveLength = $length - $insertBuffer;

                    $effectiveLength = $length - $insertBuffer;

                    $difference = $length - $maxSizeValue;
                } else {
                    $effectiveLength = $length;
                }
            } else {
                $effectiveLength = $length;
            }


            $query = clone $sizeQuery;

            $query->where('shoe_measurement_types_id', $measurementId)
                ->where(function ($q) use ($effectiveLength, $unit) {

                    if ($unit === 'cm') {

                        $tolerance = 0.3;

                        $q->where('min_cm_size', '<=', $effectiveLength + $tolerance)
                            ->where('max_cm_size', '>=', $effectiveLength - $tolerance);
                    } else {

                        $tolerance = 0.05;

                        $q->where('min_in_size', '<=', $effectiveLength + $tolerance)
                            ->where('max_in_size', '>=', $effectiveLength - $tolerance);
                    }
                });

            $ukSizesForMeasurement = $query->pluck('uk_size')->toArray();

            $candidateUkSizes[] = $ukSizesForMeasurement;
        }

        // Find common UK sizes across all measurements
        $commonUkSizes = call_user_func_array('array_intersect', $candidateUkSizes);


        $commonUkSizes = array_values(array_unique($commonUkSizes));
        sort($commonUkSizes);

        // If exactly one size found
        if (count($commonUkSizes) >= 1) {

            $recommendedUkSize = max($commonUkSizes);

            $finalSize = ShoeSize::with('shoeMeasurementType', 'shoeBrand', 'shoeGender', 'shoeStyle')
                ->where('shoe_genders_id', $gender->id)
                ->where('shoe_brands_id', $brandId)
                ->where('uk_size', $recommendedUkSize)
                ->when($styleId, function ($q) use ($styleId) {
                    $q->where('shoe_styles_id', $styleId);
                })
                ->first();

            return $this->successResponse([
                'recommended_size' => $finalSize,
                'all_sizes' => $commonUkSizes,
                'min_size' => min($commonUkSizes),
                'max_size' => max($commonUkSizes),
                'removal_message' => $removal_message,
                'is_between' => count($commonUkSizes) > 1
            ], 'Shoe size found successfully', 200);
        }

        return $this->successResponse(
            null,
            'Multiple shoe sizes found. Consider trying sizes: ' . implode(', ', $commonUkSizes),
            200
        );
    }


    public function importCSV(Request $request)
    {
        $validator = Validator::make($request->all(), [
            // 'csv_file' => 'required|file|mimes:csv|max:20480', // max 20MB
            'csv_file' => 'required|file|mimetypes:text/plain,text/csv,application/csv,application/vnd.ms-excel|max:20480',

        ]);

        if ($validator->fails()) {
            return $this->errorResponse($validator->errors()->first(), 422);
        }

        $path = Storage::disk('local')->put('imports', $request->file('csv_file'));
        ImportShoeCSVJob::dispatch($path);

        return $this->successResponse(null, 'CSV file uploaded and import job dispatched successfully', 200);
    }

    public function exportCSV(Request $request)
        {
            $brandId  = $request->brand_id ?? null;
            $genderId = $request->gender_id ?? null;

            $query = ShoeSize::with([
                'shoeBrand',
                'shoeGender',
                'shoeMeasurementType',
                'shoeStyle'
            ]);

            // Brand Filter
            if (!empty($brandId)) {
                $query->where('shoe_brands_id', $brandId);
            }

            // Gender Filter
            if (!empty($genderId)) {
                $query->where('shoe_genders_id', $genderId);
            }

            $sizes = $query->get();

            if ($sizes->isEmpty()) {
                return response()->json(['message' => 'No data found.'], 404);
            }

            /*
            |--------------------------------------------------------------------------
            | 🔥 Dynamic File Name (Brand + Gender)
            |--------------------------------------------------------------------------
            */

            $brandName  = 'all_brands';
            $genderName = 'all_genders';

            if (!empty($brandId)) {
                $brand = \App\Models\ShoeBrand::find($brandId);
                if ($brand) {
                    $brandName = strtolower(preg_replace('/[^A-Za-z0-9\-]/', '_', $brand->name));
                }
            }

            if (!empty($genderId)) {
                $gender = \App\Models\ShoeGender::find($genderId);
                if ($gender) {
                    $genderName = strtolower(preg_replace('/[^A-Za-z0-9\-]/', '_', $gender->name));
                }
            }

            $fileName = $brandName . '_' . $genderName . '_sizes_' . now()->timestamp . '.csv';

            /*
            |--------------------------------------------------------------------------
            | CSV Headers
            |--------------------------------------------------------------------------
            */

            $headers = [
                'brand_name',
                'size_category',
                'internal_group',
                'measurement_type',
                'measurement_name',
                'style',
                'width_group',
                'us_size',
                'uk_size',
                'eu_size',
                'value_cm_min',
                'value_cm_max',
                'value_inches_min',
                'value_inches_max',
            ];

            $callback = function () use ($sizes, $headers) {
                $file = fopen('php://output', 'w');
                fputcsv($file, $headers);

                foreach ($sizes as $size) {
                    fputcsv($file, [
                        $size->shoeBrand->name ?? '',
                        $size->shoeGender->name ?? '',
                        $size->shoeGender->internal_group ?? '',
                        $size->shoeMeasurementType->code ?? '',
                        $size->shoeMeasurementType->name ?? '',
                        $size->shoeStyle->name ?? '',
                        $size->shoeStyle->width_group ?? '',
                        $size->us_size,
                        $size->uk_size,
                        $size->eu_size,
                        $size->min_cm_size,
                        $size->max_cm_size,
                        $size->min_in_size,
                        $size->max_in_size,
                    ]);
                }

                fclose($file);
            };

            return response()->streamDownload($callback, $fileName, [
                "Content-Type" => "text/csv",
            ]);
    }

    public function downloadSampleCSV()
    {
        $fileName = 'sample_shoe_import.csv';

        $headers = [
            'brand_name',
            'size_category',
            'internal_group',
            'measurement_type',
            'measurement_name',
            'style',
            'width_group',
            'us_size',
            'uk_size',
            'eu_size',
            'value_cm_min',
            'value_cm_max',
            'value_inches_min',
            'value_inches_max',
        ];

        $sampleRows = [
            [
                'Nike',
                'Men',
                'adult',
                'FL',
                'Foot Length',
                'Sports',
                'Medium',
                '8',
                '7',
                '41',
                '25.0',
                '25.5',
                '9.84',
                '10.04'
            ]
        ];

        $callback = function () use ($headers, $sampleRows) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $headers);

            foreach ($sampleRows as $row) {
                fputcsv($file, $row);
            }

            fclose($file);
        };

        return response()->streamDownload($callback, $fileName, [
            "Content-Type" => "text/csv",
        ]);
    }
}
