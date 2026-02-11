<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateShoeStylesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('shoe_styles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('shoe_brands_id');
            $table->foreign('shoe_brands_id')->references('id')->on('shoe_brands')->onDelete('cascade');
            $table->unsignedBigInteger('shoe_genders_id');
            $table->foreign('shoe_genders_id')->references('id')->on('shoe_genders')->onDelete('cascade');
            $table->string('name');
            $table->enum('width_group',['medium','wide','extra_wide'])->default('medium');
            $table->string('model_group')->nullable();
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
        Schema::dropIfExists('shoe_styles');
    }
}
