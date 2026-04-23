# 📋 Admin Dashboard - Kelola Pesanan

## 🎯 Implementasi Lengkap

Halaman Admin Dashboard telah berhasil dibuat untuk mengelola semua pesanan dari pelanggan dengan fitur approval dan rejection.

---

## 📁 File yang Dibuat/Dimodifikasi

### Backend

1. **`app/Http/Controllers/Admin/BookingController.php`** ✅
   - Method `index()`: Ambil seluruh data bookings dengan relasi user, court, venue
   - Method `approve()`: Set status booking menjadi 'confirmed'
   - Method `reject()`: Set status booking menjadi 'cancelled'
   - Sorting: Pending + payment_proof di atas, kemudian waiting_confirmation, terakhir yang lain

2. **`app/Http/Middleware/AdminMiddleware.php`** ✅
   - Middleware untuk check role admin
   - Abort 403 jika user bukan admin

3. **`bootstrap/app.php`** ✅
   - Registrasi middleware alias 'admin'

4. **`routes/web.php`** ✅
   - Tambah import AdminBookingController
   - Tambah route group `/admin` dengan middleware auth, verified, admin
   - Routes: GET /admin/bookings, PUT /admin/bookings/{booking}/approve, PUT /admin/bookings/{booking}/reject

### Frontend

1. **`resources/js/pages/Admin/BookingManager.tsx`** ✅
   - Komponen React untuk halaman admin dashboard
   - Tabel dengan kolom: Pemesan, Lapangan, Waktu, Harga, Bukti Bayar, Status, Aksi
   - Modal untuk preview gambar bukti pembayaran
   - Dialog konfirmasi sebelum approve/reject
   - Integrasi dengan Inertia useForm hook

2. **`resources/js/routes/admin/bookings/index.ts`** ✅
   - Auto-generated route file dengan export: `index`, `approve`, `reject`

---

## 🔐 Middleware & Authorization

```php
// AdminMiddleware checks:
if (!auth()->check() || auth()->user()->role !== 'admin') {
    abort(403, 'Unauthorized - Admin access required');
}
```

Hanya user dengan role='admin' yang dapat akses `/admin/bookings`

---

## 📊 Database Queries

### Index Sorting Priority:
```php
// Pending/Waiting dengan payment_proof → di atas
// Waiting Confirmation → di tengah
// Yang lain → di bawah
// Terbaru first (orderByDesc created_at)
```

---

## 🎨 Frontend Features

### 1. Tabel Pesanan
- **Kolom Pemesan**: Nama + Email
- **Kolom Lapangan**: Nama court + Venue
- **Kolom Waktu**: Tanggal + Jam operasional
- **Kolom Harga**: Format currency IDR
- **Kolom Bukti Bayar**: Tombol "Lihat Bukti" atau "Belum ada bukti"
- **Kolom Status**: Badge dengan warna berbeda
  - Menunggu Pembayaran (Kuning)
  - Menunggu Konfirmasi (Orange)
  - Terkonfirmasi (Hijau)
  - Dibatalkan (Merah)
- **Kolom Aksi**: Tombol Approve (Hijau) dan Reject (Merah)

### 2. Image Preview Modal
- Modal untuk preview gambar bukti pembayaran penuh
- Klik tombol "Lihat Bukti" → Modal terbuka
- Klik X → Modal tertutup
- Background hitam semi-transparan

### 3. Confirmation Dialog
- Dialog konfirmasi sebelum approve/reject
- Teks pesan berbeda untuk setiap aksi
- Tombol "Setuju"/"Tolak" berwarna sesuai aksi
- Mencegah salah klik

### 4. Styling
- Menggunakan Tailwind CSS
- Responsive design
- Hover effects pada row tabel
- Status badges dengan icon
- Format currency automatic IDR

---

## 🚀 Cara Menggunakan

### 1. Akses Halaman Admin
```
URL: http://localhost:8000/admin/bookings
Hanya user dengan role='admin' yang dapat akses
```

### 2. View Bukti Pembayaran
```
1. Klik tombol "Lihat Bukti" di kolom Bukti Bayar
2. Modal akan menampilkan gambar penuh
3. Klik tombol X untuk tutup
```

### 3. Approve Pesanan
```
1. Cari pesanan dengan status "Menunggu Konfirmasi"
2. Klik tombol "✓ Setuju"
3. Dialog konfirmasi akan tampil
4. Klik "Setuju" untuk konfirmasi
5. Status berubah menjadi "Terkonfirmasi"
6. Flash message muncul
```

