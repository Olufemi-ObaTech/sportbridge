<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admin_logs', function (Blueprint $table) {
            // Nullable: "auto_pend" is triggered by the complaint threshold
            // being reached, not by a human admin (see ReportService).
            $table->unsignedBigInteger('admin_id')->nullable()->change();

            // Widening the action enum to a plain string for the new
            // report-related actions ("auto_pend", "dismiss_report",
            // "report_actioned") - doctrine/dbal's change() can't rewrite an
            // enum's allowed values in place, only relax the column type.
            $table->string('action')->change();
        });
    }

    public function down(): void
    {
        Schema::table('admin_logs', function (Blueprint $table) {
            $table->unsignedBigInteger('admin_id')->nullable(false)->change();
        });
    }
};
