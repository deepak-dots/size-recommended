<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ShoeGender;
use App\Http\Controllers\Api\V1\ApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ShoeGenderController extends ApiController
{
    /**
     * Get all shoe genders
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request, $shoe_brand_id = null)
    {
        // Fetch all genders from the table
        $genders = ShoeGender::select('id', 'name')->where('shoe_brand_id', $shoe_brand_id)
            ->orderBy('id', 'asc') // optional: sort by ID
            ->get();

        // Return as JSON with success flag
        return $this->successResponse($genders, 'Shoe genders retrieved successfully', 200);
    }
}
