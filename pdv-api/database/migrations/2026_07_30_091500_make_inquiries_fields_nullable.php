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
        // Drop foreign keys before changing the column types, which is required in MySQL
        Schema::table('inquiries', function (Blueprint $table) {
            $table->dropForeign(['post_FK']);
            $table->dropForeign(['guest_type_FK']);
        });

        // Modify columns to be nullable
        Schema::table('inquiries', function (Blueprint $table) {
            $table->foreignId('post_FK')->nullable()->change();
            $table->string('client_phone')->nullable()->change();
            $table->foreignId('guest_type_FK')->nullable()->change();
        });

        // Recreate foreign keys
        Schema::table('inquiries', function (Blueprint $table) {
            $table->foreign('post_FK')->references('post_ID')->on('posts')->onDelete('cascade');
            $table->foreign('guest_type_FK')->references('guest_type_ID')->on('guest_types');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inquiries', function (Blueprint $table) {
            $table->dropForeign(['post_FK']);
            $table->dropForeign(['guest_type_FK']);
        });

        Schema::table('inquiries', function (Blueprint $table) {
            $table->foreignId('post_FK')->nullable(false)->change();
            $table->string('client_phone')->nullable(false)->change();
            $table->foreignId('guest_type_FK')->nullable(false)->change();
        });

        Schema::table('inquiries', function (Blueprint $table) {
            $table->foreign('post_FK')->references('post_ID')->on('posts')->onDelete('cascade');
            $table->foreign('guest_type_FK')->references('guest_type_ID')->on('guest_types');
        });
    }
};
