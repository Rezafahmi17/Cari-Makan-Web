# Frontend CariMakan

Frontend ini memakai React Vite. Data menu, pesanan, dan login admin sudah diarahkan ke backend sendiri.

## File Penting

- `src/api/api.js`: penghubung frontend ke backend.
- `src/context/MealContext.jsx`: mengambil menu dari backend.
- `src/context/OrderContext.jsx`: membuat dan mengambil pesanan dari backend.
- `src/pages/Admin.jsx`: login admin dan update status pesanan.
- `src/pages/Checkout.jsx`: mengirim pesanan ke backend.

## Environment

Buat file `.env` di folder frontend:

```txt
VITE_API_URL=http://localhost:5000/api
```
