<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        if (!Schema::hasTable('shoes_brands')) {
            Schema::create('shoes_brands', function (Blueprint $table) {
                $table->id();
                $table->string('name')->unique(); // make brand name unique
                $table->timestamps();
            });
        }
    }

    public function down() {
        Schema::dropIfExists('shoes_brands');
    }
};
