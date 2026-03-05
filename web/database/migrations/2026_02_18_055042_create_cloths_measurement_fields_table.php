<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateClothsMeasurementFieldsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cloths_measurement_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('style_id')
                ->constrained('cloths_styles')
                ->cascadeOnDelete();

            $table->string('field_key'); // chest, height, shoe_size

            $table->string('label');

            $table->enum('input_type', [
                'number',
                'decimal',
                'select'
            ]);

            $table->string('unit')->nullable();

            $table->json('field_options')->nullable();

            $table->boolean('is_required')->default(true);

            $table->boolean('is_critical')->default(false);

            $table->integer('sort_order')->default(0);

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
        Schema::dropIfExists('cloths_measurement_fields');
    }
}
