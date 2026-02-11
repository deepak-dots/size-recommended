<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('shoes_size_charts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brand_id')->constrained('shoes_brands')->cascadeOnDelete();
            $table->string('brand_name')->nullable();
            $table->string('collection')->default('Main');
            $table->string('category');           // Men/Women/Kids
            $table->string('width_label')->default('Medium'); // Medium/Wide
            $table->string('us_size');
            $table->string('eu_size')->nullable();
            $table->string('uk_size');

            // Measurements
            $table->float('length_a')->nullable();      
            $table->float('footbed_b')->nullable();     
            $table->float('footbed_w_c')->nullable();  
            $table->float('ball_circ_d')->nullable();  
            $table->float('ankle_circ_e')->nullable(); 

            $table->timestamps();
        });
    }

    public function down() {
        Schema::dropIfExists('shoes_size_charts');
    }
};
