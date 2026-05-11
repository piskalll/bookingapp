<?php

use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\PartnerController;
use App\Http\Controllers\Admin\CourtController as AdminCourtController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\VenueController as AdminVenueController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\Owner\BookingController as OwnerBookingController;
use App\Http\Controllers\Owner\CourtController as OwnerCourtController;
use App\Http\Controllers\Owner\DashboardController as OwnerDashboardController;
use App\Http\Controllers\Owner\VenueController as OwnerVenueController;
use App\Http\Controllers\VenueController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::inertia('/', 'Welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::get('/venues', [VenueController::class, 'index'])->name('venues.index');
Route::get('/venues/{venue}', [VenueController::class, 'show'])->name('venues.show');

/*
|--------------------------------------------------------------------------
| Customer Routes  (role: customer / default user)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'role:customer'])->group(function () {
    Route::inertia('/dashboard', 'dashboard')->name('dashboard');

    // API — venue availability
    Route::get('/api/venues', [VenueController::class, 'getVenuesWithCourts'])->name('api.venues');
    Route::get('/api/bookings/check-availability', [BookingController::class, 'checkAvailability'])->name('api.bookings.check-availability');
    Route::get('/api/bookings/available-slots/{court}/{date}', [BookingController::class, 'getAvailableSlots'])->name('api.bookings.available-slots');

    // Booking
    Route::get('/bookings', [BookingController::class, 'index'])->name('bookings.index');
    Route::get('/bookings/create/{court}', [BookingController::class, 'create'])->name('bookings.create');
    Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store');
    Route::post('/bookings/{booking}/payment', [BookingController::class, 'storePayment'])->name('bookings.storePayment');
});

/*
|--------------------------------------------------------------------------
| Admin Routes  (role: admin)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Master Data — Venues (create & assign to owner)
    Route::resource('venues', AdminVenueController::class);

    // Master Data — Courts
    Route::resource('courts', AdminCourtController::class);

    // Master Data — Users
    Route::resource('users', \App\Http\Controllers\Admin\UserController::class);

    // Bookings — audit semua transaksi
    Route::get('/bookings', [AdminBookingController::class, 'index'])->name('bookings.index');
    Route::put('/bookings/{booking}/approve', [AdminBookingController::class, 'approve'])->name('bookings.approve');
    Route::put('/bookings/{booking}/reject', [AdminBookingController::class, 'reject'])->name('bookings.reject');

    // Kelola Mitra & Monetisasi
    Route::get('/partners', [PartnerController::class, 'index'])->name('partners.index');
    Route::patch('/partners/{user}/commission', [PartnerController::class, 'updateCommission'])->name('partners.commission');
    Route::post('/partners/{user}/renew', [PartnerController::class, 'renewSubscription'])->name('partners.renew');
    Route::patch('/partners/{user}/deactivate', [PartnerController::class, 'deactivateSubscription'])->name('partners.deactivate');

    // Reports
    Route::get('/reports/export-pdf', [ReportController::class, 'exportPdf'])->name('reports.exportPdf');
});

/*
|--------------------------------------------------------------------------
| Owner Routes  (role: owner)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'role:owner'])->prefix('owner')->name('owner.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [OwnerDashboardController::class, 'index'])->name('dashboard');

    // Bookings — hanya untuk lapangan milik owner
    Route::get('/bookings', [OwnerBookingController::class, 'index'])->name('bookings.index');
    Route::put('/bookings/{booking}/approve', [OwnerBookingController::class, 'approve'])->name('bookings.approve');
    Route::put('/bookings/{booking}/reject', [OwnerBookingController::class, 'reject'])->name('bookings.reject');

    // Venues — read-only (venue dibuat oleh admin dan di-assign ke owner)
    Route::resource('venues', OwnerVenueController::class)->only(['index', 'edit', 'update']);

    // Courts — CRUD hanya dalam venue yang di-assign ke owner ini
    Route::resource('courts', OwnerCourtController::class)->except(['show']);
});

require __DIR__.'/settings.php';
