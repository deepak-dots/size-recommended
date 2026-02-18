<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\ApiController;
use App\Models\ShoeBrand;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class BrandController extends ApiController
{
    // Get all brands
    public function index()
    {
        $brands = ShoeBrand::select('id', 'name', 'created_at', 'updated_at')
            ->orderBy('id', 'asc')
            ->get();

        return $this->successResponse($brands, 'Brands retrieved successfully', 200);
    }

    // Add new brand
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
            ]);

            $brand = ShoeBrand::create($validated);

            return $this->successResponse($brand, 'Brand created successfully', 201);
        } catch (ValidationException $e) {
            return response()->json(['error' => 'Validation failed', 'messages' => $e->errors()], 422);
        } catch (\Exception $e) {
            //\Log::error('Brand store error: '.$e->getMessage());
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    // Update brand
    public function update(Request $request, $id)
    {
        try {
            $brand = ShoeBrand::findOrFail($id);

            $validated = $request->validate([
                'name' => 'required|string|max:255',
            ]);

            $brand->update($validated);

            return $this->successResponse($brand, 'Brand updated successfully', 200);
        } catch (ValidationException $e) {
            return response()->json(['error' => 'Validation failed', 'messages' => $e->errors()], 422);
        } catch (\Exception $e) {
            //\Log::error('Brand update error: '.$e->getMessage());
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    // Delete brand
    public function destroy($id)
    {
        try {
            $brand = ShoeBrand::findOrFail($id);
            $brand->delete();

            return $this->successResponse(null, 'Brand deleted successfully', 200);
        } catch (\Exception $e) {
           /// \Log::error('Brand delete error: '.$e->getMessage());
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }
}