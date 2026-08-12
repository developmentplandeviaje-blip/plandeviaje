<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$columns = DB::select('DESCRIBE inquiries');
foreach ($columns as $column) {
    echo $column->Field . " | " . $column->Type . " | " . $column->Null . " | " . $column->Key . " | " . $column->Default . " | " . $column->Extra . "\n";
}
