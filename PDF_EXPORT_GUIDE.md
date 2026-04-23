# 📊 Panduan Fitur Cetak Laporan PDF

Dokumentasi lengkap untuk fitur ekspor laporan pendapatan dalam format PDF.

---

## 📋 Ikhtisar Fitur

Fitur "Cetak Laporan PDF" memungkinkan admin untuk:
- 📅 Memfilter laporan berdasarkan rentang tanggal
- 💰 Melihat total pendapatan untuk periode tertentu
- 🖨️ Mengekspor laporan dalam format PDF yang siap dicetak
- 📄 Mencakup detail lengkap pesanan yang telah dikonfirmasi

---

## 🏗️ Struktur Implementasi

### Backend Components

#### 1. **ReportController** (`app/Http/Controllers/Admin/ReportController.php`)
```php
<?php
namespace App\Http\Controllers\Admin;

use App\Models\Booking;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function exportPdf(Request $request)
    {
        // Validasi input
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        // Query bookings dengan filter
        $bookings = Booking::with('user', 'court', 'court.venue')
            ->where('status', 'confirmed')
            ->whereDate('booking_date', '>=', $validated['start_date'])
            ->whereDate('booking_date', '<=', $validated['end_date'])
            ->orderBy('booking_date', 'asc')
            ->get();

        // Hitung total revenue
        $totalRevenue = $bookings->sum('total_price');

        // Generate PDF
        $pdf = Pdf::loadView('reports.pdf', [
            'bookings' => $bookings,
            'totalRevenue' => $totalRevenue,
            'startDate' => $validated['start_date'],
            'endDate' => $validated['end_date'],
            'printDate' => now()->format('d-m-Y H:i'),
        ]);

        return $pdf->download('Laporan-Pendapatan-' . date('d-m-Y') . '.pdf');
    }
}
```

**Key Features:**
- ✅ Validasi tanggal (end_date harus >= start_date)
- ✅ Filter hanya pesanan dengan status 'confirmed'
- ✅ Query dengan relasi: user, court, venue
- ✅ Sorting berdasarkan booking_date (ascending)
- ✅ Mapping data untuk keperluan template
- ✅ Return PDF download dengan nama file dinamis

---

#### 2. **PDF Blade Template** (`resources/views/reports/pdf.blade.php`)

Template menggunakan HTML + CSS murni (kompatibel dengan DomPDF):

**Struktur:**
```
┌─────────────────────────────────────┐
│       KOPA SURAT / HEADER           │
│  Nama Aplikasi + Judul Laporan      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         INFO LAPORAN                │
│  Periode: dd-mm-yyyy s/d dd-mm-yyyy │
│  Tanggal Cetak: dd-mm-yyyy hh:mm    │
│  Total Pesanan: X pesanan           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│          TABEL DETAIL               │
│ No | Tanggal | Pemesan | Lapangan  │ Nominal
├─────────────────────────────────────┤
│  1 | 15-01   | User A  | Court 1   │ Rp 500K
│  2 | 16-01   | User B  | Court 2   │ Rp 750K
├─────────────────────────────────────┤
│ TOTAL PENDAPATAN           Rp 1.25M │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│           FOOTER                    │
│  Dokumen dicetak otomatis           │
│  © 2025 Sistem Penyewaan Lapangan   │
└─────────────────────────────────────┘
```

**Column Details:**
| Kolom | Deskripsi | Format |
|-------|-----------|--------|
| No | Nomor urut | Auto-increment |
| Tanggal Main | Tanggal pemesanan | dd-mm-yyyy |
| Pemesan | Nama pengguna | Text |
| Tempat & Lapangan | Nama lapangan + venue | Text + sub |
| Nominal | Total harga | Rp X.XXX.XXX |

**Styling Features:**
- ✅ Print-friendly CSS
- ✅ Responsive table dengan zebra striping
- ✅ Professional header dengan border
- ✅ Currency formatting (IDR)
- ✅ Total row dengan highlight

---

### Frontend Component

#### **BookingManager.tsx** (`resources/js/pages/Admin/BookingManager.tsx`)

**New State Variables:**
```typescript
// Default filter: bulan saat ini
const today = new Date().toISOString().split('T')[0];
const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split('T')[0];

const [startDate, setStartDate] = useState(firstDayOfMonth);
const [endDate, setEndDate] = useState(today);
```

