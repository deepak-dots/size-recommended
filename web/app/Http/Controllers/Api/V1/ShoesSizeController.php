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
        $brandMeasurement = ShoeBrand::find($brandId)->measurementTypes;
        $styleId = $request->styleId ?? null;
        $insertRemoval = $request->insertRemoval ?? false;
        $footLength = [];
        foreach ($brandMeasurement as $measurement) {
            if ($unit == 'cm' && abs($measurements['left'][$measurement->id] - $measurements['right'][$measurement->id]) > 0.5) {
                // If left and right measurements differ by more than 0.5 units, return a warning
                return $this->successResponse(null, 'Left and right foot measurements differ significantly. Consider trying both sizes.', 200);
            }
            if ($unit == 'inches' && abs($measurements['left'][$measurement->id] - $measurements['right'][$measurement->id]) > 0.2) {
                // If left and right measurements differ by more than 0.2 inches, return a warning
                return $this->successResponse(null, 'Left and right foot measurements differ significantly. Consider trying both sizes.', 200);
            }
            $footLength[$measurement->id] = max(
                $measurements['left'][$measurement->id],
                $measurements['right'][$measurement->id]
            );
        }
        $size = ShoeSize::with('shoeMeasurementType', 'shoeBrand', 'shoeGender', 'shoeStyle')
            ->where('shoe_genders_id', $gender->id)
            ->where('shoe_brands_id', $brandId);
        if ($styleId) {
            $size = $size->where('shoe_styles_id', $styleId);
        }
        $matchedSizes = [];
        $insertBuffer = 0;

        if ($insertRemoval) {
            if ($unit === 'cm') {
                // Adults vs Kids buffer (adjust condition if you have category flag)
                $insertBuffer = $gender->internal_group === 'adult'
                    ? 1.4   // Adults: 1.3–1.4 cm (use max safe value)
                    : 1.1;  // Kids/Toddler: up to 1.1 cm
            } else {
                $insertBuffer = $gender->internal_group === 'adult'
                    ? 0.56  // Adults: 9/16 inch
                    : 0.44; // Kids/Toddler: 7/16 inch
            }
        }

        $footLength = array_filter($footLength, fn ($v) => $v > 0);

        foreach ($footLength as $measurementId => $length) {

            $query = clone $size;

            $query->where('shoe_measurement_types_id', $measurementId)
                ->where(function ($q) use ($length, $unit, $insertBuffer) {
                    if ($unit === 'cm') {
                        $q->where('min_cm_size', '<=', $length)
                            //->where('max_cm_size', '>', $length - $insertBuffer);
                            ->where('max_cm_size', '>=', $length - $insertBuffer);
                    } elseif ($unit === 'inches') {
                        $q->where('min_in_size', '<=', $length)
                            //->where('max_in_size', '>', $length - $insertBuffer);
                            ->where('max_in_size', '>=', $length - $insertBuffer);    
                    }
                });

            //$matchedSize = $query->first();
            $matchedSize = $query->orderBy('uk_size', 'desc')->first();
            // dd($matchedSize);
            if (!$matchedSize) {
                return $this->successResponse(null,
                    'No matching shoe size found. Try adjusting measurements or check brand & shoe type.',
                    200
                );
            }

            $matchedSizes[] = $matchedSize;

        //     if ($matchedSize) {
        //         $matchedSizes[] = $matchedSize;
        //     }
        }

        // if (empty($matchedSizes)) {
        //     return $this->errorResponse(
        //         'No matching shoe size found. Try adjusting measurements or check brand & shoe type.',
        //         404
        //     );
        // }

        $ukSizes = collect($matchedSizes)->pluck('uk_size')->unique();
        if ($ukSizes->count() === 1) {
            // If all matched sizes have the same UK size, return that size
            return $this->successResponse($matchedSizes[0], 'Shoe size found successfully', 200);
        } else {
            // If there are multiple matched sizes with different UK sizes, return all matched sizes sorted by UK size
            return $this->successResponse(null,
                'Multiple shoe sizes found with different UK sizes. Consider trying sizes: ' . $ukSizes->implode(', '),
                200
            );
        }
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
}
