# Quick Reference Guide - Booking System v2.0

## 🔗 Key Files Reference

### Backend Files
| File | Purpose | Key Changes |
|------|---------|------------|
| `routes/web.php` | Route definitions | Added `GET /api/bookings/check-availability` |
| `app/Http/Controllers/BookingController.php` | Booking logic | Added `checkAvailability()` method |
| `app/Models/Booking.php` | Booking model | Relations to User & Court |
| `app/Models/Court.php` | Court model | Relations to Venue & Bookings |
| `app/Models/Venue.php` | Venue model | Relation to Courts |
| `database/migrations/` | Schema | All 4 tables (users, venues, courts, bookings) |

### Frontend Files
| File | Purpose | Key Changes |
|------|---------|------------|
| `resources/js/pages/Bookings/Create.tsx` | Booking page | Now uses CourtBooking component |
| **`resources/js/components/Bookings/CourtBooking.tsx`** | **Booking form** | **NEW - 300+ line component** |
| `resources/js/pages/Venues/Index.tsx` | Venue listing | Unchanged, working |
| `resources/js/pages/Bookings/Index.tsx` | Booking history | Unchanged, working |

### Configuration Files
| File | Purpose |
|------|---------|
| `package.json` | Dependencies: react-datepicker, date-fns added |
| `vite.config.ts` | Vite SSR configuration |
| `tsconfig.json` | TypeScript configuration |
| `tailwind.config.js` | Tailwind CSS configuration |

---

## ⚡ Quick Commands

### Development
```bash
# Start development server (Vite + Laravel)
composer run dev

# Watch for file changes only
npm run dev

# Build for production
npm run build

# Run database migrations
php artisan migrate --fresh --seed

# Clear cache
php artisan cache:clear
php artisan config:clear
```

### Testing
```bash
# Run all tests
php artisan test --compact

# Run specific test file
php artisan test --compact --filter=BookingTest

# Test API endpoint
curl "http://localhost:8000/api/bookings/check-availability?court_id=1&booking_date=2026-04-20"
```

### Debugging
```bash
# Laravel interactive shell
php artisan tinker

# Inside tinker - check bookings
Booking::all();
Booking::where('court_id', 1)->where('booking_date', '2026-04-20')->get();

# Check database
php artisan dbshell

# View logs
tail -f storage/logs/laravel.log
```

---

## 🎯 API Endpoints

### Booking Management
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/venues` | List venues with courts (page) |
| GET | `/bookings` | User's booking history (page) |
| GET | `/bookings/create/{court}` | Booking form (page) |
| POST | `/bookings` | Create new booking |
| GET | `/api/bookings/check-availability` | **Check available slots (NEW)** |

### API Response Examples

**GET /api/bookings/check-availability?court_id=1&booking_date=2026-04-20**
```json
{
  "court_id": 1,
  "booking_date": "2026-04-20",
  "booked_slots": [
    {"hour": 10, "startTime": "10:00", "endTime": "11:00"},
    {"hour": 11, "startTime": "11:00", "endTime": "12:00"}
  ]
}
```

**POST /bookings (Request)**
```json
{
  "court_id": 1,
  "booking_date": "2026-04-20",
  "start_time": "14:00",
  "end_time": "15:00",
  "total_price": 150000
}
```

---

## 📊 Database Schema Quick View

### Bookings Table
```sql
CREATE TABLE bookings (
  id BIGINT UNSIGNED PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  court_id BIGINT UNSIGNED NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,        -- Format: HH:MM
  end_time TIME NOT NULL,          -- Format: HH:MM
  total_price INT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  INDEX (user_id),
  INDEX (court_id),
  UNIQUE INDEX (court_id, booking_date, start_time), -- Prevent exact duplicates
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE
);
```

### Courts Table
```sql
CREATE TABLE courts (
  id BIGINT UNSIGNED PRIMARY KEY,
  venue_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255),
  type VARCHAR(255),  -- futsal, badminton, basketball, etc.
  price_per_hour INT UNSIGNED,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
);
```

### Venues Table
```sql
CREATE TABLE venues (
  id BIGINT UNSIGNED PRIMARY KEY,
  name VARCHAR(255),
  address TEXT,
  image LONGBLOB NULLABLE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 🧠 React Component API

### CourtBooking Component Props

```typescript
interface CourtBookingProps {
  court: {
    id: number;
    name: string;
    type: string;
    price_per_hour: number;
    venue?: {
      name: string;
      address: string;
    };
  };
}
```

### CourtBooking Component State

```typescript
// All state hooks in component
const [selectedDate, setSelectedDate] = useState<Date | null>(null);
const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
const [selectedEndTime, setSelectedEndTime] = useState<string | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### BookedSlot Type

```typescript
interface BookedSlot {
  hour: number;        // 0-23
  startTime: string;   // "HH:MM"
  endTime: string;     // "HH:MM"
}
```

---

## 🔐 Authentication & Authorization

### Test Users (from seeder)
```
Email: admin@example.com
Pass:  password
Role:  admin

Email: owner@example.com
Pass:  password
Role:  owner

Email: test@example.com
Pass:  password
Role:  customer
```

### Role-Based Access
- **Admin**: Full system access, all endpoints
- **Owner**: Manage own venues/courts
- **Customer**: Browse venues, make bookings

### Middleware
```php
// Protect routes
Route::middleware(['auth', 'verified'])->group(function () {
    // All booking routes here
});

// Admin only
Route::middleware(['auth', 'role:admin'])->group(function () {
    // Admin routes
});
```

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **Black screen on /bookings/create** | Run `npm run dev` and refresh browser |
| **DatePicker not showing** | Verify `npm install react-datepicker` completed |
| **API returns empty booked_slots** | Check database has bookings for that date/court |
| **"These credentials do not match"** | Use test@example.com / password from seeder |
| **Booking fails with 422 error** | Check time slot not already booked, all fields filled |
| **Images not loading** | Run `npm run build`, check storage symlink |
| **Styles not applying** | Run `npm run dev`, hard refresh (Ctrl+Shift+R) |

---

## 📋 Operating Hours & Time Slots

**Hardcoded Operating Hours**: 08:00 → 23:00 (15 slots, 1 hour each)

```typescript
const OPERATING_HOURS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
];
```

**To modify operating hours**:
1. Edit `resources/js/components/Bookings/CourtBooking.tsx`
2. Find `const OPERATING_HOURS`
3. Adjust start/end times
4. Run `npm run dev`

---

## 💰 Price Calculation

```
Formula: Total Price = Price Per Hour × Duration (hours)

