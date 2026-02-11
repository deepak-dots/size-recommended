<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateShoeBrandMeasurementTypesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('shoe_brand_measurement_types', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('shoe_brands_id');
            $table->unsignedBigInteger('shoe_measurement_types_id');
            $table->foreign('shoe_brands_id')->references('id')->on('shoe_brands')->onDelete('cascade');
            $table->foreign('shoe_measurement_types_id')->references('id')->on('shoe_measurement_types')->onDelete('cascade');
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
        Schema::dropIfExists('shoe_brand_measurement_types');
    }
}
