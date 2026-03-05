<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Jobs\ImportClothCSVJob;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Api\V1\ApiController;

class ClothsSizeImportController extends ApiController
{

    public function importClothCSV(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'csv_file' => 'required|file|mimetypes:text/plain,text/csv,application/csv,application/vnd.ms-excel|max:20480',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse($validator->errors()->first(), 422);
        }

        $path = Storage::disk('local')->put('imports', $request->file('csv_file'));

        ImportClothCSVJob::dispatch($path);

        return $this->successResponse(null, 'Cloth CSV uploaded and import started', 200);
    }
}