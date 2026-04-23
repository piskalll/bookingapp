# Quick Start Guide - Sistem Penyewaan Lapangan Olahraga

## ✅ Checklist Implementasi

### Backend - Sudah Dikerjakan ✓

- [x] **Migrations** (4 files)
  - `add_role_to_users_table.php` - Tambah kolom role ke users
  - `create_venues_table.php` - Tabel untuk venue/tempat
  - `create_courts_table.php` - Tabel untuk lapangan
  - `create_bookings_table.php` - Tabel untuk pemesanan

- [x] **Models** (4 models)
  - `User.php` - Dengan relasi `bookings()`
  - `Venue.php` - Dengan relasi `courts()`
  - `Court.php` - Dengan relasi `venue()` dan `bookings()`
  - `Booking.php` - Dengan relasi `user()` dan `court()`

- [x] **Controllers** (2 controllers)
  - `VenueController.php` - `index()`, `getVenuesWithCourts()`
  - `BookingController.php` - `index()`, `create()`, `store()` dengan validasi double booking, `getAvailableSlots()`

- [x] **Middleware**
  - `CheckRole.php` - Authorization berdasarkan role

- [x] **Routes**
  - `/venues` - Daftar venues dengan courts
  - `/bookings` - Daftar booking user
  - `/bookings/create/{court}` - Form pemesanan
  - `/api/bookings/available-slots/{court}/{date}` - API untuk available slots

- [x] **Factories** (4 factories)
  - `UserFactory.php` - Include default role
  - `VenueFactory.php` - Sample venue data
  - `CourtFactory.php` - Sample court data
  - `BookingFactory.php` - Sample booking data

- [x] **Seeding**
  - `DatabaseSeeder.php` - Create admin, owner, customers, venues, courts, bookings

### Frontend - Sudah Dikerjakan ✓

- [x] **React Components**
  - `pages/Venues/Index.tsx` - List venues grouped by venue dengan courts
  - `pages/Bookings/Create.tsx` - Form pemesanan dengan calendar
  - `pages/Bookings/Index.tsx` - Daftar booking user
  - `components/Bookings/BookingCalendar.tsx` - Calendar dengan disable date/time

- [x] **Features**
  - [x] Grouping venues & courts di frontend
  - [x] Date picker (7 hari ke depan)
  - [x] Time slot picker (07:00 - 22:00, 1 hour intervals)
  - [x] Disabled slots untuk booked times
  - [x] Real-time price calculation
  - [x] Status badge untuk bookings

---

## 🚀 Quick Start

### 1. Setup Database

```bash
# Fresh database dengan seed data
php artisan migrate:fresh --seed

# Atau manual jika sudah ada data
php artisan migrate
php artisan db:seed --class=DatabaseSeeder
```

### 2. Test Data Credentials

```
# Customer
Email: test@example.com
Password: password

# Admin
Email: admin@example.com
Password: password

# Owner
Email: owner@example.com
Password: password
```

### 3. Frontend Development

```bash
# Development dengan hot reload
npm run dev

# Production build
npm run build
```

### 4. Akses Aplikasi

- Home: `http://localhost:8000/`
- Venues: `http://localhost:8000/venues` (after login)
- Bookings: `http://localhost:8000/bookings`
- Create Booking: `http://localhost:8000/bookings/create/1` (ganti 1 dengan court id)

---

## 📁 File Structure Summary

### Backend Files Created

```
app/
├── Models/
│   ├── Venue.php
│   ├── Court.php
│   ├── Booking.php
│   └── User.php (updated)
├── Http/Controllers/
│   ├── VenueController.php
│   └── BookingController.php
└── Http/Middleware/
    └── CheckRole.php

database/
├── migrations/
│   ├── 2026_04_19_103253_add_role_to_users_table.php
│   ├── 2026_04_19_103301_create_venues_table.php
│   ├── 2026_04_19_103303_create_courts_table.php
│   └── 2026_04_19_103306_create_bookings_table.php
├── factories/
│   ├── VenueFactory.php
│   ├── CourtFactory.php
│   └── BookingFactory.php
└── seeders/
    └── DatabaseSeeder.php (updated)
```

### Frontend Files Created

```
resources/js/
├── pages/
│   ├── Venues/
│   │   └── Index.tsx
│   └── Bookings/
│       ├── Create.tsx
│       └── Index.tsx
└── components/
    └── Bookings/
        └── BookingCalendar.tsx
```

### Documentation Files

```
├── SCAFFOLDING_DOCUMENTATION.md (lengkap)
└── QUICK_START_GUIDE.md (ini)
```

---

## 🔑 Key Features Implementation

### 1. Double Booking Prevention

**Location**: `app/Http/Controllers/BookingController.php` (method `store()`)

**Logic**:
```php
// Check if there's overlap between existing bookings
$existingBooking = Booking::where('court_id', $validated['court_id'])
    ->where('booking_date', $validated['booking_date'])
    ->where('status', '!=', 'cancelled')
    ->where(function ($query) use ($validated) {
        // Overlap jika:
        // start_time_existing < end_time_new AND end_time_existing > start_time_new
        $query->whereRaw('start_time < ?', [$validated['end_time']])
            ->whereRaw('end_time > ?', [$validated['start_time']]);
    })
    ->first();

if ($existingBooking) {
    return back()->withErrors(['booking_date' => 'Lapangan sudah dipesan']);
}
```

