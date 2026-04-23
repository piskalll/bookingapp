<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Task Scheduling untuk otomatisasi pembatalan booking kedaluwarsa
Schedule::command('bookings:cancel-expired')
    ->everyMinute()
    ->withoutOverlapping()
    ->runInBackground();
