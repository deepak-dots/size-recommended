<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateClothsSizeChartsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cloths_size_charts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('style_id')
                ->constrained('cloths_styles')
                ->cascadeOnDelete();
            $table->string('age_group')->nullable();
            $table->string('alpha_size')->nullable();
            $table->string('uk_size')->nullable();
            $table->string('eu_size')->nullable();
            $table->string('us_size')->nullable();
            $table->integer('display_order')->default(0);
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
        Schema::dropIfExists('cloths_size_charts');
    }
}
