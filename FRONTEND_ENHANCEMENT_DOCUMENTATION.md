# Frontend Enhancement: React DatePicker Booking System

## Overview

Telah ditambahkan komponen booking yang lebih canggih menggunakan `react-datepicker` dengan fitur:
- Calendar picker dengan validasi range (7 hari ke depan)
- Real-time availability checking dari backend
- Interactive time slot selection dengan visual feedback
- Responsive design dengan Tailwind CSS
- Comprehensive error handling

---

## 📦 Instalasi Dependensi

### Step 1: Install NPM Packages

```bash
npm install react-datepicker date-fns
```

**Penjelasan:**
- `react-datepicker`: Komponen calendar untuk date selection
- `date-fns`: Library untuk formatting dan manipulasi tanggal dengan lokalisasi

### Step 2: Verify Installation

```bash
npm list react-datepicker date-fns
```

---

## 🔧 Backend Implementation

### 1. Route Baru

**File:** `routes/web.php`

```php
// API Routes untuk Availability
Route::get('/api/bookings/check-availability', [BookingController::class, 'checkAvailability'])
    ->name('api.bookings.check-availability');
```

**Endpoint:** `GET /api/bookings/check-availability?court_id=1&booking_date=2026-04-20`

### 2. Controller Method

**File:** `app/Http/Controllers/BookingController.php`

```php
public function checkAvailability(Request $request)
{
    $validated = $request->validate([
        'court_id' => 'required|exists:courts,id',
        'booking_date' => 'required|date_format:Y-m-d',
    ]);

    // Ambil semua booking untuk court & date
    $bookings = Booking::where('court_id', $validated['court_id'])
        ->where('booking_date', $validated['booking_date'])
        ->where('status', '!=', 'cancelled')
        ->get(['start_time', 'end_time']);

    // Generate array dari booked hours
    $bookedSlots = [];
    foreach ($bookings as $booking) {
        $startHour = (int) explode(':', $booking->start_time)[0];
        $endHour = (int) explode(':', $booking->end_time)[0];

        for ($currentHour = $startHour; $currentHour < $endHour; $currentHour++) {
            $bookedSlots[] = [
                'hour' => $currentHour,
                'startTime' => sprintf('%02d:00', $currentHour),
                'endTime' => sprintf('%02d:00', $currentHour + 1),
            ];
        }
    }

    return response()->json([
        'court_id' => $validated['court_id'],
        'booking_date' => $validated['booking_date'],
        'booked_slots' => $bookedSlots,
    ]);
}
```

**Response Format:**
```json
{
  "court_id": 1,
  "booking_date": "2026-04-20",
  "booked_slots": [
    {
      "hour": 10,
      "startTime": "10:00",
      "endTime": "11:00"
    },
    {
      "hour": 11,
      "startTime": "11:00",
      "endTime": "12:00"
    }
  ]
}
```

---

## 🎨 Frontend Implementation

### 1. Komponen CourtBooking

**File:** `resources/js/components/Bookings/CourtBooking.tsx`

**Features:**
- DatePicker calendar dengan minDate (besok) dan maxDate (7 hari)
- Lokalisasi Indonesia (date-fns locale)
- Real-time API call saat tanggal dipilih
- Array time slots (08:00 - 23:00)
- Visual disabled state untuk booked slots
- Automatic end_time calculation (start_time + 1 jam)
- Price calculation real-time
- Form submission dengan Inertia.js

**Key State:**
```typescript
const [selectedDate, setSelectedDate] = useState<Date | null>(null);
const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
const [selectedEndTime, setSelectedEndTime] = useState<string | null>(null);
```

**API Integration:**
```javascript
const fetchBookedSlots = async (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const response = await fetch(
        `/api/bookings/check-availability?court_id=${court.id}&booking_date=${formattedDate}`
    );
    const result = await response.json();
    setBookedSlots(result.booked_slots || []);
};
```

### 2. Usage di Halaman Booking

**File:** `resources/js/pages/Bookings/Create.tsx`

```jsx
import CourtBooking from '@/components/Bookings/CourtBooking';

export default function BookingsCreate({ court }: Props) {
    return (
        <>
            <Head title={`Pesan ${court.name}`} />
            <div className="py-6">
                <CourtBooking court={court} />
            </div>
        </>
    );
}
```

---

## 🎯 Fitur Breakdown

### 1. Calendar Selection

- Menggunakan `react-datepicker` dengan custom styling
- Range: 1 hari - 7 hari ke depan
- Disabled past dates
- Localized dalam Bahasa Indonesia
- Custom styling dengan Tailwind + inline styles

