# RideFlow – Web-Based Vehicle Rental Management System

**Academic Project Submission**  
**Author:** Individual University Project  
**Tech Stack:** Java 21, Spring Boot 3.3.4, Spring Security 6 (JWT + BCrypt), Spring Data JPA, Hibernate, MySQL 8.0, React 18, Vite, React Router v6, Axios, Lucide React, Custom Dark Modern CSS Design System.

---

## 1. Project Overview & Features

**RideFlow** is a modern, enterprise-grade vehicle rental management platform engineered for end-to-end car, van, and motorbike reservations, physical handover/return inspections, fleet maintenance, and financial billing.

### Key Architectural Highlights:
* **Role-Based Access Control (RBAC):** Distinct dashboards and security perimeters for `ADMIN`, `STAFF`, and `CUSTOMER`.
* **Strict Overlap & Collision Protection:** Backend date interval algorithms prevent double bookings across overlapping reservations in states `(PENDING, CONFIRMED, ACTIVE)`.
* **Complete Rental Lifecycle Workflow:**
  1. Customer reserves vehicle & receives instant confirmation breakdown.
  2. Staff reviews reservation (Approve or Reject with recorded reason).
  3. Pre-Rental Handover Inspection (Odometer reading, fuel gauge, spare tyre/tool checklist, physical licence verification). Vehicle transitions to `ACTIVE` (`RENTED`).
  4. Post-Rental Return Inspection (Return odometer, fuel level discrepancy, damage fee assessment, late return charges). Booking marked `COMPLETED` and vehicle auto-returns to `AVAILABLE`.
* **Financial Ledger & Billing:** Multi-method payment capture (`CASH`, `CARD`, `BANK_TRANSFER`), security deposit management, and real-time outstanding balance calculation.
* **Fleet Maintenance Scheduler:** Service tracking (`SCHEDULED`, `IN_PROGRESS`, `COMPLETED`), maintenance cost logging, and automated vehicle availability locking.
* **Real-Time Audit Trail & In-App Notifications:** Immutable audit logging for security compliance and user notifications for lifecycle events.

---

## 2. Evaluation Credentials (Quick Viva Access)

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@rideflow.lk` | `Admin123!` | Executive KPIs, Fleet CRUD, Categories, Staff creation, Customer accounts, System Audit Logs |
| **Branch Staff Operator** | `staff@rideflow.lk` | `Staff123!` | Booking approvals, Handover inspections, Return inspections, Payments billing, Maintenance scheduling |
| **Registered Customer** | `customer@rideflow.lk` | `Customer123!` | Browse catalogue, Availability calculator, Bookings, Self-cancellation, Profile & licence upload |

*Tip for Evaluators:* The login page contains quick-fill buttons for 1-click credential population.

---

## 3. Database Architecture & Schema

The application uses MySQL 8.0 with InnoDB relational integrity, foreign key cascades, and unique constraints:

```
+-------------------------------------------------------------------------------+
|                               DATABASE SCHEMA                                 |
+-------------------------------------------------------------------------------+
| 1.  users                    - Core credentials, roles, activation status     |
| 2.  customer_profiles        - NIC/Passport, licence numbers, addresses       |
| 3.  password_reset_tokens    - Time-limited password reset tokens             |
| 4.  vehicle_categories       - Sedan, SUV, Luxury, Van, Bike + base deposits  |
| 5.  vehicles                 - Fleet specifications, rates, statuses, specs   |
| 6.  vehicle_images           - Multi-image gallery for vehicles               |
| 7.  bookings                 - Reservations, dates, pricing, statuses         |
| 8.  booking_status_history   - Timestamped lifecycle transition history       |
| 9.  payments                 - Payment transactions, methods, receipts        |
| 10. rental_inspections       - Handover & return telemetry, odometers, fuels  |
| 11. inspection_images        - Incident and vehicle condition photo records   |
| 12. maintenance_records      - Workshop servicing, repair costs, schedules    |
| 13. notifications            - User alerts and system messages                |
| 14. audit_logs               - Immutable security compliance audit ledger     |
+-------------------------------------------------------------------------------+
```

Database script location: `database/schema.sql` and `database/seed-data.sql`.

---

## 4. Setup & Running Locally

### Prerequisites
* Java JDK 17 or 21
* Apache Maven 3.8+
* Node.js 18+ and npm
* MySQL Server 8.0 running on `localhost:3306`

### 4.1 Database Setup
Create database `rideflow_db` in MySQL:
```sql
CREATE DATABASE rideflow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
Import `database/schema.sql` and `database/seed-data.sql`.

