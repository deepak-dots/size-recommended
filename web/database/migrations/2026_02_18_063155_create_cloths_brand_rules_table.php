<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateClothsBrandRulesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cloths_brand_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cloths_brand_id')->constrained()->cascadeOnDelete();
            $table->string('rule_key');
            $table->json('rule_value')->nullable();
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
        Schema::dropIfExists('cloths_brand_rules');
    }
}