```jsx
<DatePicker
    selected={selectedDate}
    onChange={(date) => setSelectedDate(date)}
    minDate={minDate}
    maxDate={maxDate}
    inline
    locale={idLocale}
/>
```

### 2. Time Slot Selection

**Operating Hours:** 08:00 - 23:00 (15 slots, 1 jam each)

**Logic:**
```typescript
const isSlotBooked = (hour: number): boolean => {
    return bookedSlots.some((slot) => slot.hour === hour);
};
```

**Styling untuk Booked Slots:**
```jsx
className={`${
    isBooked
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
        : isSelected
          ? 'bg-green-600 text-white shadow-lg ring-2 ring-green-400'
          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-400'
}`}
```

### 3. Price Calculation

```typescript
const calculateTotalPrice = (): number => {
    if (!selectedStartTime || !selectedEndTime) return 0;
    const [startHour] = selectedStartTime.split(':');
    const [endHour] = selectedEndTime.split(':');
    const hours = parseInt(endHour) - parseInt(startHour);
    return court.price_per_hour * hours;
};
```

### 4. Form Submission

```typescript
const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('bookings.store'), {
        onError: (errors) => {
            setError(errors.booking_date || 'Terjadi kesalahan');
        },
    });
};
```

---

## 🎨 Styling Highlights

### DatePicker Custom CSS

```css
.react-datepicker__header {
    background-color: #2563eb; /* Blue header */
    color: white;
}

.react-datepicker__day--selected {
    background-color: #10b981; /* Green selected */
}

.react-datepicker__day:hover {
    background-color: #dbeafe; /* Light blue hover */
}

.react-datepicker__day--disabled {
    background-color: #f3f4f6; /* Gray disabled */
    color: #9ca3af;
    cursor: not-allowed;
}
```

### Component Sections

1. **Court Info Card** - Gradient background dengan info venue
2. **Date Picker Section** - Centered calendar dengan inline display
3. **Time Slots Grid** - 6 columns layout (responsive 3-6 columns)
4. **Booked Slots Info** - Amber alert box untuk visual feedback
5. **Booking Summary** - Green summary card dengan total harga
6. **Action Buttons** - Kembali & Konfirmasi dengan responsive spacing

---

## 📱 Responsive Design

- **Mobile:** 3 columns time slot grid
- **Tablet:** 4 columns
- **Desktop:** 6 columns

```jsx
<div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
```

---

## ✅ Testing Checklist

### Backend
- [ ] `GET /api/bookings/check-availability?court_id=1&booking_date=2026-04-20` returns JSON
- [ ] Response includes `booked_slots` array
- [ ] Booked slots exclude cancelled bookings
- [ ] Time parsing correct (mengkonversi start_time ke hour)

### Frontend
- [ ] DatePicker renders correctly
- [ ] Past dates disabled
- [ ] API call triggered on date selection
- [ ] Booked slots disabled with visual feedback
- [ ] Price calculation updates on time selection
- [ ] Form submission works
- [ ] Error handling displays properly
- [ ] Responsive on mobile/tablet/desktop

---

## 🔄 API Flow

```
User selects date
    ↓
React triggers onChange event
    ↓
Fetch: GET /api/bookings/check-availability?court_id=X&booking_date=YYYY-MM-DD
    ↓
Backend queries Booking model
    ↓
Generate booked_slots array (hours flagged as booked)
    ↓
Return JSON response
    ↓
React setState(bookedSlots)
    ↓
Render time slots dengan isSlotBooked() check
    ↓
User picks time slot + click "Konfirmasi"
    ↓
POST /bookings dengan court_id, booking_date, start_time, end_time
```

---

## 🚀 Versi Lanjutan (Optional)

### Future Enhancements

1. **Multiple Hour Booking**
   - Allow user select multiple consecutive hours
   - Update price per multiple hours

2. **Animation**
   - Skeleton loading saat fetch API
   - Smooth transition untuk state changes

3. **Mobile Optimization**
   - Horizontal scroll time slots
   - Simplified datepicker modal

4. **Accessibility**
   - ARIA labels untuk buttons
   - Keyboard navigation
   - Screen reader support

5. **Performance**
   - Memoization untuk time slots
   - Lazy load API calls
   - Cache availability data

---

## 📋 File Changes Summary

| File | Perubahan |
|------|-----------|
| `routes/web.php` | Tambah route `/api/bookings/check-availability` |
| `BookingController.php` | Tambah method `checkAvailability()` |
| `CourtBooking.tsx` | **File baru** - Komponen utama |
| `Bookings/Create.tsx` | Refactor untuk menggunakan `CourtBooking` |

---

**Last Updated:** April 19, 2026
**Version:** 2.0 (Enhanced with React DatePicker)
