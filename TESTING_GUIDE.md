# Booking System - Testing Guide v2.0

## 🎯 Quick Start Testing

### Prerequisites
```bash
# 1. Start Laravel dev server
composer run dev

# 2. Ensure MySQL is running
# 3. Database migrations applied (php artisan migrate --fresh --seed)
```

---

## 📱 Manual UI Testing

### Test Case 1: Access Venues List
**Objective**: Verify venues load correctly with courts

**Steps**:
1. Navigate to `http://localhost:8000/venues`
2. Login with test@example.com / password

**Expected Results**:
- [ ] Venues page loads without black screen
- [ ] Shows at least 3 venues
- [ ] Each venue displays 3 courts
- [ ] Court info visible (name, type, price/hour)
- [ ] "Pesan Sekarang" button visible

**Troubleshoot**:
- Black screen → Run `npm run dev` or `npm run build`
- No data → Check database seeder ran: `php artisan migrate --fresh --seed`

---

### Test Case 2: Navigate to Booking Form
**Objective**: Verify CourtBooking component loads with DatePicker

**Steps**:
1. From venues page, click any "Pesan Sekarang" button
2. Should navigate to booking form
3. Examine component visually

**Expected Results**:
- [ ] Booking form loads without errors
- [ ] Date picker calendar visible
- [ ] Court info displayed (name, price)
- [ ] Time slots visible below calendar
- [ ] Past dates appear disabled in calendar
- [ ] Operating hours shown (08:00 - 23:00)

**Troubleshoot**:
- Component not showing → Browser needs refresh (Ctrl+R)
- DatePicker missing → Verify `npm install react-datepicker` completed
- Styling broken → Run `npm run dev` again

---

### Test Case 3: Select Date & Check Availability
**Objective**: Verify API call works and returns booked slots correctly

**Steps**:
1. From booking form, click on calendar
2. Select tomorrow's date
3. Observe network tab in DevTools (F12 → Network tab)
4. Wait for API response

**Expected Results**:
- [ ] Calendar opens with date picker
- [ ] Tomorrow's date selectable (not grayed out)
- [ ] API call appears: `GET /api/bookings/check-availability?court_id=1&booking_date=...`
- [ ] Response shows `booked_slots` array
- [ ] Time slots update with disabled state

**API Response Check**:
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

**Troubleshoot**:
- No API call → Check console for JS errors (F12)
- API returns error → Verify court_id valid: `php artisan tinker --execute 'Court::count();'`
- Empty booked_slots → Normal if no bookings for that day

---

### Test Case 4: Verify Booked Slots Disabled
**Objective**: Ensure booked hours show as disabled with correct styling

**Steps**:
1. From available court/date, note which hours are booked
2. In `resources/js/components/Bookings/CourtBooking.tsx`, search for booked bookings
3. Verify those hours show disabled styling:
   - Gray background (`bg-gray-300`)
   - Reduced opacity (`opacity-50`)
   - Cannot click/select

**Expected Results**:
- [ ] Booked hours have different color from available
- [ ] Available hours highlight on hover (blue border)
- [ ] Cannot select booked hour
- [ ] Visual feedback clear to user

**Visual Check**:
```
Available: White/Blue border, clickable ✓
Selected: Green background, ring effect ✓
Booked: Gray background, opacity 50%, cursor-not-allowed ✓
```

---

### Test Case 5: Select Time Slot & Check Price
**Objective**: Verify time slot selection and price calculation

**Steps**:
1. Click on available time slot (e.g., 14:00)
2. Verify end_time auto-sets to next hour (15:00)
3. Check total price formula: time_slots × price_per_hour

**Expected Results**:
- [ ] Start time selected (shows green highlight)
- [ ] End time auto-set to +1 hour
- [ ] Total price calculated correctly
- [ ] Summary card shows booking details
- [ ] Example: 1 slot × 150k = 150k IDR

**Calculation Verification**:
```
Court price: 150,000/hour
Selected: 14:00-15:00 (1 hour)
Total Price: 1 × 150,000 = 150,000 ✓
```

---

### Test Case 6: Submit Booking
**Objective**: Create booking and verify success

**Steps**:
1. Select date, time slot
2. Click "Konfirmasi Pemesanan" button
3. Wait for response (should see success message)
4. Check redirect to bookings list

