# Dashboard Owner - Implementation Guide

## Overview
Fitur Dashboard Owner adalah tampilan utama untuk pemilik venue (owner) yang menampilkan statistik bisnis mereka secara real-time, termasuk:
- Jumlah venue dan lapangan
- Pendapatan bulanan
- Pesanan yang menunggu persetujuan
- Daftar pesanan terbaru

## Arsitektur & Alur Kerja

### 1. Database Structure
Owner dapat mengelola venue mereka melalui kolom `user_id` di tabel `venues`:
- Relasi: `User (1) -> (Many) Venue`
- Setiap venue memiliki courts, dan setiap court memiliki bookings
- Owner hanya melihat data yang terkait dengan venue mereka

### 2. Backend Implementation

#### Controller: `app/Http/Controllers/Owner/DashboardController.php`
```php
- Method: index()
- Mengambil statistik:
  * total_venues: Jumlah venue milik user
  * total_courts: Total lapangan dari semua venue
  * monthly_revenue: Sum pendapatan status 'confirmed' bulan ini
  * pending_bookings_count: Booking status 'pending' dengan payment_proof
  
- Mengambil 5 booking terbaru dengan JOIN query untuk performance
- Return Inertia::render() dengan data statistik & recent_bookings
```

#### Controller: `app/Http/Controllers/Owner/BookingController.php`
```php
- Method: index()
- Menampilkan ALL bookings untuk venue owner
- Support pagination (15 items per halaman)
- Menampilkan detail customer, venue, waktu, harga, status
```

#### Routes: `routes/web.php`
```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('owner')->name('owner.')->group(function () {
        Route::get('/dashboard', [OwnerDashboardController::class, 'index'])->name('dashboard');
        Route::get('/bookings', [OwnerBookingController::class, 'index'])->name('bookings.index');
        // ... existing routes
    });
});
```

### 3. Frontend Implementation

#### Component: `resources/js/pages/Owner/Dashboard.tsx`
**Fitur:**
- **Stat Cards (4 buah):**
  * Menggunakan lucide-react icons (Home, Layout, DollarSign, Clock)
  * Hover effect dengan shadow-lg transition
  * Dark mode support
  * Menampilkan formatted currency untuk pendapatan
  
- **Recent Bookings Table:**
  * Kolom: Penyewa, Lapangan, Waktu, Nominal, Status
  * Status Badge dengan warna berbeda (pending=amber, confirmed=emerald, dll)
  * Hover state pada baris
  * Empty state dengan icon jika tidak ada booking
  
- **Action Button:**
  * "Lihat Semua Pesanan" mengarah ke owner.bookings.index
  * Gradient blue styling dengan hover effect

#### Component: `resources/js/pages/Owner/Bookings/Index.tsx`
**Fitur:**
- Tabel lengkap dengan pagination
- Customer info (nama & email)
- Venue + Court name
- Booking date & time dengan range
- Total price formatted
- Status badges
- Responsive design dengan dark mode support
- Navigation kembali ke dashboard

### 4. Database Queries

#### Dashboard Statistics Query
```sql
-- Total Venues: Count dari venues where user_id = auth_id
SELECT COUNT(*) FROM venues WHERE user_id = ?

-- Total Courts: Count dari courts via nested select
SELECT COUNT(*) FROM courts 
JOIN venues ON courts.venue_id = venues.id 
WHERE venues.user_id = ?

-- Monthly Revenue: Sum price dari confirmed bookings bulan ini
SELECT SUM(bookings.total_price) FROM bookings
JOIN courts ON bookings.court_id = courts.id
JOIN venues ON courts.venue_id = venues.id
WHERE venues.user_id = ? 
  AND bookings.status = 'confirmed'
  AND YEAR(bookings.booking_date) = YEAR(NOW())
  AND MONTH(bookings.booking_date) = MONTH(NOW())

-- Pending Bookings: Count dari pending dengan payment_proof
SELECT COUNT(*) FROM bookings
JOIN courts ON bookings.court_id = courts.id
JOIN venues ON courts.venue_id = venues.id
WHERE venues.user_id = ?
  AND bookings.status = 'pending'
  AND bookings.payment_proof IS NOT NULL

-- Recent Bookings: Latest 5 dengan join ke user & court
SELECT bookings.*, users.name, courts.name FROM bookings
JOIN courts ON bookings.court_id = courts.id
JOIN venues ON courts.venue_id = venues.id
JOIN users ON bookings.user_id = users.id
WHERE venues.user_id = ?
ORDER BY bookings.created_at DESC
LIMIT 5
```

## Styling & UI/UX

### Design System
- **Color Scheme:** Tailwind CSS palette
- **Icons:** lucide-react (24px standard size)
- **Dark Mode:** Full support dengan `dark:` prefixes
- **Spacing:** Using Tailwind default scale
- **Borders:** Subtle borders (border-gray-200 / dark:border-gray-700)
- **Shadows:** md (medium) untuk cards, lg untuk hover states

