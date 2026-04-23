# Dokumentasi: Sistem Informasi Penyewaan Lapangan Olahraga

Dokumentasi lengkap untuk scaffolding sistem penyewaan lapangan olahraga yang dibangun dengan Laravel 13, React, dan Inertia.js.

## 📋 Daftar Isi

1. [Arsitektur Sistem](#arsitektur-sistem)
2. [Database Schema](#database-schema)
3. [Relasi Model](#relasi-model)
4. [Fitur Utama](#fitur-utama)
5. [Panduan Setup](#panduan-setup)
6. [Struktur Kode](#struktur-kode)
7. [API Endpoints](#api-endpoints)
8. [Testing & Seeding Data](#testing--seeding-data)

---

## Arsitektur Sistem

### Tech Stack

- **Backend**: Laravel 13 (PHP 8.4)
- **Frontend**: React 19 dengan Inertia.js v3
- **Database**: MySQL
- **Styling**: Tailwind CSS v4
- **Testing**: Pest v4

### Diagram Relasi Database

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS TABLE                         │
│ ─────────────────────────────────────────────────────────── │
│ id | name | email | password | role | timestamps           │
│                  (foreign key untuk bookings)               │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ (1 : N)
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                       BOOKINGS TABLE                        │
│ ─────────────────────────────────────────────────────────── │
│ id | user_id | court_id | booking_date | start_time |      │
│ end_time | total_price | status | timestamps               │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ (N : 1)
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                        COURTS TABLE                         │
│ ─────────────────────────────────────────────────────────── │
│ id | venue_id | name | type | price_per_hour | timestamps  │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ (N : 1)
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                        VENUES TABLE                         │
│ ─────────────────────────────────────────────────────────── │
│ id | name | address | image (nullable) | timestamps        │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'owner', 'customer') DEFAULT 'customer',
    email_verified_at TIMESTAMP NULL,
    two_factor_secret TEXT NULL,
    two_factor_recovery_codes TEXT NULL,
    two_factor_confirmed_at TIMESTAMP NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Venues Table
```sql
CREATE TABLE venues (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    image VARCHAR(255) NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Courts Table
```sql
CREATE TABLE courts (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    venue_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('futsal', 'badminton', 'basket') NOT NULL,
    price_per_hour INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
    INDEX idx_venue_id (venue_id)
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    court_id BIGINT UNSIGNED NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_price INT NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE,
    INDEX idx_court_booking_date (court_id, booking_date),
    INDEX idx_user_id (user_id)
);
```

---

## Relasi Model

### User Model

```php
class User extends Authenticatable {
    // Relationship: One User has Many Bookings
    public function bookings(): HasMany {
        return $this->hasMany(Booking::class);
    }
}
```

### Venue Model

```php
class Venue extends Model {
    // Relationship: One Venue has Many Courts
    public function courts(): HasMany {
        return $this->hasMany(Court::class);
    }
}
```

### Court Model

```php
class Court extends Model {
    // Relationship: Many Courts belong to One Venue
    public function venue(): BelongsTo {
        return $this->belongsTo(Venue::class);
    }

    // Relationship: One Court has Many Bookings
    public function bookings(): HasMany {
        return $this->hasMany(Booking::class);
    }
}
```

### Booking Model

```php
class Booking extends Model {
    // Relationship: Many Bookings belong to One User
    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    // Relationship: Many Bookings belong to One Court
    public function court(): BelongsTo {
        return $this->belongsTo(Court::class);
    }
}
```

---

## Fitur Utama

### 1. **Sistem Role & Authorization**

Terdapat 3 role dalam sistem:
- **Admin**: Mengelola seluruh sistem
- **Owner**: Mengelola venue dan lapangan mereka
- **Customer**: Menyewa lapangan

**Middleware**: `CheckRole`
```php
// Contoh penggunaan di route:
Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    // Protected routes untuk admin hanya
});
```

### 2. **Validasi Pemesanan - Pencegahan Double Booking**

Fitur utama dari `BookingController@store()`:

```php
// Cek overlap dengan booking yang sudah ada
$existingBooking = Booking::where('court_id', $validated['court_id'])
    ->where('booking_date', $validated['booking_date'])
    ->where('status', '!=', 'cancelled')
    ->where(function ($query) use ($validated) {
        // Start time lebih kecil dari end time existing 
        // dan end time lebih besar dari start time existing
        $query->whereRaw('start_time < ?', [$validated['end_time']])
            ->whereRaw('end_time > ?', [$validated['start_time']]);
    })
    ->first();

if ($existingBooking) {
    return back()->withErrors([
        'booking_date' => 'Lapangan sudah dipesan pada jam tersebut.',
    ]);
}
```

**Logika Overlap Detection**:
- Jika ada booking existing dengan `start_time` < `end_time_baru` 
- DAN `end_time_existing` > `start_time_baru`
- Maka terdapat overlap (TIME CONFLICT)

### 3. **Eager Loading untuk Performa**

Menggunakan eager loading di VenueController untuk mengurangi N+1 queries:

```php
$venues = Venue::with('courts')->get();
// Hanya 2 query: SELECT venues, SELECT courts WHERE venue_id IN (...)
```

### 4. **Komponen Booking Calendar**

Komponen React `BookingCalendar.tsx` menampilkan:
- **Date Picker**: Pilih tanggal (7 hari ke depan)
- **Time Slots**: Pilih jam (07:00 - 22:00)
- **Disabled Slots**: Time slot yang sudah dipesan di-disable
- **Real-time Validation**: Fetch booked slots dari API

---

## Panduan Setup

### 1. **Fresh Database Migration**

```bash
# Run semua migrations
php artisan migrate

# Atau reset dengan seed
php artisan migrate:fresh --seed
```

### 2. **Seed Data Sample**

```bash
# Run seeder untuk membuat sample data
php artisan db:seed --class=DatabaseSeeder

# Hasil:
# - 1 Admin user (admin@example.com)
# - 1 Owner user (owner@example.com)
# - 1 Test customer (test@example.com)
# - 10 Additional customers
# - 3 Venues dengan 3 courts masing-masing
# - 15 Sample bookings
```

### 3. **Login Test Data**

```
Email: test@example.com
Password: password
Role: customer

Email: admin@example.com
Password: password
Role: admin
```

### 4. **Frontend Build**

```bash
# Development mode (dengan hot reload)
npm run dev

# Production build
npm run build
```

---

## Struktur Kode

### Backend Structure

```
app/
├── Models/
│   ├── User.php              # User model dengan relasi bookings
│   ├── Venue.php             # Venue model
│   ├── Court.php             # Court model
│   └── Booking.php           # Booking model
├── Http/
│   ├── Controllers/
│   │   ├── VenueController.php
│   │   └── BookingController.php
│   └── Middleware/
│       └── CheckRole.php     # Role authorization middleware
└── Concerns/
    └── (Validation traits)

database/
├── migrations/
│   ├── add_role_to_users_table.php
│   ├── create_venues_table.php
│   ├── create_courts_table.php
│   └── create_bookings_table.php
├── factories/
│   ├── UserFactory.php
│   ├── VenueFactory.php
│   ├── CourtFactory.php
│   └── BookingFactory.php
└── seeders/
    └── DatabaseSeeder.php

routes/
└── web.php                   # Route definitions
```

### Frontend Structure

```
resources/
└── js/
    ├── pages/
    │   ├── Venues/
    │   │   └── Index.tsx     # Halaman daftar venues
    │   └── Bookings/
    │       ├── Index.tsx     # Halaman daftar booking user
    │       └── Create.tsx    # Halaman form pemesanan
    └── components/
        └── Bookings/
            └── BookingCalendar.tsx  # Komponen calendar
```

---

## API Endpoints

### Public Routes

```
GET  /              → Home
GET  /login         → Login form
POST /login         → Process login
GET  /register      → Register form
POST /register      → Process register
```

### Protected Routes (Authenticated & Verified Users)

```
# Venues
GET  /venues                    → VenueController@index
GET  /api/venues               → VenueController@getVenuesWithCourts

# Bookings
GET    /bookings               → BookingController@index
GET    /bookings/create/{id}   → BookingController@create
POST   /bookings               → BookingController@store
GET    /api/bookings/available-slots/{court}/{date} → BookingController@getAvailableSlots
```

### Response Contoh

**GET /venues**
```json
{
  "venues": [
    {
      "id": 1,
      "name": "GOR A",
      "address": "Jl. Merdeka No. 1",
      "image": null,
      "courts": [
        {
          "id": 1,
          "venue_id": 1,
          "name": "Court 1",
          "type": "futsal",
          "price_per_hour": 150000
        },
        {
          "id": 2,
          "venue_id": 1,
          "name": "Court 2",
          "type": "futsal",
          "price_per_hour": 150000
        }
      ]
    }
  ]
}
```

**GET /api/bookings/available-slots/1/2026-04-20**
```json
{
  "available_slots": [
    {
      "start_time": "08:00:00",
      "end_time": "11:00:00"
    },
    {
      "start_time": "15:00:00",
      "end_time": "18:00:00"
    }
  ]
}
```

**POST /bookings** (Request)
```json
{
  "court_id": 1,
  "booking_date": "2026-04-20",
  "start_time": "09:00",
  "end_time": "11:00"
}
```

---

## Testing & Seeding Data

### Menjalankan Seeder

```bash
# Via artisan command
php artisan db:seed --class=DatabaseSeeder

# Atau via migration fresh
php artisan migrate:fresh --seed

# Seed spesifik model saja (untuk testing)
php artisan tinker
> App\Models\Venue::factory(5)->has(App\Models\Court::factory(3))->create();
> exit
```

### Testing dengan Pest

```bash
# Run semua tests
php artisan test --compact

# Run test tertentu
php artisan test --compact --filter=BookingTest

# Run dengan coverage
php artisan test --coverage
```

### Membuat Test Bookings

```bash
php artisan tinker

# Create test data
$user = User::find(3);  // Test customer
$court = Court::first();
$booking = Booking::create([
    'user_id' => $user->id,
    'court_id' => $court->id,
    'booking_date' => '2026-04-20',
    'start_time' => '09:00',
    'end_time' => '10:00',
    'total_price' => 150000,
    'status' => 'pending',
]);

exit
```

---

## Contoh Penggunaan: Override Behavior

### Menambah Role Baru

1. Update migration `add_role_to_users_table.php`:
```php
$table->enum('role', ['admin', 'owner', 'customer', 'new_role'])
    ->default('customer')->after('email');
```

2. Run migration:
```bash
php artisan migrate:refresh
```

### Membuat Endpoint Admin Dashboard

1. Buat controller:
```bash
php artisan make:controller AdminDashboardController
```

2. Buat route:
```php
Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin')
    ->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])
            ->name('admin.dashboard');
    });
```

### Menambah Validasi Custom

```php
// app/Concerns/BookingValidationRules.php
trait BookingValidationRules {
    public function bookingRules(): array {
        return [
            'court_id' => 'required|exists:courts,id',
            'booking_date' => 'required|date|after:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ];
    }
}
```

---

## Tips & Best Practices

### Performance

1. **Selalu gunakan Eager Loading**:
```php
// ❌ JANGAN
$venues = Venue::all();
foreach ($venues as $venue) {
    echo $venue->courts; // N+1 query!
}

// ✅ LAKUKAN
$venues = Venue::with('courts')->get(); // 2 query saja
```

2. **Gunakan Index pada Database**:
```php
// Bookings table sudah punya index untuk:
// - (court_id, booking_date) → untuk cek overlapping
// - user_id → untuk fetch user bookings
```

### Security

1. **Role Authorization**: Selalu gunakan middleware `CheckRole`
2. **Database Constraints**: Foreign key dengan CASCADE delete untuk data integrity
3. **Validation**: Input validation di controller sebelum query

### Code Quality

1. **Run Pint**:
```bash
vendor/bin/pint --dirty
```

2. **Type Hints**: Semua method harus punya return type
3. **Comments**: Gunakan PHPDoc blocks untuk dokumentasi

---

## Troubleshooting

### Problem: Double booking masih terjadi

**Solution**: Pastikan query overlap logic benar:
```php
// Overlap jika: start < end_existing AND end > start_existing
whereRaw('start_time < ?', [$validated['end_time']])
    ->whereRaw('end_time > ?', [$validated['start_time']])
```

### Problem: Calendar time slots tidak ter-load

**Solution**: Check network tab di browser devtools, pastikan API endpoint benar

### Problem: Migration error

**Solution**: 
```bash
# Rollback semua
php artisan migrate:reset

# Atau migrate fresh
php artisan migrate:fresh
```

---

## Resources

- [Laravel 13 Documentation](https://laravel.com/docs/13)
- [Inertia.js Documentation](https://inertiajs.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Pest Testing Documentation](https://pestphp.com/docs)

---

**Last Updated**: April 19, 2026
**Version**: 1.0
