<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateShoeGendersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('shoe_genders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('shoe_brand_id');
            $table->string('name');
            $table->foreign('shoe_brand_id')->references('id')->on('shoe_brands')->onDelete('cascade');
            $table->enum('internal_group',['adult','kids'])->default('adult');
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
        Schema::dropIfExists('shoe_genders');
    }
}
