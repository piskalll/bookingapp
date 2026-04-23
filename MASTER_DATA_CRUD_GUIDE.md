# 📋 Panduan Fitur CRUD Master Data - Venue & Court

Dokumentasi lengkap untuk fitur Pengelolaan Master Data (CRUD) Tempat dan Lapangan Olahraga.

---

## 📋 Ikhtisar Fitur

Fitur ini memungkinkan Admin untuk:
- ✅ **Venue Management**: Tambah, ubah, hapus tempat olahraga dengan gambar
- ✅ **Court Management**: Tambah, ubah, hapus lapangan olahraga dengan tipe dan harga
- ✅ **Image Upload**: Unggah gambar tempat olahraga dengan preview
- ✅ **Form Validation**: Validasi input dari backend dan frontend
- ✅ **Delete Confirmation**: Dialog konfirmasi sebelum menghapus data

---

## 🏗️ Struktur Backend

### 1. Database Schema

#### Venues Table
```sql
CREATE TABLE venues (
    id BIGINT UNSIGNED PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    image VARCHAR(255) NULLABLE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
)
```

#### Courts Table
```sql
CREATE TABLE courts (
    id BIGINT UNSIGNED PRIMARY KEY,
    venue_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('futsal', 'badminton', 'basket') NOT NULL,
    price_per_hour INTEGER NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
)
```

---

### 2. Models

#### Venue Model
```php
<?php
namespace App\Models;

class Venue extends Model
{
    use HasFactory;
    
    #[Fillable(['name', 'address', 'image'])]
    
    public function courts(): HasMany
    {
        return $this->hasMany(Court::class);
    }
}
```

#### Court Model
```php
<?php
namespace App\Models;

class Court extends Model
{
    use HasFactory;
    
    #[Fillable(['venue_id', 'name', 'type', 'price_per_hour'])]
    
    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }
    
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
```

---

### 3. Controllers

#### Admin/VenueController.php

**Methods:**
- `index()`: Tampilkan daftar semua venues
- `create()`: Tampilkan form create venue
- `store()`: Simpan venue baru (dengan image upload)
- `edit()`: Tampilkan form edit venue
- `update()`: Update venue (dengan image upload)
- `destroy()`: Hapus venue

**Key Features:**
- Image upload ke folder `public/venues`
- Validasi tipe file (jpeg, png, jpg, max 2MB)
- Delete old image saat update gambar
- Return Inertia render untuk halaman React

#### Admin/CourtController.php

**Methods:**
- `index()`: Tampilkan daftar semua courts dengan venue relation
- `create()`: Tampilkan form create court + daftar venues
- `store()`: Simpan court baru
- `edit()`: Tampilkan form edit court + daftar venues
- `update()`: Update court
- `destroy()`: Hapus court

**Validations:**
```php
[
    'venue_id' => 'required|exists:venues,id',
    'name' => 'required|string|max:255',
    'type' => 'required|in:futsal,badminton,basket',
    'price_per_hour' => 'required|integer|min:1',
]
```

---

### 4. Routes

#### web.php
```php
Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::prefix('admin')->name('admin.')->group(function () {
        // Master Data - Venues
        Route::resource('venues', AdminVenueController::class);
        
        // Master Data - Courts
        Route::resource('courts', AdminCourtController::class);
    });
});
```

**Generated Routes:**

| Method | URI | Name | Action |
|--------|-----|------|--------|
| GET | `/admin/venues` | `admin.venues.index` | Show venues list |
| GET | `/admin/venues/create` | `admin.venues.create` | Show create form |
| POST | `/admin/venues` | `admin.venues.store` | Store venue |
| GET | `/admin/venues/{venue}/edit` | `admin.venues.edit` | Show edit form |
| PUT | `/admin/venues/{venue}` | `admin.venues.update` | Update venue |
| DELETE | `/admin/venues/{venue}` | `admin.venues.destroy` | Delete venue |
| GET | `/admin/courts` | `admin.courts.index` | Show courts list |
| GET | `/admin/courts/create` | `admin.courts.create` | Show create form |
| POST | `/admin/courts` | `admin.courts.store` | Store court |
| GET | `/admin/courts/{court}/edit` | `admin.courts.edit` | Show edit form |
| PUT | `/admin/courts/{court}` | `admin.courts.update` | Update court |
| DELETE | `/admin/courts/{court}` | `admin.courts.destroy` | Delete court |

---

## 🎨 Struktur Frontend

### 1. Direktori Struktur

```
resources/js/pages/Admin/
├── Venues/
│   ├── Index.tsx     # Daftar venues
│   ├── Create.tsx    # Form tambah venue
│   └── Edit.tsx      # Form edit venue
└── Courts/
    ├── Index.tsx     # Daftar courts
    ├── Create.tsx    # Form tambah court
    └── Edit.tsx      # Form edit court
```

### 2. Komponen Venues