### 4.2 Backend (Spring Boot)
1. Open `backend/src/main/resources/application.properties` and verify your MySQL credentials (default `root`/`root`).
2. Run Maven:
```powershell
cd backend
mvn clean spring-boot:run
```
*Backend runs on:* `http://localhost:8085`  
*API Health check:* `http://localhost:8085/api/health`

### 4.3 Frontend (React + Vite)
```powershell
cd frontend
npm install
npm run dev
```
*Frontend runs on:* `http://localhost:5173`

---

## 5. Demonstration / Viva Walkthrough Guide

Follow these steps for a complete viva examination demonstration:

1. **Public Discovery:**
   - Navigate to `http://localhost:5173`.
   - Test Hero availability search widget with pickup/return dates.
   - Filter fleet by Category (`Sedan`, `SUV`, `Van`, `Luxury`, `Bike`), Transmission, and Price slider in `/catalogue`.
   - Click a vehicle (e.g., *Toyota Prius Alpha*) to view specs and calculate instant quotes.
2. **Customer Reservation:**
   - Log in as `customer@rideflow.lk` (or click "Customer Quick Fill").
   - Click "Book This Vehicle", choose dates and Colombo HQ pickup.
   - Submit reservation & confirm booking reference code generated.
3. **Staff Review & Dispatch:**
   - Log in as `staff@rideflow.lk`.
   - Under "Review Bookings", locate the pending request.
   - Click "Approve". Status transitions to `CONFIRMED`.
   - Navigate to "Vehicle Handover" (`/staff/handover`).
   - Enter handover odometer (e.g. 32,450 km), fuel level (100% Full), verify physical licence checkbox, and submit.
   - Status transitions to `ACTIVE` and vehicle is locked as `RENTED`.
4. **Return Inspection & Settlement:**
   - In Staff Portal, navigate to "Vehicle Return" (`/staff/return`).
   - Baseline handover odometer is automatically populated. Enter return odometer (e.g. 32,800 km &rarr; 350 km driven).
   - Enter optional incidental charges or note condition.
   - Submit return inspection. Status transitions to `COMPLETED` and vehicle auto-reverts to `AVAILABLE`.
   - Record customer cash settlement under `/staff/payments`.
5. **Executive Governance:**
   - Log in as `admin@rideflow.lk`.
   - Review live KPIs, gross revenue tally, fleet utilization % on `/admin/dashboard`.
   - Open `/admin/fleet` to add a new car or modify daily rate.
   - Inspect `/admin/audit-logs` to show examiner the tamper-proof compliance ledger.

---

## 6. Project Directory Structure

```
vehical rental system/
├── backend/
│   ├── src/main/java/com/rideflow/
│   │   ├── config/              # Security, CORS, WebConfig
│   │   ├── controller/          # 12 REST API Controllers
│   │   ├── dto/                 # Request/Response Data Transfer Objects
│   │   ├── entity/              # 14 JPA Domain Entities
│   │   ├── enums/               # Domain enumerations
│   │   ├── exception/           # Centralized GlobalExceptionHandler
│   │   ├── mapper/              # Entity to DTO mappers
│   │   ├── repository/          # Spring Data JPA Repositories
│   │   ├── security/            # JWT Token Provider, Auth Filter & Details
│   │   ├── service/             # Business logic layer
│   │   └── RideFlowApplication.java
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable Navbar, Footer, Sidebar, Cards, Badges
│   │   ├── context/             # AuthContext, ToastContext
│   │   ├── layouts/             # MainLayout, DashboardLayout
│   │   ├── pages/               # 25+ Complete UI Pages (Public, Customer, Staff, Admin)
│   │   ├── routes/              # ProtectedRoute with RBAC
│   │   ├── services/            # Axios API wrappers
│   │   ├── index.css            # Custom Dark Slate & Navy Design System
│   │   ├── App.jsx              # Main React Router
│   │   └── main.jsx
│   └── package.json
├── database/
│   ├── schema.sql               # Relational DDL (14 tables)
│   └── seed-data.sql            # Master dataset & demo records
├── API_DOCUMENTATION.md         # Full REST API endpoint reference
└── README.md                    # Project documentation
```
