# 🎯 Payment Proof Feature - Quick Start & Testing Guide

## ⚡ Quick Start (5 Minutes)

### 1. Ensure Dev Servers Are Running
```bash
# Terminal 1: Laravel server
php artisan serve --host=127.0.0.1 --port=8000

# Terminal 2: Vite dev server  
npm run dev
```

### 2. Test the Feature
```
1. Open: http://localhost:8000/bookings
2. Login: test@example.com / password
3. Look for "💳 Bayar Sekarang" button on pending orders
4. Click button → Modal opens
5. Select JPG/PNG image file (< 2MB)
6. See preview
7. Click "Kirim" button
8. Wait for "Mengunggah..." 
9. Modal closes automatically
10. See success message
11. Status changed to "🟠 Menunggu Konfirmasi"
12. See new link "📄 Lihat Bukti Pembayaran"
```

---

## 📋 Detailed Testing Scenarios

### Scenario 1: Happy Path (Successful Upload)

**Setup**: User has pending booking without payment_proof

```
Action: Click "💳 Bayar Sekarang"
├─ Modal opens
├─ Drag & drop area visible
├─ Upload button ready
└─ Close (X) button available

Action: Select JPG image (< 2MB)
├─ File accepted ✓
├─ Preview displays instantly ✓
├─ "Kirim" button becomes active ✓
└─ "Batal" button visible

Action: Click "Kirim"
├─ Show "Mengunggah..." state ✓
├─ Disable all inputs ✓
├─ POST /bookings/{booking}/payment
├─ Backend validates file ✓
├─ File saved to storage ✓
├─ Database updated ✓
├─ Status → waiting_confirmation ✓
├─ Response: 200 OK with flash message
├─ Modal closes automatically ✓
└─ Page shows success message ✓

Result: Booking shows
├─ Status: "🟠 Menunggu Konfirmasi"
└─ Link: "📄 Lihat Bukti Pembayaran"
```

**Expected Files**
- ✓ File saved: `storage/app/public/payments/YYYYMMDD_booking_X_abc123.jpg`
- ✓ Accessible: `http://localhost:8000/storage/payments/YYYYMMDD_booking_X_abc123.jpg`

---

### Scenario 2: Frontend Validation - Wrong File Type

**Setup**: User tries uploading GIF instead of JPG

```
Action: Select GIF file
├─ Frontend check: Is it JPG/PNG?
├─ Result: NO ✗
├─ Alert: "File harus berupa JPG atau PNG"
└─ File not set in form

Expected: Modal stays open, file rejected
```

---

### Scenario 3: Frontend Validation - File Too Large

**Setup**: User tries uploading 5MB PNG file

```
Action: Select 5MB PNG file
├─ Frontend check: Is size < 2MB?
├─ Result: NO ✗
├─ Alert: "Ukuran file maksimal 2MB"
└─ File not set in form

Expected: Modal stays open, file rejected
```

---

### Scenario 4: Backend Validation - Authorization

**Setup**: User A tries to upload proof for User B's booking

```
Action: User B's booking payment link accessed by User A
├─ Route matched: bookings.storePayment
├─ Binding: Booking B retrieved
├─ Authorization check: booking->user_id === auth()->id()?
├─ Result: NO ✗
├─ Response: 403 Forbidden
└─ Error message displayed

Expected: User cannot upload for other users
```

---

### Scenario 5: Backend Validation - Invalid File Type

**Setup**: Frontend validation bypassed, server receives non-image

```
Action: POST /bookings/{booking}/payment with TXT file
├─ Server receives file
├─ Validation: 'image|mimes:jpeg,png'
├─ Result: Fails ✗
├─ Response: 422 Unprocessable Entity
├─ Error message: "The payment_proof field must be an image"
└─ Modal displays error message

Expected: Server rejects non-image files
```

---

### Scenario 6: Replace Payment Proof

**Setup**: User already has payment_proof, wants to upload new one

```
Action: Booking has payment_proof, user uploads new file
├─ Check: File at storage/payments/old_file.jpg exists
├─ Delete old file ✓
├─ Save new file ✓
├─ Update database with new filename ✓
└─ Keep status as waiting_confirmation

Result: Only new file exists, old deleted
```

---

## 🧪 Test Commands

### Test Route Exists
```bash
php artisan route:list --name=bookings
# Should show: bookings.storePayment route
```

### Test Database Column
```bash
php artisan tinker
>>> DB::table('bookings')->first()->payment_proof;
>>> // Should return NULL or filename string

>>> DB::table('bookings')->columnExists('payment_proof');
>>> // Should return true
```

### Test File Storage
```bash
php artisan tinker
>>> Storage::disk('public')->listContents('payments');
>>> // Should list uploaded files

>>> Storage::disk('public')->exists('payments');
>>> // Should return true
```

### Test Symlink
```bash
# Check symlink exists
ls -la public/storage

# Should show:
# storage -> ../../storage/app/public
```

---

## 📊 Database Checks

### Check Migration Applied
```bash
php artisan migrate:status
# Output: 2026_04_19_111022_add_payment_proof_to_bookings_table ... [2] Ran ✓
```

### Check Column Exists
```bash
php artisan tinker
>>> Schema::hasColumn('bookings', 'payment_proof');
>>> // true ✓
```

### Check Booking Updated
```bash
php artisan tinker
>>> $booking = Booking::latest()->first();
>>> $booking->payment_proof;
>>> $booking->status;
>>> // Should show filename and 'waiting_confirmation'
```

---

## 🔍 API Testing with cURL

