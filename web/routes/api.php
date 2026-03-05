<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ShoeSizeController;

use App\Http\Controllers\Api\V1\{
    BrandController,
    ShoeGenderController,
    ProductCategoryController,
    ShoeMeasurementController,
    ShoesSizeController,
    ShoeStyleController,
    ClothsSizeImportController,
    ClothsSizeFinderController,
    ClothsBrandsController,
    ClothsProductTypesController,
    ClothsStylesController,
    ClothesCategoryController,
    ClothsMeasurementController,
    ClothesSizeChartController,
    SizeReportController,
};

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Note: Manual Route::options block removed to let Laravel HandleCors middleware 
| manage preflight requests correctly.
*/

// Root test route
Route::get('/', function () {
    return response()->json(['message' => 'Hello API']);
});

// Prefix /proxy for your app
Route::prefix('proxy')->group(function () {

    // -----------------------------
    // Shoe size endpoints
    // -----------------------------
    Route::get('/brands', [ShoeSizeController::class, 'index']);
    Route::post('/find-size', [ShoeSizeController::class, 'store']);

    // -----------------------------
    // Versioned API v1
    // -----------------------------
    Route::prefix('v1')->group(function () {
        Route::get('/product-categories', [ProductCategoryController::class, 'getProductCategories']);
        Route::get('/brands-list', [BrandController::class, 'index']);
        Route::post('brands', [BrandController::class, 'store']);     
        Route::put('brands/{id}', [BrandController::class, 'update']);
        Route::delete('brands/{id}', [BrandController::class, 'destroy']); 
        Route::get('/shoe-genders/{shoe_brand_id}', [ShoeGenderController::class, 'index']);
        Route::get('/shoe-styles/{shoe_brand_id}/{shoe_gender_id}', [ShoeStyleController::class, 'index']);
        Route::get('/shoe-measurements', [ShoeMeasurementController::class, 'index']);
        
        // POST request for finding size
        Route::post('/shoes-sizes', [ShoesSizeController::class, 'findSize']);

        Route::post('/import-csv', [ShoesSizeController::class, 'importCSV']);
        Route::get('/export-csv', [ShoesSizeController::class, 'exportCSV']);
        Route::get('/sample-csv', [ShoesSizeController::class, 'downloadSampleCSV']);

        /*
        |--------------------------------------------------------------------------
        | Cloths Size Endpoints
        |--------------------------------------------------------------------------
        */

        Route::post('/clothes/import-csv', [ClothsSizeImportController::class, 'importClothCSV']);
        Route::get('/clothes/brands', [ClothsBrandsController::class, 'index']);
        Route::post('/clothes/brands', [ClothsBrandsController::class, 'store']);
        Route::put('/clothes/brands/{id}', [ClothsBrandsController::class, 'update']);
        Route::delete('/clothes/brands/{id}', [ClothsBrandsController::class, 'destroy']);
        Route::get('/clothes/clothes-categories/{brand_id}', [ClothesCategoryController::class, 'index']);
        Route::get('/clothes/clothes-product-types/{category_id}', [ClothsProductTypesController::class, 'index']);
        Route::get('/clothes/clothes-styles/{product_type_id}', [ClothsStylesController::class, 'index']);
        Route::get('/clothes/clothes-measurements', [ClothsMeasurementController::class, 'index']);
        Route::get('/clothes/clothes-size-charts', [ClothesSizeChartController::class, 'index']);
        Route::post('/clothes/clothes-sizes', [ClothsSizeFinderController::class, 'findClothSize']);

        // Send report on klaviyo and mail
          Route::post('/send-size-report', [SizeReportController::class, 'send']);
    });
});

