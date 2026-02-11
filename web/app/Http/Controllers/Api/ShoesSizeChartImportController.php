<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ShoesSizeChart;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ShoesSizeChartImportController extends Controller
{
    public function import(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|mimes:csv,txt',
        ]);

        $file = fopen($request->file('csv_file')->getRealPath(), 'r');
        $header = fgetcsv($file);

        if (!$header) {
            return response()->json([
                'success' => false,
                'message' => 'CSV file is empty or invalid',
            ], 422);
        }

        // normalize headers
        $header = array_map(fn($h) => strtolower(trim($h)), $header);

        DB::beginTransaction();
        try {
            $count = 0;
            while (($row = fgetcsv($file, 0, ",")) !== false) {
                $data = array_combine($header, $row);

                // insert into DB
                ShoesSizeChart::create([
                    'brand_id'     => $data['brand_id'] ?? null,
                    'brand_name'   => $data['brand_name'] ?? null,
                    'collection'   => $data['collection'] ?? null,
                    'category'     => $data['category'] ?? null,
                    'width_label'  => $data['width_label'] ?? null,
                    'us_size'      => $data['us_size'] ?? null,
                    'eu_size'      => $data['eu_size'] ?? null,
                    'uk_size'      => $data['uk_size'] ?? null,
                    'length_a'     => $data['length_a'] ?? null,
                    'footbed_b'    => $data['footbed_b'] ?? null,
                    'footbed_w_c'  => $data['footbed_w_c'] ?? null,
                    'ball_circ_d'  => $data['ball_circ_d'] ?? null,
                    'ankle_circ_e' => $data['ankle_circ_e'] ?? null,
                ]);

                $count++;
            }

            DB::commit();
            fclose($file);

            return response()->json([
                'success' => true,
                'message' => "$count rows imported successfully."
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            fclose($file);

            Log::error("CSV Import Error: ".$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => "Import failed: " . $e->getMessage(),
            ], 422);
        }
    }
}