### 4. Reject Pesanan
```
1. Cari pesanan yang ingin ditolak
2. Klik tombol "✕ Tolak"
3. Dialog konfirmasi akan tampil (warna merah)
4. Klik "Tolak" untuk konfirmasi
5. Status berubah menjadi "Dibatalkan"
6. Flash message muncul
```

---

## 📝 API Endpoints

### GET /admin/bookings
```
Response: Inertia::render('Admin/BookingManager', ['bookings' => ...])
Data yang dikembalikan:
- id, user_name, user_email
- court_name, court_type, venue_name, venue_address
- booking_date, start_time, end_time
- total_price, status, payment_proof, created_at
```

### PUT /admin/bookings/{booking}/approve
```
Request: PUT /admin/bookings/1/approve
Response: redirect()->back()->with('success', message)
Effect: Set booking.status = 'confirmed'
```

### PUT /admin/bookings/{booking}/reject
```
Request: PUT /admin/bookings/1/reject
Response: redirect()->back()->with('success', message)
Effect: Set booking.status = 'cancelled'
```

---

## 🧪 Testing

### 1. Test Admin Access
```bash
# Login sebagai admin user
# Email: admin@example.com
# Password: password

# Akses /admin/bookings
# Seharusnya bisa masuk dan lihat tabel
```

### 2. Test Non-Admin Access
```bash
# Login sebagai customer
# Akses /admin/bookings
# Seharusnya dapat error 403 Unauthorized
```

### 3. Test Approve Pesanan
```bash
# Database: Insert booking dengan status='waiting_confirmation' dan payment_proof filled
# Klik tombol Approve
# Dialog konfirmasi tampil
# Klik Setuju
# Status harus berubah menjadi 'confirmed'
# Flash message harus tampil
```

### 4. Test Reject Pesanan
```bash
# Klik tombol Reject
# Dialog konfirmasi tampil (merah)
# Klik Tolak
# Status harus berubah menjadi 'cancelled'
# Flash message harus tampil
```

### 5. Test Preview Bukti
```bash
# Klik "Lihat Bukti" pada booking dengan payment_proof
# Modal harus menampilkan gambar
# Klik X untuk tutup modal
```

---

## 🔍 Debugging

### Jika middleware tidak bekerja:
```bash
# Verifikasi middleware terdaftar
php artisan route:list --path=admin

# Check user role di database
php artisan tinker
>>> auth()->user()->role
```

### Jika routes tidak ada:
```bash
# Regenerate routes
php artisan route:cache
php artisan route:clear
```

### Jika modal/dialog tidak muncul:
```
Cek browser console (F12) untuk error
Pastikan Inertia dan React sudah ter-import dengan benar
```

---

## 📊 Status Booking Flow

```
pending (user belum bayar)
    ↓ (user upload bukti bayar)
waiting_confirmation (admin review)
    ↓ (admin approve)
confirmed (pembayaran diterima)

ATAU

pending/waiting_confirmation
    ↓ (admin reject)
cancelled (pesanan ditolak)
```

---

## 🎁 Features Tambahan yang Bisa Dikembangkan

1. **Export to Excel**: Tombol export data bookings
2. **Filter & Search**: Filter berdasarkan status, tanggal, nama
3. **Pagination**: Jika data terlalu banyak
4. **Email Notifications**: Kirim email saat approve/reject
5. **Admin Notes**: Field untuk catatan admin
6. **Refund Management**: Opsi untuk refund pembayaran
7. **Payment Verification**: Upload bukti transfer admin
8. **Dashboard Analytics**: Chart untuk stats pesanan
9. **Bulk Actions**: Approve/Reject multiple bookings
10. **Audit Log**: Track perubahan status dan siapa yang approve

---

## ✅ Checklist Verifikasi

- [ ] Admin middleware berfungsi dengan benar
- [ ] Routes admin terdaftar di Artisan route:list
- [ ] Halaman admin accessible via URL /admin/bookings
- [ ] Non-admin user mendapat error 403
- [ ] Tabel menampilkan semua bookings
- [ ] Tombol "Lihat Bukti" membuka modal dengan gambar
- [ ] Tombol "Setuju" dan "Tolak" menampilkan dialog konfirmasi
- [ ] Approve mengubah status menjadi 'confirmed'
- [ ] Reject mengubah status menjadi 'cancelled'
- [ ] Flash message tampil setelah approve/reject
- [ ] Sorting: Pending + payment_proof di atas
- [ ] Responsive design bekerja baik

---

**Status**: ✅ Implementasi Lengkap  
**Last Updated**: April 20, 2026  
**Version**: 1.0