### 2. Eager Loading untuk Performance

**Location**: `app/Http/Controllers/VenueController.php`

```php
// Only 2 queries: SELECT venues, SELECT courts
$venues = Venue::with('courts')->get();
```

### 3. Calendar dengan Disabled Slots

**Location**: `resources/js/components/Bookings/BookingCalendar.tsx`

**Features**:
- Fetch booked slots dari API: `/api/bookings/available-slots/court/date`
- Disable time slots yang overlap dengan existing bookings
- Visual feedback untuk disabled slots (opacity 50%, cursor not-allowed)
- Show booked times pada info box

---

## 🛠️ Common Tasks

### Menambah Validator Custom

```php
// app/Concerns/BookingValidationRules.php
trait BookingValidationRules {
    protected function bookingRules(): array {
        return [
            'court_id' => 'required|exists:courts,id',
            'booking_date' => 'required|date|after:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ];
    }
}

// Di controller
use BookingValidationRules;

$validated = $request->validate($this->bookingRules());
```

### Create New Venue & Courts via Tinker

```bash
php artisan tinker

$venue = Venue::create([
    'name' => 'GOR Baru',
    'address' => 'Jl. Raya No. 1',
]);

$court = Court::create([
    'venue_id' => $venue->id,
    'name' => 'Court A',
    'type' => 'futsal',
    'price_per_hour' => 200000,
]);

exit
```

### Query Bookings untuk Date Range

```php
// Get all bookings untuk courtA antara tanggal
$bookings = Booking::where('court_id', 1)
    ->whereBetween('booking_date', ['2026-04-20', '2026-04-25'])
    ->where('status', '!=', 'cancelled')
    ->get();
```

---

## ⚠️ Important Notes

### Database

1. **Foreign Keys dengan CASCADE**:
   - Jika venue dihapus → courts dan bookings otomatis terhapus
   - Jika court dihapus → bookings otomatis terhapus

2. **Indexes untuk Performance**:
   - `bookings(court_id, booking_date)` - untuk query overlap
   - `bookings(user_id)` - untuk query user bookings

### Frontend Components

1. **BookingCalendar Props**:
   - `courtId` - Untuk fetch available slots
   - `onDateSelect` - Callback saat date/time dipilih
   - `selectedDate`, `selectedStartTime`, `selectedEndTime` - Controlled state

2. **React Hooks yang Digunakan**:
   - `useState()` - State management
   - `useEffect()` - Fetch available slots saat date berubah

---

## 🧪 Testing

### Create Test Data

```bash
php artisan tinker

# Create venue dengan courts
Venue::factory(2)->has(Court::factory(3))->create();

# Create bookings
Booking::factory(10)->create();

exit
```

### Simple Booking Test

```bash
php artisan tinker

$user = User::find(1);
$court = Court::find(1);

// Create booking
$booking = Booking::create([
    'user_id' => $user->id,
    'court_id' => $court->id,
    'booking_date' => '2026-04-20',
    'start_time' => '09:00',
    'end_time' => '11:00',
    'total_price' => $court->price_per_hour * 2,
    'status' => 'pending',
]);

// Test overlap (should fail)
$overlap = Booking::create([
    'user_id' => $user->id,
    'court_id' => $court->id,
    'booking_date' => '2026-04-20',
    'start_time' => '10:00',  // Overlaps dengan 09:00-11:00
    'end_time' => '12:00',
    'total_price' => 200000,
]);

exit
```

---

## 📝 Next Steps / Future Enhancements

### Planned Features

- [ ] Payment integration (Midtrans, Stripe)
- [ ] Email notifications saat booking created
- [ ] Admin dashboard untuk manage venues/courts
- [ ] User reviews & ratings
- [ ] Booking approval workflow
- [ ] SMS notifications
- [ ] Discount codes system
- [ ] Multi-language support

### Possible Improvements

- [ ] Add caching untuk venues & courts (less frequently changed)
- [ ] Implement repository pattern untuk data access
- [ ] Add transaction handling untuk booking creation
- [ ] Implement soft deletes untuk venues/courts
- [ ] Add API rate limiting
- [ ] Implement WebSocket untuk real-time availability

---

## 🐛 Common Issues & Solutions

### Issue: Double booking masih terjadi

**Cause**: Query overlap logic tidak benar atau stale data cache  
**Solution**:
```php
// Pastikan query benar
->whereRaw('start_time < ?', [$endTime])
->whereRaw('end_time > ?', [$startTime])

// Clear cache jika ada
php artisan cache:clear
```

### Issue: Available slots tidak ter-load di calendar

**Cause**: API endpoint error atau CORS issue  
**Solution**: Check browser console, test endpoint di Postman:
```
GET /api/bookings/available-slots/1/2026-04-20
```

### Issue: Migration stuck atau error

**Solution**:
```bash
# Reset database
php artisan migrate:reset

# Or fresh
php artisan migrate:fresh --seed
```

---

## 📞 Support

Untuk questions atau issues:
1. Check dokumentasi: `SCAFFOLDING_DOCUMENTATION.md`
2. Review kode di `app/Http/Controllers/`
3. Check React components di `resources/js/`

---

**Created**: April 19, 2026  
**Version**: 1.0  
**Status**: Production Ready