Example:
- Court price: 150,000/hour
- Selected time: 14:00 - 15:00 (1 hour)
- Total: 150,000 × 1 = 150,000 IDR

Example 2:
- Court price: 200,000/hour
- Selected time: 13:00 - 16:00 (3 hours)
- Total: 200,000 × 3 = 600,000 IDR
```

---

## 🎨 Color Scheme & Styling

### Button States (Time Slots)
```
Available:   White bg, gray border, blue on hover
Selected:    Green bg (#10b981), ring effect
Booked:      Gray bg, opacity 50%, cursor-not-allowed
Disabled:    Same as booked (visual indication)
```

### Component Sections
```
Header:      Blue (#2563eb)
Success:     Green (#10b981)
Warning:     Amber (#f59e0b)
Error:       Red (#ef4444)
Background:  White/Gray-50
```

---

## 📱 Responsive Breakpoints

```
Mobile:   < 768px   (3 columns time slots)
Tablet:   768-1024  (4 columns time slots)
Desktop:  > 1024px  (6 columns time slots)
```

---

## 🔄 Booking Status Flow

```
User creates booking
         ↓
    pending ──→ confirmed (after payment)
         ↓
      cancelled (user requests cancellation)
```

---

## 📊 Related Documentation

| Document | Purpose |
|----------|---------|
| `FRONTEND_ENHANCEMENT_DOCUMENTATION.md` | Detailed feature documentation |
| `TESTING_GUIDE.md` | Comprehensive testing checklist |
| `IMPLEMENTATION_SUMMARY.md` | Architecture & code examples |
| `CHANGELOG.md` | Version history & changes |

---

## 👨‍💻 Developer Workflow

### Adding New Feature
1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes
3. Test locally: `npm run dev` + manual testing
4. Run tests: `php artisan test --compact`
5. Check format: `vendor/bin/pint --dirty`
6. Commit & push
7. Create pull request

### Debugging Frontend
1. Open DevTools: F12
2. Check Console tab for errors
3. Check Network tab for API calls
4. Check Application tab for local storage
5. Use React Developer Tools (browser extension)

### Debugging Backend
1. Check logs: `tail -f storage/logs/laravel.log`
2. Use dd() helper: `dd($variable);`
3. Use tinker: `php artisan tinker`
4. Use xdebug with IDE

---

## 📞 Support & Questions

### Documentation Files Location
- Root directory: `.md` files
- Backend: `app/`, `database/`, `routes/`
- Frontend: `resources/js/`
- Config: `config/`, `.env`

### Common Commands Reference

**Setup**: `composer install && npm install && php artisan migrate --fresh --seed`
**Dev**: `composer run dev`
**Test**: `php artisan test --compact`
**Format**: `vendor/bin/pint --dirty`
**Build**: `npm run build`

---

## ✨ Recent Enhancements (v2.0)

- ✅ React DatePicker integration
- ✅ Real-time availability API
- ✅ Time slot grid with visual feedback
- ✅ Automatic price calculation
- ✅ Indonesian localization
- ✅ Responsive design (mobile-first)
- ✅ Error handling & validation
- ✅ Loading states

---

## 🎯 Next Priority Tasks

1. [ ] End-to-end booking flow testing
2. [ ] Admin dashboard development
3. [ ] Email notification system
4. [ ] Payment gateway integration
5. [ ] Booking modification feature
6. [ ] Performance optimization
7. [ ] Mobile app optimization
8. [ ] Analytics dashboard

---

**Quick Reference Version**: 2.0
**Last Updated**: April 19, 2026
**Status**: Active Development