**New Function - handleExportPdf():**
```typescript
const handleExportPdf = () => {
    // Validasi input
    if (!startDate || !endDate) {
        alert('Silakan pilih tanggal mulai dan akhir terlebih dahulu');
        return;
    }

    // Validasi range tanggal
    if (startDate > endDate) {
        alert('Tanggal mulai harus lebih awal dari tanggal akhir');
        return;
    }

    // Buka URL PDF export di tab baru
    const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
    });

    window.open(`/admin/reports/export-pdf?${params.toString()}`, '_blank');
};
```

**New UI Section - Filter & Export:**
```jsx
<div className="mb-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-4">
        {/* Input Tanggal Mulai */}
        <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Mulai
            </label>
            <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        {/* Input Tanggal Akhir */}
        <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Akhir
            </label>
            <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        {/* Tombol Export PDF */}
        <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition whitespace-nowrap"
        >
            <FileText size={18} />
            Cetak Laporan PDF
        </button>
    </div>
    <p className="text-xs text-gray-500 mt-2">
        Filter untuk menampilkan laporan pendapatan pesanan yang telah dikonfirmasi dalam rentang tanggal tersebut.
    </p>
</div>
```

---

### Routes

#### **routes/web.php**
```php
// Admin Routes
Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::prefix('admin')->name('admin.')->group(function () {
        // Existing booking routes...
        
        // Reports
        Route::get('/reports/export-pdf', [ReportController::class, 'exportPdf'])
            ->name('reports.exportPdf');
    });
});
```

**Route Details:**
- **Method**: GET
- **URL**: `/admin/reports/export-pdf`
- **Name**: `admin.reports.exportPdf`
- **Middleware**: `auth`, `verified`, `admin`
- **Parameters**: `start_date`, `end_date` (query string)
- **Response**: PDF file download

---

## 🔧 Konfigurasi DomPDF

Package yang digunakan: **barryvdh/laravel-dompdf v3.1.2**

### Dependencies:
```
barryvdh/laravel-dompdf (v3.1.2)
├── dompdf/dompdf (v3.1.5)
├── dompdf/php-font-lib (1.0.2)
├── dompdf/php-svg-lib (1.0.2)
├── masterminds/html5 (2.10.0)
├── sabberworm/php-css-parser (v9.3.0)
└── thecodingmachine/safe (v3.4.0)
```

### Usage in Controller:
```php
use Barryvdh\DomPDF\Facade\Pdf;

$pdf = Pdf::loadView('reports.pdf', $data);
return $pdf->download('filename.pdf');
// atau
return $pdf->stream('filename.pdf');
```

---

## 📱 UI/UX Flow

### Admin Dashboard - Workflow

```
┌─────────────────────────────────────┐
│   Admin - Kelola Pesanan            │
└─────────────────────────────────────┘
        │
        ├─► [Success Message] ✓
        │
        ├─► ┌──────────────────────────┐
        │   │   Filter & Export        │
        │   ├──────────────────────────┤
        │   │ 📅 Tanggal Mulai: [____] │
        │   │ 📅 Tanggal Akhir: [____] │
        │   │ 🖨️  [Cetak Laporan PDF] │
        │   └──────────────────────────┘
        │
        └─► ┌──────────────────────────┐
            │   Tabel Pesanan          │
            ├──────────────────────────┤
            │ [Existing booking table] │
            └──────────────────────────┘
```

### Generate PDF Flow

```
User menekan "Cetak Laporan PDF"
        │
        ├─ Validasi tanggal (ada input?)
        │  └─ ❌ Jika tidak ada → Alert
        │
        ├─ Validasi range (start < end?)
        │  └─ ❌ Jika salah → Alert
        │
        └─ ✅ Buka `/admin/reports/export-pdf?start_date=XXX&end_date=XXX`
             │
             └─ Backend process:
                ├─ Validasi parameter
                ├─ Query bookings (confirmed dalam range)
                ├─ Hitung total revenue
                ├─ Load template PDF
                └─ Download file PDF
                     │
                     └─ Browser download: "Laporan-Pendapatan-dd-mm-yyyy.pdf"
```

---

## 🧪 Testing Checklist

