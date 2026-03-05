<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateClothsRulesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cloths_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brand_id')
                ->constrained('cloths_brands')
                ->cascadeOnDelete();

            $table->foreignId('product_type_id')
                ->nullable()
                ->constrained('cloths_product_types')
                ->cascadeOnDelete();

            $table->foreignId('style_id')
                ->nullable()
                ->constrained('cloths_styles')
                ->cascadeOnDelete();

            $table->string('rule_type');

            $table->json('rule_value');
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
        Schema::dropIfExists('cloths_rules');
    }
}
