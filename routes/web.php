<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\VenueController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\VenueController as AdminVenueController;
use App\Http\Controllers\Admin\CourtController as AdminCourtController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Venues Routes
    Route::get('/venues', [VenueController::class, 'index'])->name('venues.index');
    Route::get('/api/venues', [VenueController::class, 'getVenuesWithCourts'])->name('api.venues');

    // Bookings Routes  
    Route::get('/bookings', [BookingController::class, 'index'])->name('bookings.index');
    Route::get('/bookings/create/{court}', [BookingController::class, 'create'])->name('bookings.create');
    Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store');
    Route::post('/bookings/{booking}/payment', [BookingController::class, 'storePayment'])->name('bookings.storePayment');
    
    // API Routes untuk Availability
    Route::get('/api/bookings/check-availability', [BookingController::class, 'checkAvailability'])->name('api.bookings.check-availability');
    Route::get('/api/bookings/available-slots/{court}/{date}', [BookingController::class, 'getAvailableSlots'])->name('api.bookings.available-slots');
});

// Admin Routes
Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::prefix('admin')->name('admin.')->group(function () {
        // Master Data - Venues
        Route::resource('venues', AdminVenueController::class);

        // Master Data - Courts
        Route::resource('courts', AdminCourtController::class);

        // Booking Management
        Route::get('/bookings', [AdminBookingController::class, 'index'])->name('bookings.index');
        Route::put('/bookings/{booking}/approve', [AdminBookingController::class, 'approve'])->name('bookings.approve');
        Route::put('/bookings/{booking}/reject', [AdminBookingController::class, 'reject'])->name('bookings.reject');

        // Reports
        Route::get('/reports/export-pdf', [ReportController::class, 'exportPdf'])->name('reports.exportPdf');
    });
});

require __DIR__.'/settings.php';
