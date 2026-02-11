<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\ApiController;
use App\Models\ShoeStyle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ShoeStyleController extends ApiController
{
    public function index(Request $request, $shoe_brand_id = null, $shoe_gender_id = null)
    {
        if(!$shoe_brand_id) {
            return $this->errorResponse('Shoe brand ID is required', 400);
        }
        if(!$shoe_gender_id) {
            return $this->errorResponse('Shoe gender ID is required', 400);
        }
            
        // Fetch shoe styles based on brand and gender
        $shoeStyles = ShoeStyle::where('shoe_brands_id', $shoe_brand_id)
            ->where('shoe_genders_id', $shoe_gender_id)
            ->get();
        return $this->successResponse($shoeStyles, 'Shoe styles retrieved successfully', 200);
    }
}