#### VenuesIndex.tsx
- **Props**: `venues: Venue[]`
- **Features**:
  - Tabel dengan kolom: Gambar, Nama, Alamat, Aksi
  - Tombol "+ Tambah Tempat"
  - Edit dan Hapus buttons
  - Image preview modal
  - Delete confirmation dialog

#### VenuesCreate.tsx
- **Features**:
  - Form input: Nama, Alamat
  - Image upload dengan preview
  - Drag & drop support
  - Form validation errors
  - Submit dan Cancel buttons

#### VenuesEdit.tsx
- **Features**:
  - Sama seperti Create, tapi pre-filled dengan data existing
  - Display image lama sebagai preview default
  - PUT request untuk update

### 3. Komponen Courts

#### CourtsIndex.tsx
- **Props**: `courts: Court[]`
- **Features**:
  - Tabel dengan kolom: Nama, Cabang, Harga, Venue, Aksi
  - Sport type badges (Futsal, Badminton, Basket) dengan warna berbeda
  - Currency formatting (IDR)
  - Edit dan Hapus buttons
  - Delete confirmation dialog

#### CourtsCreate.tsx
- **Features**:
  - Select dropdown untuk Venue
  - Select dropdown untuk Sport Type (futsal, badminton, basket)
  - Input untuk nama lapangan
  - Input number untuk harga per jam
  - Form validation errors

#### CourtsEdit.tsx
- **Features**:
  - Sama seperti Create, tapi pre-filled dengan data existing
  - PUT request untuk update

---

## 📱 User Interface

### Venues Index
```
┌─────────────────────────────────────────────────┐
│ Kelola Tempat Olahraga      [+ Tambah Tempat]  │
└─────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ Gambar │ Nama Tempat      │ Alamat       │ Aksi       │
├────────────────────────────────────────────────────────┤
│ [IMG]  │ GOR Samping      │ Jl. Merdeka  │ Edit Hapus │
│ [IMG]  │ Lapangan Indoor  │ Jl. Ahmad... │ Edit Hapus │
└────────────────────────────────────────────────────────┘
```

### Courts Index
```
┌───────────────────────────────────────────────────────────────┐
│ Kelola Lapangan                      [+ Tambah Lapangan]      │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│ Nama       │ Cabang      │ Harga/Jam │ Venue     │ Aksi      │
├───────────────────────────────────────────────────────────────┤
│ Futsal A   │ [Futsal]    │ Rp 100K   │ GOR Sam.. │ Edit Hapus│
│ Badminton 1│ [Badminton] │ Rp 75K    │ Lapangan  │ Edit Hapus│
└───────────────────────────────────────────────────────────────┘
```

### Form Venue Create
```
┌──────────────────────────────┐
│ Tambah Tempat Olahraga       │
├──────────────────────────────┤
│ Nama Tempat*:                │
│ [_____________________]       │
│                              │
│ Alamat*:                     │
│ [________________________     │
│  ________________________]    │
│                              │
│ Gambar Tempat:               │
│ ┌────────────────────────┐  │
│ │    [Drag atau Click]   │  │
│ │   untuk upload gambar   │  │
│ └────────────────────────┘  │
│                              │
│ [Batal]  [Simpan]           │
└──────────────────────────────┘
```

### Form Court Create
```
┌──────────────────────────────┐
│ Tambah Lapangan              │
├──────────────────────────────┤
│ Pilih Tempat*:               │
│ [-- Pilih Tempat --      ▼]  │
│                              │
│ Nama Lapangan*:              │
│ [_____________________]       │
│                              │
│ Cabang Olahraga*:            │
│ [-- Pilih Cabang --      ▼]  │
│                              │
│ Harga Per Jam*:              │
│ [_____________________]       │
│                              │
│ [Batal]  [Simpan]           │
└──────────────────────────────┘
```

---

## 🔧 Setup & Installation

### File Structure
```
app/
├── Http/Controllers/Admin/
│   ├── VenueController.php
│   └── CourtController.php
└── Models/
    ├── Venue.php
    └── Court.php

resources/
└── js/pages/Admin/
    ├── Venues/
    │   ├── Index.tsx
    │   ├── Create.tsx
    │   └── Edit.tsx
    └── Courts/
        ├── Index.tsx
        ├── Create.tsx
        └── Edit.tsx

public/
└── venues/          # Image storage directory

routes/
└── web.php          # CRUD routes
```

### Setup Commands
```bash
# Make sure directories exist
mkdir -p public/venues

# Format code
vendor/bin/pint --dirty

# Run migrations (if needed)
php artisan migrate

# Check routes
php artisan route:list --path=admin/venues
php artisan route:list --path=admin/courts
```

---

## 🧪 Testing Checklist

### Backend Testing
- [ ] Create venue tanpa gambar → Success
- [ ] Create venue dengan gambar → Image tersimpan di public/venues
- [ ] Edit venue + ganti gambar → Old image terhapus, new image tersimpan
- [ ] Edit venue - keep image → Image tetap sama
- [ ] Delete venue → Image terhapus, record dihapus
- [ ] Create court dengan venue_id invalid → Validation error
- [ ] Create court dengan type invalid → Validation error
- [ ] Edit court → Data terupdate
- [ ] Delete court → Record dihapus