### Test File Upload
```bash
# Create test file first
convert -size 100x100 xc:blue test.jpg

# Upload via cURL
curl -X POST \
  -H "X-Requested-With: XMLHttpRequest" \
  -H "Accept: application/json" \
  -F "payment_proof=@test.jpg" \
  -b "XSRF-TOKEN=your_token; laravel_session=your_session" \
  http://localhost:8000/bookings/1/payment

# Response: 302 redirect with flash message
```

---

## 📱 UI/UX Testing

### Visual Checks
- [ ] Modal has dark overlay (black/50 opacity)
- [ ] Modal box is centered and white
- [ ] Close button (X) top-right corner
- [ ] File area has dashed border (2px)
- [ ] Upload icon and text visible
- [ ] Hover effect on file area
- [ ] Image preview shows with rounded corners
- [ ] "Batal" and "Kirim" buttons visible
- [ ] Info box with 📸 emoji
- [ ] "Processing..." text shows during upload

### Responsive Checks
- [ ] Modal responsive on mobile (< 768px)
- [ ] Modal responsive on tablet (768-1024px)
- [ ] Modal responsive on desktop (> 1024px)
- [ ] File input accessible on all sizes
- [ ] Preview looks good on mobile
- [ ] Buttons clickable on touchscreen

### Accessibility Checks
- [ ] Keyboard navigation (Tab through inputs)
- [ ] Close with X button works
- [ ] Close with Escape key works
- [ ] Labels properly associated with inputs
- [ ] Form submission with Enter key
- [ ] Error messages clearly visible

---

## 🚨 Error Scenarios to Test

### 1. Network Error During Upload
```
Expected behavior:
- Show loading state
- If error, display error message
- Modal stays open for retry
- User can close without refreshing
```

### 2. File Disappears After Upload
```
Check:
- File exists in storage: ls storage/app/public/payments/
- Database record has filename
- Symlink is working: ls -la public/storage/
- Can access via URL: /storage/payments/filename
```

### 3. Database Update Failed
```
Check:
- Migration applied: php artisan migrate:status
- Column exists: DESCRIBE bookings;
- Can insert/update: php artisan tinker → update test
```

### 4. Permission Denied
```
If file not saving:
chmod 755 storage/app/public
chmod 755 storage/app/public/payments
chmod 755 public/storage
```

---

## ✅ Pre-Deployment Checklist

- [ ] Migration applied: `php artisan migrate`
- [ ] Storage link created: `php artisan storage:link`
- [ ] All routes registered: `php artisan route:list`
- [ ] Files uploaded successfully
- [ ] Files accessible via URL
- [ ] Authorization working (different users)
- [ ] File validations working (size, type)
- [ ] Modal opens/closes properly
- [ ] Flash messages display
- [ ] Page refreshes show updated status
- [ ] No console errors
- [ ] No server errors (check storage/logs/laravel.log)

---

## 🎓 Key Implementation Points

### Why `forceFormData: true`?
- Inertia.js normally sends JSON
- File upload requires multipart/form-data
- `forceFormData: true` tells Inertia to use FormData API
- Essential for file uploads to work

### File Naming Convention
```
YYYYMMDD_booking_{booking_id}_{uniqid}.jpg

Example: 20260419_booking_1_5f9a3c2d.jpg

Benefits:
- Easy to identify when uploaded
- Includes booking reference
- Prevents filename collisions
- Sortable by date
```

### Why Delete Old Files?
- Prevent storage bloat from multiple uploads
- Keep only current payment proof
- If user uploads wrong file then corrects it
- Automatic cleanup on replacement

### Status Flow
```
pending (waiting for payment)
    ↓ (user uploads proof)
waiting_confirmation (admin reviews)
    ↓ (admin confirms)
confirmed (payment accepted)
```

---

## 📞 Support & Debugging

### Check Recent Uploads
```bash
# List recently uploaded files
ls -lrt storage/app/public/payments/ | tail -10
```

### View Logs
```bash
# Watch Laravel logs
tail -f storage/logs/laravel.log

# Look for errors during upload
# Check for 403, 422, 500 errors
```

### Test Database Query
```bash
php artisan tinker
>>> Booking::where('payment_proof', '!=', null)->get(['id', 'payment_proof', 'status']);
```

### Verify File Permissions
```bash
# Check permissions
ls -la storage/app/public/payments/
-rw-r--r-- (should be readable)

# Check symlink
ls -la public/storage/
lrwxrwxrwx ... storage -> ...
```

---

## 🎉 Success Indicators

When everything is working:
1. ✅ "💳 Bayar Sekarang" visible for pending orders
2. ✅ Modal opens without errors
3. ✅ Image preview displays after selection
4. ✅ File uploads show "Mengunggah..." state
5. ✅ Modal closes on success
6. ✅ "✅ Bukti pembayaran berhasil diunggah" message shown
7. ✅ Status changes to "🟠 Menunggu Konfirmasi"
8. ✅ "📄 Lihat Bukti Pembayaran" link appears
9. ✅ Link opens image in new tab
10. ✅ File appears in storage/app/public/payments/

---

## 📝 Troubleshooting Guide

| Issue | Solution |
|-------|----------|
| Modal doesn't open | Check browser console for JS errors |
| File input doesn't accept files | Check accepted MIME types |
| Preview not showing | Check FileReader API support + error handling |
| Upload hangs | Check network tab, look for slow response |
| 403 Unauthorized | Verify user is owner of booking |
| 422 Validation Error | Check file size/type, look at error response |
| File not saved | Check storage permissions + disk config |
| File not accessible | Verify symlink exists + run storage:link |
| Status not updating | Check database connection + migration |
| Flash message missing | Check Inertia session flash data |

---

**Testing Guide Version**: 1.0  
**Created**: April 19, 2026  
**Feature Status**: Ready for Testing  
**Expected Duration**: 15-20 minutes for full test suite
