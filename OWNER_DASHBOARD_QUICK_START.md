# Owner Dashboard - Quick Start Guide

## 🚀 Fitur yang Sudah Dibuat

### 1. Dashboard Owner (`/owner/dashboard`)
Halaman utama yang menampilkan:
- 4 Stat Cards: Total Venue, Total Lapangan, Pendapatan Bulanan, Pesanan Menunggu
- Tabel 5 Pesanan Terbaru dengan detail lengkap
- Tombol navigasi ke halaman kelola pesanan

**Tampilan:**
```
┌─────────────────────────────────────────────────┐
│ Dashboard Owner                                 │
│ Kelola dan pantau bisnis penyewaan lapangan    │
└─────────────────────────────────────────────────┘

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Venue    │ │ Lapangan │ │ Revenue  │ │ Menunggu │
│    2     │ │    3     │ │Rp 2.5M   │ │    1     │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

┌─────────────────────────────────────────────────┐
│ PESANAN TERBARU                                 │
├──────┬─────────┬──────────┬──────┬────────────┤
│Penyewa│Lapangan│  Waktu   │Nominal│   Status  │
├──────┼─────────┼──────────┼──────┼────────────┤
│ Andi │Court A  │10:00-12:00│500K │ Terkonfirm│
│ Budi │Court B  │14:00-16:00│600K │ Menunggu  │
└──────┴─────────┴──────────┴──────┴────────────┘

[Lihat Semua Pesanan]
```

### 2. Kelola Pesanan Owner (`/owner/bookings`)
Halaman lengkap untuk mengelola semua pesanan dengan:
- Pagination (15 items per halaman)
- Detail customer (nama & email)
- Venue & Court yang dipesan
- Tanggal, waktu, dan nominal
- Status badges yang jelas
- Responsive untuk mobile

## 📍 Routes yang Tersedia

```
GET  /owner/dashboard          → owner.dashboard        (Dashboard)
GET  /owner/bookings           → owner.bookings.index   (Kelola Pesanan)
GET  /owner/venues             → owner.venues.index     (Kelola Tempat)
POST /owner/venues             → owner.venues.store     (Buat Venue)
GET  /owner/venues/create      → owner.venues.create    (Form Tambah)
GET  /owner/venues/{id}/edit   → owner.venues.edit      (Form Edit)
PUT  /owner/venues/{id}        → owner.venues.update    (Update Venue)
GET  /owner/venues/{id}/courts → owner.venues.courts.index
```

## 🔑 Cara Menggunakan

### Langkah 1: Pastikan User adalah Owner
```php
// Di database, user harus memiliki role = 'owner'
UPDATE users SET role = 'owner' WHERE id = 1;
```

### Langkah 2: Buat/Tambahkan Venue untuk Owner
```php
// Venue harus memiliki user_id yang sesuai dengan owner
INSERT INTO venues (name, address, user_id) 
VALUES ('Lapangan Bola', 'Jl. Main St', 1);
```

### Langkah 3: Akses Dashboard
1. Login sebagai user dengan role 'owner'
2. Buka: `http://localhost:8000/owner/dashboard`
3. Lihat statistik dan pesanan terbaru

### Langkah 4: Kelola Pesanan
- Klik tombol "Lihat Semua Pesanan"
- Atau navigate ke: `http://localhost:8000/owner/bookings`
- Lihat daftar lengkap pesanan dengan pagination

## 🎨 UI/UX Features

### Dark Mode
✓ Full dark mode support
✓ Toggle di navbar (jika sudah disetup di layout)
✓ Otomatis mengikuti system preference

### Responsive Design
✓ Mobile: 1 kolom stat cards
✓ Tablet: 2 kolom stat cards
✓ Desktop: 4 kolom stat cards
✓ Tabel responsive dengan scroll horizontal

### Status Badges
```
🟡 Menunggu    - Amber   (pending bookings awaiting approval)
🟢 Terkonfirm  - Green   (confirmed bookings)
🔵 Selesai     - Blue    (completed bookings)
🔴 Dibatalkan  - Red     (cancelled/rejected bookings)
```

### Icons
Menggunakan lucide-react icons:
- 🏠 Home → Total Venue
- 📐 Layout → Total Lapangan
- 💰 DollarSign → Pendapatan
- ⏰ Clock → Pesanan Menunggu

## 📊 Statistik yang Ditampilkan

### 1. Total Venues
- Jumlah venue yang dimiliki owner
- Real-time dari database

### 2. Total Courts
- Total lapangan dari semua venue owner
- Dihitung otomatis dari relasi venue → courts

### 3. Monthly Revenue
- Sum pendapatan dari booking status 'confirmed'
- Hanya untuk bulan berjalan (current month)
- Format currency IDR

### 4. Pending Bookings
- Count booking dengan status 'pending'
- Hanya yang sudah memiliki payment_proof
- Siap untuk disetujui/ditolak