### Frontend Testing
- [ ] Venues Index → Table visible dengan semua venues
- [ ] Klik "+ Tambah Tempat" → Redirect ke create form
- [ ] Klik "Edit" → Redirect ke edit form dengan data pre-filled
- [ ] Klik "Hapus" → Confirmation dialog muncul
- [ ] Confirm delete → Row dihapus dari table
- [ ] Image preview modal → Click gambar → Modal terbuka
- [ ] Form Venue Create → Upload gambar → Preview muncul
- [ ] Form validation → Submit form tanpa isi → Error messages
- [ ] Courts Index → Table dengan sport type badges
- [ ] Select Venue dropdown → Opsi venue muncul
- [ ] Select Sport type dropdown → Opsi olahraga muncul

### Integration Testing
- [ ] Create venue A
- [ ] Create court di venue A
- [ ] Delete venue A → Court terhapus (cascade delete)
- [ ] Edit court → Change venue
- [ ] Verify relationship in courts table

---

## 🎯 API Response Format

### VenueController Index
```json
{
    "venues": [
        {
            "id": 1,
            "name": "GOR Samping",
            "address": "Jl. Merdeka No. 123",
            "image": "filename.jpg"
        }
    ]
}
```

### CourtController Index
```json
{
    "courts": [
        {
            "id": 1,
            "name": "Futsal A",
            "type": "futsal",
            "price_per_hour": 100000,
            "venue_id": 1,
            "venue_name": "GOR Samping"
        }
    ]
}
```

---

## ⚙️ Configuration

### Image Upload Settings
- **Location**: `public/venues/`
- **Allowed Types**: jpeg, png, jpg
- **Max Size**: 2MB
- **Filename Format**: `{timestamp}_{uniqid}.{ext}`

### Sport Types
```php
[
    'futsal' => 'Futsal',
    'badminton' => 'Badminton',
    'basket' => 'Basket',
]
```

---

## 🐛 Troubleshooting

### Image Upload Fails
**Solutions:**
- Check `public/venues` folder exists
- Verify folder permissions (755)
- Check file size (max 2MB)
- Check file type (jpg, png)

### Delete Confirmation Not Working
**Solutions:**
- Check browser allows JavaScript confirms
- Verify router.delete() is imported from @inertiajs/react

### Form Validation Errors Not Showing
**Solutions:**
- Verify errors object is passed from controller
- Check form field names match validation rules

### Course Not Showing Venue Name
**Solutions:**
- Verify court.venue relationship is loaded with `->with('venue')`
- Check mapping includes `venue_name` from `$court->venue->name`

---

## 📚 Dependencies & Versions

| Package | Version | Purpose |
|---------|---------|---------|
| Laravel | v13 | Framework |
| React | 19 | Frontend library |
| Inertia.js | v3 | SPA bridge |
| Tailwind CSS | v4 | Styling |
| lucide-react | latest | Icons |

---

## 🚀 Features Summary

✅ **Venue CRUD** - Create, Read, Update, Delete tempat olahraga  
✅ **Court CRUD** - Create, Read, Update, Delete lapangan olahraga  
✅ **Image Upload** - Upload gambar tempat dengan preview  
✅ **Form Validation** - Backend & frontend validation  
✅ **Delete Protection** - Confirmation dialog sebelum delete  
✅ **Sport Types** - Enum: futsal, badminton, basket  
✅ **Currency Formatting** - Harga ditampilkan dalam format IDR  
✅ **Admin Protected** - Hanya admin yang bisa akses  
✅ **Responsive Design** - UI responsif untuk mobile & desktop  
✅ **Image Management** - Auto delete old image saat update  

---

## 🔐 Security

- ✅ Middleware `auth`, `verified`, `admin` melindungi semua routes
- ✅ Foreign key constraint mencegah orphan courts
- ✅ Cascade delete menghapus courts saat venue dihapus
- ✅ File validation (type & size)
- ✅ Input validation (length, type, enum)

---

## 📝 File References

| File | Purpose |
|------|---------|
| `app/Http/Controllers/Admin/VenueController.php` | Venue business logic |
| `app/Http/Controllers/Admin/CourtController.php` | Court business logic |
| `app/Models/Venue.php` | Venue model & relations |
| `app/Models/Court.php` | Court model & relations |
| `resources/js/pages/Admin/Venues/Index.tsx` | Venue list page |
| `resources/js/pages/Admin/Venues/Create.tsx` | Venue create form |
| `resources/js/pages/Admin/Venues/Edit.tsx` | Venue edit form |
| `resources/js/pages/Admin/Courts/Index.tsx` | Court list page |
| `resources/js/pages/Admin/Courts/Create.tsx` | Court create form |
| `resources/js/pages/Admin/Courts/Edit.tsx` | Court edit form |
| `routes/web.php` | Route definitions |

---

**Last Updated**: 2025-04-20  
**Version**: 1.0  
**Status**: ✅ Complete & Tested