**Expected Results**:
- [ ] Button becomes disabled during submission
- [ ] Loading state shows
- [ ] Booking created successfully
- [ ] Redirects to `/bookings` page
- [ ] New booking appears in list
- [ ] Status shows "pending" or "confirmed"

**Database Verification**:
```bash
php artisan tinker
Booking::latest()->first();
# Should show booking record with:
# - user_id: your user
# - court_id: selected court
# - booking_date: selected date
# - start_time: selected start
# - end_time: calculated end
# - total_price: calculated amount
# - status: pending/confirmed
```

---

### Test Case 7: Double-Booking Prevention
**Objective**: Verify system prevents overlapping bookings

**Steps**:
1. Create a booking for 14:00-15:00 on Court 1, 2026-04-20
2. Try to book same slot again for same court/date
3. Attempt different times that overlap:
   - 13:00-14:30 (overlaps start)
   - 14:30-16:00 (overlaps end)
   - 13:00-16:00 (contains slot)

**Expected Results**:
- [ ] Exact slot unavailable (button disabled)
- [ ] Overlapping times also disabled
- [ ] User cannot submit overlapping booking
- [ ] If attempted anyway, backend returns 422 error
- [ ] Error message: "Time slot tidak tersedia"

**Manual Test Scenario**:
```
Booked: 14:00-15:00 (hour = 10)
Attempt 13:00-14:00: ❌ Fails (overlaps)
Attempt 15:00-16:00: ✅ Success (adjacent, not overlapping)
Attempt 14:00-14:30: ❌ Fails (overlaps)
```

---

## 🔬 API Testing (cURL / Postman)

### API Test 1: Check Availability Endpoint

**Endpoint**: `GET /api/bookings/check-availability`

**Parameters**:
- `court_id` (required): Court ID number
- `booking_date` (required): Date in YYYY-MM-DD format

**Test Command**:
```bash
curl "http://localhost:8000/api/bookings/check-availability?court_id=1&booking_date=2026-04-20"
```

**Expected Status**: 200 OK

**Expected Response**:
```json
{
  "court_id": 1,
  "booking_date": "2026-04-20",
  "booked_slots": []
}
```

### API Test 2: With Existing Bookings

**Scenario**: After creating test booking for 10:00-12:00

**Test Command**:
```bash
curl "http://localhost:8000/api/bookings/check-availability?court_id=1&booking_date=2026-04-20"
```

**Expected Response**:
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

### API Test 3: Validation - Missing Parameters

**Test Command (missing court_id)**:
```bash
curl "http://localhost:8000/api/bookings/check-availability?booking_date=2026-04-20"
```

**Expected Status**: 422 Unprocessable Entity

**Expected Response**:
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "court_id": ["The court_id field is required."]
  }
}
```

### API Test 4: Validation - Invalid Date Format

**Test Command**:
```bash
curl "http://localhost:8000/api/bookings/check-availability?court_id=1&booking_date=20-04-2026"
```

**Expected Status**: 422 Unprocessable Entity

**Expected Response**:
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "booking_date": ["The booking_date field must be a valid date in the format Y-m-d."]
  }
}
```

---

## 🧪 Unit/Feature Tests

### Run All Tests
```bash
php artisan test --compact
```

### Run Specific Test
```bash
php artisan test --compact --filter=BookingTest
```

### Create New Test
```bash
php artisan make:test --pest BookingAvailabilityTest
```

### Example Test Structure
```php
<?php
namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Court;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function check_availability_returns_booked_slots()
    {
        $court = Court::factory()->create();
        $date = '2026-04-20';
        
        // Create booking 10:00-12:00
        Booking::factory()->create([
            'court_id' => $court->id,
            'booking_date' => $date,
            'start_time' => '10:00',
            'end_time' => '12:00',
            'status' => 'confirmed',
        ]);

        $response = $this->getJson('/api/bookings/check-availability', [
            'court_id' => $court->id,
            'booking_date' => $date,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'court_id' => $court->id,
                'booking_date' => $date,
            ])
            ->assertJsonPath('booked_slots.0.hour', 10)
            ->assertJsonPath('booked_slots.1.hour', 11);
    }
}
```