### 5. Recent Bookings
- 5 booking terbaru (sorted by created_at DESC)
- Menampilkan: customer, court, waktu, nominal, status
- Klik row untuk melihat detail (optional feature)

## 🔒 Security Features

✓ **Authentication Check**: Only logged-in users can access
✓ **Authorization**: Owner hanya melihat data miliknya
✓ **Data Isolation**: Query WHERE venues.user_id = auth()->id()
✓ **CSRF Protection**: Built-in Laravel protection
✓ **Rate Limiting**: Optional per route

## 🧪 Testing

### Jalankan Tests
```bash
# Run semua owner dashboard tests
php artisan test tests/Feature/Owner/DashboardTest.php

# Run dengan verbose output
php artisan test tests/Feature/Owner/DashboardTest.php -v

# Run specific test
php artisan test tests/Feature/Owner/DashboardTest.php --filter="can_access_dashboard"
```

### Test Coverage
✓ Access control
✓ Statistics calculation
✓ Booking retrieval
✓ Data filtering
✓ Pagination
✓ Dark mode rendering

## 🛠️ Maintenance

### Add New Statistics
```php
// Di DashboardController@index
$newStat = DB::table('...')->where(...)->count();

// Return di Inertia
return Inertia::render('Owner/Dashboard', [
    'statistics' => [
        'new_stat' => $newStat,
        // ... existing
    ]
]);
```

### Customize Styling
```tsx
// Di Dashboard.tsx, modify Tailwind classes
// Example: Change stat card background
className="bg-white" → "bg-gradient-to-br from-blue-50"
```

### Add Filters
```tsx
// Di Bookings/Index.tsx
const [status, setStatus] = useState('');

// Filter query
const filteredBookings = bookings.filter(b => {
    if (status) return b.status === status;
    return true;
});
```

## 📱 Mobile Responsiveness

```
Mobile (< 640px):
├─ Stack cards vertically (1 column)
├─ Table scrollable horizontally
└─ Touch-friendly buttons (44px min height)

Tablet (640px - 1024px):
├─ 2 column stat cards
├─ Readable table columns
└─ Comfortable spacing

Desktop (> 1024px):
├─ 4 column stat cards
├─ Full table visibility
└─ Optimal spacing
```

## 🔧 Configuration

### Pagination Items
```php
// Di BookingController@index
->paginate(15) // Change number as needed
```

### Recent Bookings Limit
```php
// Di DashboardController@index
->limit(5) // Change number as needed
```

### Date Format
```tsx
// Di Dashboard.tsx
format(dateObj, 'dd MMM yyyy', { locale: id })
// Change format pattern as needed
```

## 📋 Checklist Deployment

- [ ] User dengan role 'owner' sudah ada di database
- [ ] Venues sudah memiliki user_id
- [ ] Courts sudah linked ke venues
- [ ] Bookings sudah memiliki status values yang benar
- [ ] Payment proofs sudah di-upload untuk pending bookings
- [ ] Frontend sudah di-build (`npm run build`)
- [ ] Routes sudah di-verify (`php artisan route:list`)
- [ ] Tests passing (`php artisan test`)
- [ ] CSS/Dark mode sudah di-test
- [ ] Mobile responsiveness sudah di-test

## 🚨 Troubleshooting

### Dashboard blank/error
```
1. Check console untuk JavaScript errors
2. Verify data ada di database
3. Jalankan: php artisan cache:clear
4. Rebuild: npm run build
```

### Statistics tidak update
```
1. Clear cache: php artisan cache:clear
2. Check database query di tinker
3. Verify booking dates ada di current month
4. Check status values ('confirmed', 'pending')
```

### Routes not found
```
1. Jalankan: php artisan route:cache --forget
2. Verify route definitions di web.php
3. Jalankan: php artisan route:list
```

### Component not rendering
```
1. Check TypeScript compilation error
2. Run: npm run build
3. Clear browser cache (Ctrl+F5)
4. Check browser console for errors
```

## 📞 Support

Untuk error atau question:
1. Check console browser (F12 → Console)
2. Check Laravel logs: `storage/logs/laravel.log`
3. Jalankan: `php artisan config:show` untuk debug config
4. Tinker: `php artisan tinker` untuk test queries

## 🎉 Next Steps

### Optional Enhancements
1. **Export Data**: Add CSV/PDF export untuk bookings
2. **Charts**: Add monthly revenue trend chart
3. **Notifications**: Real-time notification untuk new bookings
4. **Approval Flow**: Add approve/reject buttons untuk pending bookings
5. **Analytics**: Advanced analytics dashboard
6. **Reports**: Generate custom reports

### Integration
1. Email notification saat ada booking baru
2. SMS alert untuk pending bookings
3. Integration dengan payment gateway untuk revenue tracking
4. Automated reminders untuk owner

---

**Last Updated:** April 29, 2026
**Version:** 1.0
**Status:** ✅ Production Ready
