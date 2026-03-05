<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateClothsSizeChartMeasurementsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cloths_size_chart_measurements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('size_chart_id')
                ->constrained('cloths_size_charts')
                ->cascadeOnDelete();
            $table->string('field_key');
            $table->decimal('min_value', 8, 2)->nullable();
            $table->decimal('max_value', 8, 2)->nullable();
            $table->decimal('min_value_inches', 8, 2)->nullable();
            $table->decimal('max_value_inches', 8, 2)->nullable();
            $table->decimal('garment_value', 8, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('cloths_size_chart_measurements');
    }
}
