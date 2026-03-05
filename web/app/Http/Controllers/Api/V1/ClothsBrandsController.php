<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\V1\ApiController;
use App\Models\ClothsBrand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ClothsBrandsController extends ApiController
{
    /**
     * Return all brands from the database
     */
    public function index(Request $request)
    {
        // Optional: filter by category_id if sent in query
        $brands = ClothsBrand::select('id', 'name', 'created_at', 'updated_at')
            ->orderBy('id', 'asc')
            ->get();

        return $this->successResponse($brands, 'Clothes brands retrieved successfully', 200);
    }

    /**
     * POST: /clothes/brands
     * Create new brand
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:cloths_brands,name'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => $validator->errors()->first()
            ], 409);
        }

        $brand = ClothsBrand::create([
            'name' => $request->name
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Brand created successfully',
            'data' => $brand
        ], 201);
    }

    /**
     * PUT: /clothes/brands/{id}
     * Update brand
     */
    public function update(Request $request, $id)
    {
        $brand = ClothsBrand::find($id);

        if (!$brand) {
            return response()->json([
                'status' => false,
                'message' => 'Brand not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:cloths_brands,name,' . $id
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => $validator->errors()->first()
            ], 409);
        }

        $brand->update([
            'name' => $request->name
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Brand updated successfully',
            'data' => $brand
        ], 200);
    }

    /**
     * DELETE: /clothes/brands/{id}
     * Delete brand
     */
    public function destroy($id)
    {
        $brand = ClothsBrand::find($id);

        if (!$brand) {
            return response()->json([
                'status' => false,
                'message' => 'Brand not found'
            ], 404);
        }

        $brand->delete();

        return response()->json([
            'status' => true,
            'message' => 'Brand deleted successfully'
        ], 200);
    }
}