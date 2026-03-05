<?php

namespace App\Jobs;

use App\Models\ClothsBrand;
use App\Models\ClothsCategory;
use App\Models\ClothsProductType;
use App\Models\ClothsStyle;
use App\Models\ClothsMeasurementField;
use App\Models\ClothsSizeChart;
use App\Models\ClothsSizeChartMeasurement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ImportClothRowJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public array $row;
    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(array $row)
    {
        $this->row = $row;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {

        DB::beginTransaction();

        try {
            // 1. Brand
            $brand = ClothsBrand::firstOrCreate([
                'name' => $this->row['brand_name']
            ]);

            // 2. Category
            $category = ClothsCategory::firstOrCreate([
                'brand_id' => $brand->id,
                'name' => $this->row['category']
            ]);

            // 3. Product Type
            $productType = ClothsProductType::firstOrCreate([
                'category_id' => $category->id,
                'name' => $this->row['product_type'],
                'gender' => $this->row['gender'] ?? 'unisex',
                'size_category' => $this->row['size_category'] ?? null
            ]);

            // 4. Style
            $style = ClothsStyle::firstOrCreate([
                'product_type_id' => $productType->id,
                'name' => $this->row['style']
            ]);

            // 5. Measurement Field
            $measurementField = ClothsMeasurementField::firstOrCreate([
                'style_id' => $style->id,
                'field_key' => strtolower($this->row['measurement_name'])
            ], [
                'label' => $this->row['measurement_name'],
                'input_type' => 'number'
            ]);

            // 6. Size Chart
            $sizeChart = ClothsSizeChart::firstOrCreate([
                'style_id' => $style->id,
                'uk_size'  => $this->row['uk_size'],
            ], [
                'eu_size'  => $this->row['eu_size'] ?? null,
                'us_size'  => $this->row['us_size'] ?? null,
                'alpha_size' => $this->row['uk_size'],
            ]);
            // $sizeChart = ClothsSizeChart::firstOrCreate([
            //     'style_id' => $style->id,
            //     'age_group' => $this->row['uk_size'],
            // ]);

            // 7. Insert EU as HEIGHT automatically
            // if(!empty($this->row['eu_size'])){
            //     ClothsSizeChartMeasurement::updateOrCreate([
            //         'size_chart_id' => $sizeChart->id,
            //         'field_key' => 'height'
            //     ],[
            //         'max_value' => $this->row['eu_size']
            //     ]);
            // }

            // 8. Insert actual measurement
            ClothsSizeChartMeasurement::updateOrCreate([
                'size_chart_id' => $sizeChart->id,
                'field_key' => strtolower(str_replace(' ', '_', $this->row['measurement_name']))
            ], [
                // CM values
                'min_value' => is_numeric($this->row['value_cm_min'] ?? null)
                    ? $this->row['value_cm_min']
                    : null,

                'max_value' => is_numeric($this->row['value_cm_max'] ?? null)
                    ? $this->row['value_cm_max']
                    : null,

                // INCH values (if provided in CSV)
                'min_value_inches' => is_numeric($this->row['value_inch_min'] ?? null)
                    ? $this->row['value_inch_min']
                    : null,

                'max_value_inches' => is_numeric($this->row['value_inch_max'] ?? null)
                    ? $this->row['value_inch_max']
                    : null,
            ]);

            // Commit the transaction
            DB::commit();
        } catch (\Exception $e) {
            // Rollback if any exception occurs
            DB::rollBack();

            // Log the error with row data
            Log::error('ImportClothRowJob failed', [
                'error' => $e->getMessage(),
                'rowData' => $this->row,
                'trace' => $e->getTraceAsString()
            ]);

            // Optional: rethrow if you want the queue to mark it as failed
            throw $e;
        }
    }

    /**
     * 🔥 Runs ONLY when job fails permanently
     */
    public function failed(\Throwable $exception)
    {
        Log::error('ImportClothRowJob failed permanently: ' . $exception->getMessage(), ['row' => $this->row]);

        // ❌ Don't delete file here (keep for reprocessing)
    }
}
