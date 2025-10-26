<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('recommended_events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->string('category');
            $table->json('tags')->nullable();
            $table->date('date');
            $table->time('time');
            $table->string('location');
            $table->string('gradient')->default('from-blue-500 to-indigo-600');
            $table->string('icon')->default('book');
            $table->string('button_text')->default('Daftar Sekarang');
            $table->string('button_gradient')->default('from-blue-500 to-indigo-600');
            $table->string('school_text')->default('SMKN 4 BOGOR');
            $table->string('flyer_image_path')->nullable();
            $table->boolean('active')->default(true);
            $table->integer('order')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recommended_events');
    }
};
