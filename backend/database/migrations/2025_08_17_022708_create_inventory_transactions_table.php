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
        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->nullableMorphs('item'); // item_type: product/raw_material
            $table->enum('direction', ['in', 'out']);
            $table->unsignedInteger('quantity');
            $table->string('reference')->nullable();
            $table->string('reason')->nullable();
            $table->timestamp('transacted_at')->useCurrent();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_transactions');
    }
};
