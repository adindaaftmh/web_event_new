# Login Information for Testing

## Test User Credentials

**Email:** test@example.com  
**Password:** password123

## How to Test Profile Update

1. Open the application at: http://localhost:5184
2. Navigate to Login page
3. Use the credentials above to login
4. Go to Profile page
5. Click "Edit Profil" button
6. Try updating:
   - Name
   - Phone number
   - Address
   - Education level
   - Profile photo (upload an image)
7. Click "Simpan Perubahan"

## Backend Status

- ✅ Backend server running on: http://localhost:8000
- ✅ Database connected and migrations completed
- ✅ User table has profile_image column
- ✅ API endpoints working:
  - POST /api/login
  - GET /api/user
  - POST /api/update-profile (with file upload support)

## Troubleshooting

If you see "Gagal memperbarui profil" error:
1. Check browser console (F12) for detailed error logs
2. Ensure backend server is running
3. Check network tab for API request/response details

### Common Validation Errors (HTTP 422):
- **Nomor handphone**: Must be at least 10 digits
- **Nama lengkap**: Must be at least 2 characters
- **Pendidikan terakhir**: Must be one of: SD/MI, SMP/MTS, SMA/SMK, Diploma/Sarjana, Lainnya
- **Profile image**: Must be image file (jpeg, png, jpg, gif, webp) max 10MB
- **Email**: Cannot be changed (field is disabled in form)

### Recent Fixes:
- ✅ Fixed FormData creation to only send valid fields
- ✅ Added frontend validation before sending request
- ✅ Fixed backend validation rules (removed required from sometimes fields)
- ✅ Email field is now disabled (cannot be changed)
- ✅ Added detailed logging for debugging
- ✅ Fixed Content-Type header for FormData (let browser set boundary)
- ✅ Added debug info in backend validation error response
- ✅ Separated logic for requests with/without file upload
- ✅ Increased file upload limit from 2MB to 10MB

### Debug Features Added:
- Backend logs validation errors with detailed field info
- Frontend logs show exact data being sent
- Different handling for requests with and without images
- Detailed error messages in API responses

The application now has full database integration and should work properly for profile updates including photo uploads.
