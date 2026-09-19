# RideFlow – REST API Specification & Architecture Document

**System Version:** 1.0.0  
**Backend Base URL:** `http://localhost:8085/api`  
**Security:** Bearer JWT in Authorization Header (`Authorization: Bearer <token>`)

---

## 1. Authentication & Security Endpoints (`/api/auth`)

### 1.1 Customer Registration
- **Endpoint:** `POST /api/auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "customer@rideflow.lk",
  "password": "Password123!",
  "fullName": "Nimal Perera",
  "phoneNumber": "+94 77 123 4567",
  "nicOrPassport": "199214502341",
  "licenceNumber": "B8934512",
  "licenceExpiryDate": "2028-12-31",
  "address": "No. 45, Galle Road, Colombo 03, Sri Lanka"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "id": 3,
    "email": "customer@rideflow.lk",
    "fullName": "Nimal Perera",
    "phoneNumber": "+94 77 123 4567",
    "role": "CUSTOMER",
    "isLicenceVerified": true
  }
}
```

### 1.2 User Login
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "admin@rideflow.lk",
  "password": "Admin123!"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "id": 1,
    "email": "admin@rideflow.lk",
    "fullName": "System Administrator",
    "role": "ADMIN",
    "isLicenceVerified": true
  }
}
```

### 1.3 Password Reset Request
- **Endpoint:** `POST /api/auth/forgot-password`
- **Access:** Public
- **Request Body:** `{"email": "customer@rideflow.lk"}`

### 1.4 Password Reset Execution
- **Endpoint:** `POST /api/auth/reset-password`
- **Access:** Public
- **Request Body:**
```json
{
  "token": "reset-uuid-token",
  "newPassword": "NewSecurePassword123!"
}
```

---

## 2. Vehicle Fleet & Categories (`/api/vehicles`, `/api/categories`)

### 2.1 Search & Filter Vehicles
- **Endpoint:** `GET /api/vehicles`
- **Access:** Public
- **Query Parameters:**
  - `brand` (String, optional): Filter by brand (e.g. `Toyota`, `Honda`)
  - `categoryId` (Long, optional): Category ID
  - `minPrice` / `maxPrice` (Decimal, optional)
  - `status` (Enum, optional): `AVAILABLE`, `RENTED`, `MAINTENANCE`
  - `transmission` (Enum, optional): `AUTOMATIC`, `MANUAL`
  - `fuelType` (Enum, optional): `PETROL`, `DIESEL`, `HYBRID`, `ELECTRIC`
  - `page` / `size` / `sortBy` / `sortDir` (Pagination & Sort)

### 2.2 Get Vehicle Details
- **Endpoint:** `GET /api/vehicles/{id}`
- **Access:** Public

### 2.3 Create Vehicle
- **Endpoint:** `POST /api/vehicles`
- **Access:** Admin only (`ROLE_ADMIN`)

### 2.4 Update Vehicle & Status
- **Endpoint:** `PUT /api/vehicles/{id}`
- **Endpoint:** `PATCH /api/vehicles/{id}/status?status={AVAILABLE|RENTED|MAINTENANCE|RETIRED}`
- **Access:** Admin / Staff

---

## 3. Real-Time Overlap & Availability (`/api/availability`)

### 3.1 Check Vehicle Availability
- **Endpoint:** `POST /api/availability/check`
- **Access:** Public
- **Request Body:**
```json
{
  "vehicleId": 1,
  "startDate": "2026-09-20",
  "endDate": "2026-09-24"
}
```
- **Response:**
```json
{
  "success": true,
  "data": {
    "available": true,
    "vehicleId": 1,
    "totalDays": 4,
    "dailyRate": 12500.00,
    "depositAmount": 15000.00,
    "rentalTotal": 50000.00,
    "grandTotal": 65000.00
  }
}
```

---

## 4. Bookings & Lifecycle Operations (`/api/bookings`)

### 4.1 Create Booking
- **Endpoint:** `POST /api/bookings`
- **Access:** Customer (`ROLE_CUSTOMER`)
- **Request Body:**
```json
{
  "vehicleId": 1,
  "startDate": "2026-09-20",
  "endDate": "2026-09-24",
  "pickupLocation": "Colombo HQ (Bambalapitiya)",
  "returnLocation": "Bandaranaike Intl Airport (CMB)"
}
```

### 4.2 Review Booking (Approve / Reject)
- **Endpoint:** `POST /api/bookings/{id}/review`
- **Access:** Staff / Admin (`ROLE_STAFF`, `ROLE_ADMIN`)
- **Request Body:**
```json
{
  "status": "CONFIRMED",
  "rejectionReason": null
}
```

### 4.3 Cancel Booking
- **Endpoint:** `POST /api/bookings/{id}/cancel`
- **Access:** Customer / Staff
- **Request Body:** `{"reason": "Personal travel plan postponed"}`

---

## 5. Inspections Workflow (`/api/inspections`)

### 5.1 Perform Handover Inspection
- **Endpoint:** `POST /api/inspections/handover`
- **Access:** Staff / Admin (`ROLE_STAFF`, `ROLE_ADMIN`)
- **Request Body:**
```json
{
  "bookingId": 2,
  "odometerReading": 32500,
  "fuelLevel": "FULL",
  "cleanliness": "Clean & Valeted",
  "notes": "Licence verified. Spare wheel present."
}
```
*Effect:* Marks booking status as `ACTIVE` and vehicle as `RENTED`.

### 5.2 Perform Return Inspection & Settlement
- **Endpoint:** `POST /api/inspections/return`
- **Access:** Staff / Admin (`ROLE_STAFF`, `ROLE_ADMIN`)
- **Request Body:**
```json
{
  "bookingId": 2,
  "odometerReading": 33100,
  "fuelLevel": "FULL",
  "cleanliness": "Clean",
  "damageCharge": 0.00,
  "lateFee": 0.00,
  "notes": "Vehicle returned on time in immaculate condition."
}
```
*Effect:* Marks booking status as `COMPLETED` and vehicle as `AVAILABLE`.

---

## 6. Payments & Counter Billing (`/api/payments`)

### 6.1 Record Payment
- **Endpoint:** `POST /api/payments`
- **Access:** Staff / Admin
- **Request Body:**
```json
{
  "bookingId": 2,
  "amount": 37500.00,
  "paymentMethod": "CASH",
  "transactionReference": "REC-77192",
  "notes": "Cash settlement at counter upon vehicle return"
}
```

---

## 7. Fleet Maintenance (`/api/maintenance`)

### 7.1 Schedule Maintenance
- **Endpoint:** `POST /api/maintenance`
- **Access:** Staff / Admin
- **Request Body:**
```json
{
  "vehicleId": 4,
  "serviceType": "PERIODIC_SERVICE",
  "serviceCenter": "Toyota Lanka - Wattala",
  "startDate": "2026-09-25",
  "endDate": "2026-09-26",
  "cost": 18500.00,
  "description": "Routine 30,000km filter and fluid service"
}
```

### 7.2 Update Maintenance Status
- **Endpoint:** `PATCH /api/maintenance/{id}/status?status={SCHEDULED|IN_PROGRESS|COMPLETED|CANCELLED}`
- *Note:* Transitioning to `COMPLETED` automatically resets vehicle status to `AVAILABLE`.

---

## 8. Reports & Analytics (`/api/reports`, `/api/audit-logs`)

- `GET /api/reports/admin` – High level KPIs, gross revenue, category breakdown, utilization %.
- `GET /api/dashboards/staff` – Operational counts: pending handovers, returns due today, pending reviews.
- `GET /api/audit-logs` – Paginated system ledger of security actions, IP addresses, and state changes.