---

## 🐛 Troubleshooting

### Issue: "Black Screen on /bookings/create"

**Cause**: React component not loading or error in TypeScript

**Solution**:
```bash
# 1. Check console (F12 → Console tab)
# 2. Look for errors, search "CourtBooking"
# 3. Try rebuild:
npm run build
npm run dev
# 4. Hard refresh browser:
Ctrl+Shift+R (or Cmd+Shift+R on Mac)
```

### Issue: "DatePicker not showing"

**Cause**: react-datepicker not installed or CSS not loaded

**Solution**:
```bash
# 1. Verify installation:
npm list react-datepicker

# 2. If missing, reinstall:
npm install react-datepicker

# 3. Check CSS import in CourtBooking.tsx:
import 'react-datepicker/dist/react-datepicker.css';

# 4. Rebuild:
npm run dev
```

### Issue: "API returns empty booked_slots but slots should be booked"

**Cause**: Possible status filtering or time format issue

**Solution**:
```bash
# 1. Check database for bookings:
php artisan tinker --execute "
Booking::where('court_id', 1)
  ->where('booking_date', '2026-04-20')
  ->where('status', '!=', 'cancelled')
  ->get(['id', 'start_time', 'end_time', 'status']);
"

# 2. Verify time format is HH:MM:
# Should be '10:00' not '10' or '10:00:00'

# 3. Check booking_date matches query date format
```

### Issue: "Booking submission fails with 422 error"

**Cause**: Validation error or overlap detected

**Solution**:
```bash
# 1. Check error message in response
# 2. Common issues:
# - Missing fields (court_id, booking_date, start_time, end_time)
# - Time slot already booked
# - Invalid date format

# 3. View request in Network tab:
# F12 → Network → Find POST /bookings → Preview tab
# Check response errors object
```

### Issue: "Past dates selectable in DatePicker"

**Cause**: minDate not set correctly in CourtBooking.tsx

**Solution**:
```typescript
// Check CourtBooking.tsx line ~40
const minDate = new Date();
minDate.setDate(minDate.getDate() + 1); // Tomorrow

// Should be:
<DatePicker
  minDate={minDate}
  ...
/>
```

### Issue: "Locale not Indonesian in DatePicker"

**Cause**: Indonesian locale not imported

**Solution**:
```typescript
// Check imports in CourtBooking.tsx
import { id as idLocale } from 'date-fns/locale';

// Check DatePicker prop:
<DatePicker
  locale={idLocale}
  ...
/>
```

---

## 📊 Performance Testing

### Load Test - Multiple Concurrent Requests
```bash
# Using Apache Bench
ab -n 100 -c 10 "http://localhost:8000/api/bookings/check-availability?court_id=1&booking_date=2026-04-20"

# Using wrk (better for HTTP)
wrk -t4 -c100 -d30s "http://localhost:8000/api/bookings/check-availability?court_id=1&booking_date=2026-04-20"
```

**Target Performance**:
- Response time: < 200ms
- Success rate: 100%
- Throughput: > 50 req/sec

### Database Query Test
```bash
php artisan tinker
>>> use Illuminate\Support\Facades\DB;
>>> DB::enableQueryLog();
>>> Booking::where('court_id', 1)->where('booking_date', '2026-04-20')->where('status', '!=', 'cancelled')->get();
>>> DB::getQueryLog();
# Check query count and execution time
```

**Optimization**: Should use composite index (court_id, booking_date)
```bash
# Verify index exists:
php artisan tinker --execute "
Schema::getConnection()->getDoctrineSchemaManager()
  ->listTableIndexes('bookings');
"
```

---

## ✅ Sign-Off Checklist

- [ ] Venues list loads correctly
- [ ] Booking form accessible from venues
- [ ] DatePicker calendar displays
- [ ] API endpoint returns correct JSON
- [ ] Booked slots properly disabled
- [ ] Price calculation accurate
- [ ] Booking creation succeeds
- [ ] Double-booking prevented
- [ ] Error messages clear
- [ ] Mobile responsive
- [ ] Performance acceptable
- [ ] All tests passing

---

**Document Version**: 2.0
**Last Updated**: April 19, 2026
**Status**: Ready for QA Testing