### Components Used
1. **StatCard:** Reusable component untuk statistik
2. **StatusBadge:** Status indicator dengan kode warna
3. **Tables:** Custom styling dengan hover states
4. **Pagination:** Custom implementation dengan Inertia Link

### Responsive Design
```
Mobile:   1 column
Tablet:   2 columns (md:grid-cols-2)
Desktop:  4 columns (lg:grid-cols-4)
```

## Fitur Keamanan

1. **Authorization:**
   - Middleware `auth` & `verified` di semua routes
   - Owner hanya melihat data miliknya sendiri
   - Query WHERE `venues.user_id = Auth::id()`

2. **Data Filtering:**
   - Semua queries di-filter dengan user_id
   - Tidak ada data owner lain yang terekspos
   - Pagination mencegah data dumping

3. **Validation:**
   - Booking data di-validate sebelum insert
   - Payment proof verification untuk pending bookings

## Testing

File test: `tests/Feature/Owner/DashboardTest.php`

Test coverage:
- ✓ Owner dapat akses dashboard
- ✓ Total venues count akurat
- ✓ Total courts count akurat
- ✓ Monthly revenue calculation benar
- ✓ Pending bookings dengan payment_proof di-count
- ✓ Recent bookings limit 5 dan sorted correctly
- ✓ Booking details lengkap
- ✓ Owner tidak melihat booking dari owner lain
- ✓ Unauthenticated user redirect ke login

## Performance Optimization

1. **Query Optimization:**
   - Menggunakan `->with('courts')` untuk eager loading
   - JOIN queries untuk minimize database hits
   - Pagination untuk limit data output

2. **Frontend Optimization:**
   - Lazy loading icons dari lucide-react
   - CSS minified oleh Vite
   - Component splitting untuk better tree-shaking

3. **Caching:**
   - Dapat menambahkan cache untuk statistik yang jarang berubah
   - Gunakan Laravel cache directive

## Implementasi Fitur Tambahan (Optional)

### 1. Filter & Search
```tsx
// Di Dashboard: Filter by date range, status
// Di Bookings: Search by customer name, court name, status
```

### 2. Export Data
```php
// Add method di BookingController untuk export CSV/PDF
public function export(Request $request) {}
```

### 3. Analytics Chart
```tsx
// Tambah chart untuk revenue trend monthly
import { LineChart } from 'recharts';
```

### 4. Booking Approval
```php
// Add approval/rejection flow untuk pending bookings
public function approve(Booking $booking) {}
public function reject(Booking $booking) {}
```

## Routes Summary

| Method | Route | Controller | Name |
|--------|-------|-----------|------|
| GET | `/owner/dashboard` | DashboardController@index | owner.dashboard |
| GET | `/owner/bookings` | BookingController@index | owner.bookings.index |
| GET | `/owner/venues` | VenueController@index | owner.venues.index |
| POST | `/owner/venues` | VenueController@store | owner.venues.store |
| GET | `/owner/venues/create` | VenueController@create | owner.venues.create |
| GET | `/owner/venues/{id}/edit` | VenueController@edit | owner.venues.edit |
| PUT | `/owner/venues/{id}` | VenueController@update | owner.venues.update |
| DELETE | `/owner/venues/{id}` | VenueController@destroy | owner.venues.destroy |

## Installation & Setup

1. **Backend:**
   ```bash
   # Routes sudah di-update
   # Controllers sudah di-create
   php artisan route:list --name=owner  # Verify routes
   ```

2. **Frontend:**
   ```bash
   npm run build  # Compile TypeScript/React
   npm run dev    # Development dengan hot reload
   ```

3. **Database:**
   ```bash
   # Migration untuk user_id di venues sudah ada
   # No additional migration needed
   ```

4. **Access:**
   ```
   Login sebagai user dengan role 'owner'
   Navigate ke: http://localhost:8000/owner/dashboard
   ```

## Troubleshooting

### Dashboard tidak muncul
- Pastikan user memiliki `role = 'owner'`
- Check Auth::id() menggunakan user yang benar
- Verify database memiliki venues dengan user_id = auth_id

### Data statistik tidak akurat
- Check booking status values ('confirmed', 'pending', dll)
- Verify payment_proof column exists dan di-set
- Check booking_date format (YYYY-MM-DD)

### Routes not found
- Jalankan: `php artisan route:cache` (jika di production)
- Verify imports di routes/web.php
- Run: `php artisan route:list`

## File Structure

```
app/Http/Controllers/Owner/
├── DashboardController.php (NEW)
├── BookingController.php (NEW)
├── VenueController.php (existing)
└── CourtController.php (existing)

resources/js/pages/Owner/
├── Dashboard.tsx (NEW)
├── Venues/
│   ├── Index.tsx
│   ├── Create.tsx
│   └── Edit.tsx
├── Bookings/
│   └── Index.tsx (NEW)
└── Courts/
    ├── Index.tsx
    ├── Create.tsx
    └── Edit.tsx

routes/
└── web.php (UPDATED - added bookings route)

tests/Feature/Owner/
└── DashboardTest.php (NEW)
```
