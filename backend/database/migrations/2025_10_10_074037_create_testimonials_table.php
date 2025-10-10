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
        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('event_id')->constrained('kegiatan')->onDelete('cascade');
            $table->text('testimonial');
            $table->integer('rating')->default(5);
            $table->string('event_category', 100);
            $table->boolean('is_approved')->default(false);
            $table->timestamps();

            // Indexes for better performance
            $table->index(['is_approved', 'created_at']);
            $table->index(['event_id']);
            $table->index(['user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('testimonials');
    }
};