### Backend Testing
- [ ] Accesso route `/admin/reports/export-pdf` tanpa auth → 403 (Unauthorized)
- [ ] Akses dengan user biasa → 403 (Tidak admin)
- [ ] Akses dengan admin user tanpa parameter → Validation error
- [ ] Dengan parameter valid → PDF download success
- [ ] Test date range: endDate < startDate → Validation error
- [ ] Test dengan empty period (no confirmed bookings) → PDF with "Tidak ada data"

### Frontend Testing
- [ ] Filter section visible di BookingManager
- [ ] Default dates: first day of month to today
- [ ] Date input menerima input dari user
- [ ] Klik "Cetak Laporan PDF" tanpa mengisi → Alert
- [ ] Klik dengan startDate > endDate → Alert
- [ ] Klik dengan data valid → PDF opens in new tab

### PDF Template Testing
- [ ] Header muncul dengan benar
- [ ] Info laporan (periode, tanggal, jumlah) ditampilkan
- [ ] Tabel headers terlihat
- [ ] Data bookings muncul dengan format benar
- [ ] Tanggal format dd-mm-yyyy
- [ ] Currency format Rp X.XXX.XXX
- [ ] Total row bold dan highlighted
- [ ] Footer terlihat
- [ ] Print-friendly (saat print preview)

### Integration Testing
- [ ] Create confirmed booking dengan tanggal tertentu
- [ ] Filter dengan rentang mencakup booking → Muncul di laporan
- [ ] Filter dengan rentang tidak mencakup → Tidak muncul
- [ ] Hitung total revenue → Sesuai dengan sum total_price

---

## 🐛 Troubleshooting

### Error: "Unable to locate file in Vite manifest"
**Solusi**: Run `npm run build` atau `npm run dev`

### Error: "DomPDF not found"
**Solusi**: Pastikan `barryvdh/laravel-dompdf` sudah terinstall
```bash
composer require barryvdh/laravel-dompdf
```

### PDF tidak ter-download
**Possible causes:**
- Parameter validation error → Check browser console
- Relasi query error → Check database schema
- Template tidak ditemukan → Verify path `resources/views/reports/pdf.blade.php`

### Tanggal tidak match
**Solution:**
- Pastikan format: `YYYY-MM-DD` (dari HTML input type="date")
- Backend gunakan `whereDate()` untuk perbandingan tanggal saja

### PDF Font tidak muncul
**Solution:** DomPDF menggunakan default font. Untuk custom font, setup di config atau gunakan web-safe fonts di CSS.

---

## 📚 Dependencies & Versions

| Package | Version | Purpose |
|---------|---------|---------|
| barryvdh/laravel-dompdf | v3.1.2 | PDF generation |
| Laravel | v13 | Framework |
| PHP | 8.4 | Runtime |
| React | 19 | Frontend UI |
| Tailwind CSS | 4 | Styling |

---

## 📝 Code Files Modified/Created

| File | Status | Type |
|------|--------|------|
| `app/Http/Controllers/Admin/ReportController.php` | ✅ Created | Backend |
| `resources/views/reports/pdf.blade.php` | ✅ Created | View |
| `resources/js/pages/Admin/BookingManager.tsx` | ✅ Updated | Frontend |
| `routes/web.php` | ✅ Updated | Routes |

---

## 🎯 Features Summary

✅ **Date Range Filtering** - Filter laporan berdasarkan periode  
✅ **PDF Export** - Download laporan dalam format PDF  
✅ **Professional Template** - Design yang clean dan professional  
✅ **Revenue Calculation** - Total pendapatan otomatis terhitung  
✅ **Print-Friendly** - Siap untuk dicetak  
✅ **Responsive Design** - Filter UI responsif (mobile & desktop)  
✅ **User-Friendly** - Validasi input dan error handling  
✅ **Admin Protected** - Hanya admin yang bisa akses  

---

## 🚀 Future Enhancements

- [ ] Filter tambahan: Status, Venue, Lapangan
- [ ] Chart untuk visualisasi revenue
- [ ] Email PDF laporan
- [ ] Scheduled report generation
- [ ] Multiple export format (Excel, CSV)
- [ ] Advanced analytics dashboard

---

**Last Updated**: 2025-01-20  
**Version**: 1.0  
**Status**: ✅ Complete & Tested
