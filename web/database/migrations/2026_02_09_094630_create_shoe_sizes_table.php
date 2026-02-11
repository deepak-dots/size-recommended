<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateShoeSizesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('shoe_sizes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('shoe_brands_id');
            $table->unsignedBigInteger('shoe_genders_id');
            $table->unsignedBigInteger('shoe_measurement_types_id');
            $table->unsignedBigInteger('shoe_styles_id')->nullable();
            $table->foreign('shoe_brands_id')->references('id')->on('shoe_brands')->onDelete('cascade');
            $table->foreign('shoe_genders_id')->references('id')->on('shoe_genders')->onDelete('cascade');
            $table->foreign('shoe_measurement_types_id')->references('id')->on('shoe_measurement_types')->onDelete('cascade');
            $table->foreign('shoe_styles_id')->references('id')->on('shoe_styles')->onDelete('cascade');
            $table->string('us_size');
            $table->string('eu_size')->nullable();
            $table->string('uk_size')->nullable();
            $table->decimal('min_cm_size', 8, 2)->nullable();
            $table->decimal('max_cm_size', 8, 2)->nullable();
            $table->decimal('min_in_size', 8, 2)->nullable();
            $table->decimal('max_in_size', 8, 2)->nullable();
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
        Schema::dropIfExists('shoe_sizes');
    }
}
