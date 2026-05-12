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
        $sizes = ShoeSize::select('id', 'shoe_genders_id', 'us_size', 'uk_size', 'eu_size', 'width_group')
            ->orderBy('id', 'asc')
            ->get();
        return $this->successResponse($sizes, 'Shoe sizes retrieved successfully', 200);
    }

    private function getStyleGroup($styleName)
    {
        $styleName = strtolower($styleName);

        if (str_contains($styleName, 'goat')) {
            return 'GOAT';
        }

        if (str_contains($styleName, 'classic') || str_contains($styleName, 'cs')) {
            return 'CLASSIC';
        }

        if (str_contains($styleName, 'sensory')) {
            return 'SENSORY';
        }

        return 'OTHER';
    }


    private function getWidthType($measurementType)
    {
        $code = strtolower($measurementType->code ?? '');

        if ($code === 'a') return 'A';
        if ($code === 'd') return 'D';
        if ($code === 'e') return 'E';

        return null;
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
            'styleId' => 'nullable|integer|exists:shoe_styles,id',
            'style' => 'nullable|string',
            'width_group' => 'nullable|string',
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

            // 1. Get width type
            $type = $this->getWidthType($measurement);

            // 2. STRICT VALIDATION (IMPORTANT FIX)
            $allowedTypes = ['A', 'D', 'E']; // change if A is also valid

            if (!in_array($type, $allowedTypes)) {
                return $this->errorResponse(
                    "Unsupported measurement type detected: " . ($measurement->code ?? 'UNKNOWN'),
                    422
                );
            }

            // 3. Get input safely
            $left  = $measurements['left'][$measurement->id] ?? null;
            $right = $measurements['right'][$measurement->id] ?? null;

            // 4. Missing input check
            if ($left === null || $right === null) {
                return $this->errorResponse(
                    "Missing measurement input for type: " . $type,
                    422
                );
            }

            // 5. Invalid value check
            if ($left <= 0 || $right <= 0) {
                return $this->errorResponse(
                    "Invalid measurement values for type: " . $type,
                    422
                );
            }

            // 6. Left-right difference validation
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

            // 7. Take larger foot
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
        $nearMatch = false; 

        $typeMap = [];

        foreach ($brandMeasurements as $m) {
            $typeMap[$m->id] = $this->getWidthType($m);
        }


        foreach ($footLength as $measurementId => $length) {

            // Slightly big check when insertRemoval is FALSE
            if (!$insertRemoval && $maxSizeValue) {

                $difference = $length - $maxSizeValue;

                if ($unit === 'cm') {

                    // OLD LOGIC (UNCHANGED)
                    if ($difference > 0 && $difference <= 0.4) {
                        // return $this->successResponse(
                        //     null,
                        //     'Your measurement is slightly above the maximum size. You may consider enabling insert removal for better fitting.',
                        //     200
                        // );
                        $removal_message = "Your measurement is slightly above the maximum size. You may consider enabling insert removal for better fitting.";
                    }
                } else { // inches

                    // OLD LOGIC (UNCHANGED)
                    if ($difference > 0 && $difference <= 0.5) {
                        // return $this->successResponse(
                        //     null,
                        //     'Your measurement is slightly above the maximum size. You may consider enabling insert removal for better fitting.',
                        //     200
                        // );
                        $removal_message = "Your measurement is slightly above the maximum size. You may consider enabling insert removal for better fitting.";
                    }
                }
            }

            // -------------------------------
            // EFFECTIVE LENGTH CALCULATION
            // -------------------------------

            $effectiveLength = $length - $insertBuffer;

            if ($insertRemoval) {

                if ($length == $lastLeftValue) {
                    $effectiveLength = $length - $insertBuffer;
                } else if ($length == $lastRightValue) {
                    $effectiveLength = $length - $insertBuffer;
                } else {
                    $effectiveLength = $length;
                }

            } else {
                $effectiveLength = $length;
            }


            // -------------------------------
            //  NEW FIX: STORE NEAR MATCH FLAG (IMPORTANT)
            // -------------------------------


            // NEW: Track near matches (D/E both)
            if (!isset($nearMatch)) {
                $nearMatch = false;
            }


            $query = clone $sizeQuery;

            $type = $typeMap[$measurementId] ?? null;

            if ($type === 'A') {
                $tolerance = 0;
            } else {
                $tolerance = ($unit === 'cm') ? 0.1 : 0.3;
            }

            $query->where('shoe_measurement_types_id', $measurementId)
                ->where(function ($q) use ($effectiveLength, $unit, $type) {

                    if ($unit === 'cm') {

                        if ($type === 'A') {
                            //  STRICT MATCH
                            $q->where('min_cm_size', '<=', $effectiveLength)
                            ->where('max_cm_size', '>=', $effectiveLength);
                        } else {
                            //  ONLY WIDTH TOLERANCE
                            $q->where('min_cm_size', '<=', $effectiveLength + 0.1)
                            ->where('max_cm_size', '>=', $effectiveLength - 0.1);
                        }

                    } else {

                        if ($type === 'A') {
                            $q->where('min_in_size', '<=', $effectiveLength)
                            ->where('max_in_size', '>=', $effectiveLength);
                        } else {
                            $q->where('min_in_size', '<=', $effectiveLength + 0.3)
                            ->where('max_in_size', '>=', $effectiveLength - 0.3);
                        }

                    }
                });
            
            $results = $query->get();

            if ($results->isEmpty()) {
                continue;
            }

            $ukSizesForMeasurement = $results->pluck('uk_size')->toArray();

            //  FIX: Near match detection (correct place)
            if ($results->isEmpty()) {

                $nearCheck = clone $sizeQuery;

                //  FIX: define tolerance here
                $type = $typeMap[$measurementId] ?? null;

                if ($type === 'A') {
                    $tolerance = 0;
                } else {
                    $tolerance = ($unit === 'cm') ? 0.1 : 0.3;
                }

                if ($unit === 'cm') {
                    $nearCheck->where('shoe_measurement_types_id', $measurementId)
                        ->where('max_cm_size', '<', $effectiveLength)
                        ->whereRaw('? - max_cm_size <= ?', [$effectiveLength, $tolerance]);
                } else {
                    $nearCheck->where('shoe_measurement_types_id', $measurementId)
                        ->where('max_in_size', '<', $effectiveLength)
                        ->whereRaw('? - max_in_size <= ?', [$effectiveLength, $tolerance]);
                }

                if ($nearCheck->exists()) {
                    $nearMatch = true;
                }
            }

           

            $candidateUkSizes[] = $ukSizesForMeasurement;
        }

        // Find common UK sizes across all measurements
       if (empty($candidateUkSizes)) {
            return $this->errorResponse('No matching sizes found.', 422);
        }

        $commonUkSizes = array_intersect(...$candidateUkSizes);

        //  STEP: FILTER ONLY BY A (CRITICAL FIX)

        $aFilteredSizes = [];

        $aValue = null;

        // get A value once
        foreach ($brandMeasurements as $m) {
            if ($this->getWidthType($m) === 'A') {
                $aValue = $footLength[$m->id] ?? null;
                break;
            }
        }

        foreach ($commonUkSizes as $ukSize) {

            $row = ShoeSize::where('shoe_genders_id', $gender->id)
                ->where('shoe_brands_id', $brandId)
                ->where('uk_size', $ukSize)
                ->whereHas('shoeMeasurementType', function ($q) {
                    $q->where('code', 'A');
                })
                ->first();

            if (!$row || !$aValue) continue;

            $min = $unit === 'cm' ? $row->min_cm_size : $row->min_in_size;
            $max = $unit === 'cm' ? $row->max_cm_size : $row->max_in_size;

            // ❗ STRICT A MATCH (NO TOLERANCE)
            if ($aValue >= $min && $aValue <= $max) {
                $aFilteredSizes[] = $ukSize;
            }
        }

        // override sizes
        $commonUkSizes = $aFilteredSizes;

       // $commonUkSizes = array_values(array_unique($commonUkSizes));
        //  sort($commonUkSizes);

        //  ADD THIS BLOCK HERE (IMPORTANT)
        if (empty($commonUkSizes) && !empty($nearMatch)) {
            return $this->successResponse(
                null,
                "⚠ Your foot is slightly wider. Try GOAT or SENSORY for better fit.",
                200
            );
        }


        $commonUkSizes = array_values(array_unique($commonUkSizes));
        sort($commonUkSizes);

        // If exactly one size found
        if (count($commonUkSizes) >= 1) {

            sort($commonUkSizes);
           // $recommendedUkSize = max($commonUkSizes);

           $recommendedUkSize = null;
            $closestDiff = PHP_INT_MAX;

            foreach ($commonUkSizes as $ukSize) {

                $sizeRows = ShoeSize::where('shoe_genders_id', $gender->id)
                    ->where('shoe_brands_id', $brandId)
                    ->where('uk_size', $ukSize)
                    ->get();

                foreach ($sizeRows as $row) {

                    $type = $this->getWidthType($row->shoeMeasurementType);

                    //  ONLY FOOT LENGTH (A)
                    if ($type !== 'A') {
                        continue;
                    }

                    $min = $unit === 'cm' ? $row->min_cm_size : $row->min_in_size;
                    $max = $unit === 'cm' ? $row->max_cm_size : $row->max_in_size;

                    $mid = ($min + $max) / 2;

                    // get A value
                    $aValue = null;
                    foreach ($brandMeasurements as $m) {
                        if ($this->getWidthType($m) === 'A') {
                            $aValue = $footLength[$m->id] ?? null;
                            break;
                        }
                    }

                    if ($aValue === null) continue;

                    $diff = abs($aValue - $mid);

                    if ($diff < $closestDiff) {
                        $closestDiff = $diff;
                        $recommendedUkSize = $ukSize;
                    }
                }
            }

            $finalSizes = ShoeSize::with('shoeMeasurementType', 'shoeBrand', 'shoeGender', 'shoeStyle')
            ->where('shoe_genders_id', $gender->id)
            ->where('shoe_brands_id', $brandId)
            ->where('uk_size', $recommendedUkSize)
            ->when($styleId, function ($q) use ($styleId) {
                $q->where('shoe_styles_id', $styleId);
            })
            ->get();

            $bestMatch = null;
            $bestScore = PHP_INT_MAX;

            foreach ($finalSizes as $sizeRow) {

                $score = 0;

                foreach ($brandMeasurements as $measurement) {

                    $value = $footLength[$measurement->id] ?? null;

                    if (!$value) continue;

                    if ($unit === 'cm') {
                        $min = $sizeRow->min_cm_size;
                        $max = $sizeRow->max_cm_size;
                    } else {
                        $min = $sizeRow->min_in_size;
                        $max = $sizeRow->max_in_size;
                    }

                    // distance calculate
                    if ($value < $min) {
                        $score += ($min - $value);
                    } elseif ($value > $max) {
                        $score += ($value - $max);
                    }
                }

                if ($score < $bestScore) {
                    $bestScore = $score;
                    $bestMatch = $sizeRow;
                }
            }

            $finalSize = $bestMatch;

            $style = $finalSize->shoeStyle;
            $styleGroup = $this->getStyleGroup($style->name);
            $widthGroup = strtolower($style->width_group);

            $fitMessage = null;

            //A/ D/E values 
            $aValue = null;
            $dValue = null;
            $eValue = null;

            foreach ($brandMeasurements as $measurement) {

                $type = $this->getWidthType($measurement);

                if ($type === 'A') {
                    $aValue = $footLength[$measurement->id] ?? null;
                }

                if ($type === 'D') {
                    $dValue = $footLength[$measurement->id] ?? null;
                }

                if ($type === 'E') {
                    $eValue = $footLength[$measurement->id] ?? null;
                }
            }


            //  Apply only for Kids & Toddlers
            $allowedGroups = ['kids', 'toddler', 'kids & toddler', 'mens', 'womens'];
            $currentGroup = strtolower($gender->internal_group);

            if (in_array($currentGroup, $allowedGroups)) {

                // Get width range for current size (D/E)
                $currentSizeData = ShoeSize::where('shoe_genders_id', $gender->id)
                    ->where('shoe_brands_id', $brandId)
                    ->where('uk_size', $recommendedUkSize)
                    ->when($styleId, function ($q) use ($styleId) {
                        $q->where('shoe_styles_id', $styleId);
                    })
                    ->get();
            
                $dMin = $dMax = $eMin = $eMax = null;

                foreach ($currentSizeData as $row) {
                    $type = $this->getWidthType($row->shoeMeasurementType);

                    if ($type === 'D') {
                        $dMin = isset($dMin) ? min($dMin, $row->min_cm_size) : $row->min_cm_size;
                        $dMax = isset($dMax) ? max($dMax, $row->max_cm_size) : $row->max_cm_size;
                    }

                    if ($type === 'E') {
                        $eMin = isset($eMin) ? min($eMin, $row->min_cm_size) : $row->min_cm_size;
                        $eMax = isset($eMax) ? max($eMax, $row->max_cm_size) : $row->max_cm_size;
                    }
                }

                // GOAT → narrow check
                // GOAT → narrow check (WITH 0.3 tolerance)
                if (str_contains(strtolower($styleGroup), 'goat')) {

                    $tolerance = 0;
                    $isNarrow = false;

                    // D check
                    if (
                        $dValue !== null && $dMin !== null &&
                        $dValue < $dMin &&
                        ($dMin - $dValue) <= $tolerance
                    ) {
                        $isNarrow = true;
                    }

                    //  ADD THIS (E check missing earlier)
                    if (
                        $eValue !== null && $eMin !== null &&
                        $eValue < $eMin &&
                        ($eMin - $eValue) <= $tolerance
                    ) {
                        $isNarrow = true;
                    }

                    if ($isNarrow) {
                        $fitMessage = "⚠ Your foot is slightly narrower. Try CLASSIC or SENSORY for better fit (medium width available).";
                    }
                }


                // CLASSIC → wide check (D + E both)
                // CLASSIC → wide check (WITH 0.3 tolerance)
                if (str_contains(strtolower($styleGroup), 'classic')) {
                //echo $eValue . ' vs ' . $eMax; // DEBUG
                   //   NEW: E slightly above range (like removal message)
                    if (
                        $eValue !== null && $eMax !== null &&
                        $eValue > $eMax &&
                        ($eValue - $eMax) <= 0.4
                    ) {
                        $fitMessage = "⚠ Your foot width is slightly above the supported range. Try GOAT or SENSORY for better fit.";
                    }

                    $isWide = false;

                    // tolerance
                    $tolerance = 0;

                    // D check (only upto +0.3)
                    if (
                        $dValue !== null && $dMax !== null &&
                        $dValue > $dMax &&
                        ($dValue - $dMax) <= $tolerance
                    ) {
                        $isWide = true;
                    }

                    // E check (only upto +0.3)  FIX
                    if (
                        $eValue !== null && $eMax !== null &&
                        $eValue > $eMax &&
                        ($eValue - $eMax) <= $tolerance
                    ) {
                        $isWide = true;
                    }

                    if ($isWide) {
                        $fitMessage = "⚠ Your foot is slightly wider. Try GOAT or SENSORY for better fit (extra-wide options available).";
                    }
                }

            }    

            return $this->successResponse([
                'recommended_size' => $finalSize,
                'all_sizes' => $commonUkSizes,
                'min_size' => min($commonUkSizes),
                'max_size' => max($commonUkSizes),
                'fit_message' => $fitMessage, //  NEW
                'removal_message' => $removal_message,
                'is_between' => count($commonUkSizes) > 1 && count($aFilteredSizes) > 1
            ], 'Shoe size found successfully', 200);
        }

       if (!empty($removal_message)) {
            return $this->successResponse(null, $removal_message, 200);
        }

        return $this->successResponse(
            null,
            'We could not confidently match your size. Please review your measurements.',
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
}
