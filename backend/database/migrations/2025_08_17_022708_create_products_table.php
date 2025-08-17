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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category')->nullable();
            $table->unsignedInteger('lead_time_days')->default(7);
            $table->unsignedInteger('reorder_point')->default(0);
            $table->unsignedInteger('reorder_quantity')->default(0);
            $table->unsignedInteger('safety_stock')->default(0);
            $table->unsignedInteger('stock_on_hand')->default(0);
            $table->decimal('price', 12, 2)->default(0);
            $table->string('unit')->default('pcs');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
