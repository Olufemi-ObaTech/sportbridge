<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('reported_user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('reason', ['fraud_or_payment_request', 'fake_profile', 'harassment', 'inappropriate_content', 'other']);
            $table->text('details')->nullable();
            $table->enum('status', ['pending', 'dismissed', 'actioned'])->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            // One open report per reporter/target pair - resubmitting just adds noise,
            // not signal (see ReportController::store).
            $table->unique(['reporter_id', 'reported_user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
