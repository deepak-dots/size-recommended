<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateShoeMeasurementTypesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('shoe_measurement_types', function (Blueprint $table) {
            $table->id();
            $table->string('code'); // A, B, C, D, E
            $table->string('name');
            $table->text('description')->nullable();

            $table->unique('code');
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
        Schema::dropIfExists('shoe_measurement_types');
    }
}
