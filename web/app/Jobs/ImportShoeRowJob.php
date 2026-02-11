<?php

namespace App\Jobs;

use App\Models\ShoeBrand;
use App\Models\ShoeGender;
use App\Models\ShoeMeasurementType;
use App\Models\ShoeSize;
use App\Models\ShoeStyle;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ImportShoeRowJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public array $rowData;
    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(array $rowData)
    {
        $this->rowData = $rowData;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $rowData = $this->rowData;
        DB::beginTransaction();

        try {
            $brand = ShoeBrand::whereRaw('LOWER(name) = LOWER(?)', [$rowData['brand_name']])->first();
            if (!$brand) {
                $brand = new ShoeBrand();
                $brand->name = $rowData['brand_name'];
                $brand->save();
            }
            $gender = ShoeGender::whereRaw('LOWER(name) = LOWER(?)', [$rowData['size_category']])->whereRaw('LOWER(internal_group) = LOWER(?)', [$rowData['internal_group']])->where('shoe_brand_id', $brand->id)->first();
            if (!$gender) {
                $gender = new ShoeGender();
                $gender->name = $rowData['size_category'];
                $gender->internal_group = $rowData['internal_group'];
                $gender->shoe_brand_id = $brand->id;
                $gender->save();
            }
            $measurementType = ShoeMeasurementType::whereRaw('LOWER(code) = LOWER(?)', [$rowData['measurement_type']])->whereRaw('LOWER(name) = LOWER(?)', [$rowData['measurement_name']])->first();
            if (!$measurementType) {
                $measurementType = new ShoeMeasurementType();
                $measurementType->code = $rowData['measurement_type'];
                $measurementType->name = $rowData['measurement_name'];
                $measurementType->save();
            }
            $brand->measurementTypes()->syncWithoutDetaching([
                $measurementType->id => [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);
            $style = ShoeStyle::whereRaw('LOWER(name) = LOWER(?)', [$rowData['style']])->where('shoe_brands_id', $brand->id)->where('shoe_genders_id', $gender->id)->whereRaw('LOWER(width_group) = LOWER(?)', [$rowData['width_group']])->first();
            if (!$style) {
                $style = new ShoeStyle();
                $style->name = $rowData['style'];
                $style->shoe_brands_id = $brand->id;
                $style->shoe_genders_id = $gender->id;
                $style->width_group = $rowData['width_group'];
                $style->save();
            }
            $size = ShoeSize::where([
                'shoe_brands_id' => $brand->id,
                'shoe_styles_id' => $style->id,
                'shoe_genders_id' => $gender->id,
                'shoe_measurement_types_id' => $measurementType->id,
                'us_size' => $rowData['us_size'],
                'uk_size' => $rowData['uk_size'],
                'eu_size' => $rowData['eu_size'],
                'min_cm_size' => $rowData['value_cm_min'],
                'max_cm_size' => $rowData['value_cm_max'],
                'min_in_size' => $rowData['value_inches_min'],
                'max_in_size' => $rowData['value_inches_max']
            ])->first();
            if (!$size) {
                $size = new ShoeSize();
                $size->shoe_brands_id = $brand->id;
                $size->shoe_styles_id = $style->id;
                $size->shoe_genders_id = $gender->id;
                $size->shoe_measurement_types_id = $measurementType->id;
                $size->us_size = $rowData['us_size'];
                $size->uk_size = $rowData['uk_size'];
                $size->eu_size = $rowData['eu_size'];
                $size->min_cm_size = $rowData['value_cm_min'];
                $size->max_cm_size = $rowData['value_cm_max'];
                $size->min_in_size = $rowData['value_inches_min'];
                $size->max_in_size = $rowData['value_inches_max'];
                $size->save();
            } else {
                Log::info('Duplicate size entry skipped: ' . json_encode($rowData));
            }
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error importing size data: ' . $e->getMessage(), ['rowData' => $rowData]);
            throw $e; // Let the job fail and be retried by the queue system
        }
        DB::commit();
    }
    /**
     * 🔥 Runs ONLY when job fails permanently
     */
    public function failed(\Throwable $exception)
    {
        Log::error('ImportShoeRowJob failed permanently: ' . $exception->getMessage(), ['rowData' => $this->rowData]);

        // ❌ Don't delete file here (keep for reprocessing)
    }
}
