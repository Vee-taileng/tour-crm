PRODUCT REQUIREMENTS DOCUMENT
Tour Management System
Chiang Mai Tour Agency · Internal Operations Platform
Version 1.0  ·  Status: Draft  ·  April 2026

Product	Tour Management System (TMS)
Owner	Chiang Mai Clicks
Scope	Single-agency, internal admin use only
Users	Admin staff (company only — no external logins)
Tech Stack	Next.js (App Router) · Supabase (DB, Auth, Storage) · Tailwind CSS · TypeScript
Currency	Thai Baht (THB) only
Version	1.0 — Initial Release
Date	April 2026


1. Problem Statement
Chiang Mai Clicks manages tours across multiple third-party providers. Today this is handled through a mix of WhatsApp messages, paper receipts, and manual spreadsheets. This creates four core operational problems:

No single source of truth for tour details, pricing, or provider commission rates
Client booking records are scattered — no searchable history or repeat-client recognition
Receipts are created manually with no audit trail, making it easy to miscalculate commission or net transfer amounts
Provider payment tracking is informal — there is no record of when net payments were transferred or to which bank account

This PRD defines a web-based internal Tour Management System (TMS) that consolidates tour catalogue management, client bookings, receipt generation, and provider payment logging into a single admin platform.

2. Goals & Success Metrics
2.1 Business Goals
Eliminate manual receipt creation — every booking generates a client receipt automatically
Ensure commission is calculated correctly on every booking with no manual maths
Provide a complete audit trail of all provider net transfers
Build a searchable client database that surfaces repeat clients instantly

2.2 KPIs
Time to create booking + receipt	From ~15 min (manual) to under 3 min
Commission calculation errors	Zero — system calculates automatically
Provider transfer log coverage	100% of transfers recorded in system
Repeat client lookup	Admin can identify returning client in under 30 sec
Tour catalogue accuracy	Single admin update reflects across all bookings instantly

2.3 Anti-Goals
This system does NOT:
  · Accept online payments — all payments are collected offline by admin
  · Support multi-currency — Thai Baht only
  · Allow external logins — no portal for clients or tour providers
  · Automate bank transfers — transfer logging is manual data entry by admin
  · Support multi-agency — single company use only


3. User Persona
There is a single user type for this system: the Admin.

Name	Admin (company staff)
Access	Full system access — single login
Devices	Desktop browser (primary), tablet (secondary)
Tech comfort	Moderate — familiar with web forms and spreadsheets
Core tasks	Manage tours, create bookings, generate receipts, log provider transfers
Pain points	Manual calculations, scattered records, no payment history

4. Proposed Solution
A web-based admin dashboard with five core modules:

Tour Catalogue	Create, edit, import/export tours with pricing tiers, provider links, and feature images
Tour Providers	Manage provider profiles, commission terms, and bank accounts
Client Database	Searchable client records with booking history and repeat-client flagging
Bookings	Create bookings, auto-calculate pricing and commission, track payment status
Provider Transfers	Log manual bank transfers to providers, view outstanding net balances per provider


5. Data Schema
The following tables define the PostgreSQL/Prisma schema. All IDs use cuid().

users
Field	Type	Notes
id	String (cuid)	Primary key
email	String	Unique — admin login
password	String	Bcrypt hashed
name	String	Display name
role	Enum	ADMIN (only role in v1)
createdAt	DateTime	Auto


tour_providers
Field	Type	Notes
id	String (cuid)	Primary key
name	String	Provider/company name
contactName	String?	Primary contact person
phone	String?	WhatsApp/phone
email	String?	
address	String?	
notes	String?	Internal notes
isActive	Boolean	Default true
createdAt	DateTime	Auto


banks
Field	Type	Notes
id	String (cuid)	Primary key
providerId	String	FK → tour_providers
bankName	String	e.g. Kasikorn, SCB, Bangkok Bank
accountName	String	Account holder name
accountNo	String	Account number
isPrimary	Boolean	Default bank for this provider
createdAt	DateTime	Auto


tours
Field	Type	Notes
id	String (cuid)	Primary key
name	String	Tour display name
category	Enum[]	ADVENTURE, CULTURAL, ANIMALS, CULINARY
tourType	Enum	ELEPHANTS, BAMBOO_RAFTING, COOKING_CLASS, MUAY_THAI, TEMPLE_TOUR, WATERFALLS
providerId	String	FK → tour_providers
duration	String	e.g. Half Day, Full Day
departureTimes	String[]	e.g. ['08:00', '13:00']
includeLunch	Boolean	Inclusion flag
inclusions	String[]	Other inclusions list
exclusions	String[]	Exclusions list
adultPrice	Decimal	THB
childPrice	Decimal	THB — ages 3–12
infantPrice	Decimal	THB — default 0 (under 3, free)
commissionType	Enum	FIXED or PERCENTAGE
commissionValue	Decimal	Amount or % per head
minPax	Int?	Minimum pax required
maxPax	Int?	Maximum capacity
featuredImage	String?	File path or URL
status	Enum	ACTIVE, INACTIVE, DRAFT
createdAt	DateTime	Auto
updatedAt	DateTime	Auto


clients
Field	Type	Notes
id	String (cuid)	Primary key
fullName	String	
whatsapp	String	
email	String?	
nationality	String?	
isRepeat	Boolean	Flagged after 2+ bookings
createdAt	DateTime	Auto


pickup_locations
Field	Type	Notes
id	String (cuid)	Primary key
name	String	e.g. Nimman, Old City, Airport
zone	String?	Grouping for route planning
isActive	Boolean	Default true


bookings
Field	Type	Notes
id	String (cuid)	Primary key
bookingRef	String	Human-readable ref, auto-generated e.g. TMS-2024-0001
clientId	String	FK → clients
tourId	String	FK → tours
tourDate	DateTime	Date of the tour
bookingDate	DateTime	Date booking was created
departureTime	String?	Selected slot
adultPax	Int	Count
childPax	Int	Count — ages 3–12
infantPax	Int	Count — under 3, no charge
pickupLocationId	String?	FK → pickup_locations
hotelName	String?	
hotelRoom	String?	
notes	String?	Admin notes
adultUnitPrice	Decimal	Snapshot of price at time of booking
childUnitPrice	Decimal	Snapshot
infantUnitPrice	Decimal	Snapshot — typically 0
totalAmount	Decimal	Calculated: (adult×price) + (child×price)
commissionAmount	Decimal	Calculated and stored — not shown on client receipt
netAmount	Decimal	totalAmount − commissionAmount
paymentStatus	Enum	UNPAID, DEPOSIT, PAID
amountReceived	Decimal?	Actual cash/transfer received from client
bookingSource	Enum?	WALK_IN, WHATSAPP, WEBSITE, PARTNER
bookingStatus	Enum	CONFIRMED, PENDING, CANCELLED, NO_SHOW
createdBy	String	FK → users
createdAt	DateTime	Auto
updatedAt	DateTime	Auto


provider_transfers
Field	Type	Notes
id	String (cuid)	Primary key
providerId	String	FK → tour_providers
bankId	String	FK → banks — which account was used
transferDate	DateTime	Date admin made the transfer
amount	Decimal	THB amount transferred
referenceNo	String?	Bank slip / reference number
notes	String?	e.g. 'Covers bookings TMS-0001 to TMS-0010'
bookingIds	String[]	Array of booking IDs this transfer covers
loggedBy	String	FK → users
createdAt	DateTime	Auto


6. User Stories & Acceptance Criteria
6.1 Tour Catalogue
US-01	As an admin, I want to create a new tour with all pricing tiers, provider link, and commission config, so that all booking calculations pull from one accurate source.
AC	Given I'm on the Tours page, when I click 'Add Tour', then I see a form with all required fields
When I submit with adult, child, and infant prices + commission config, then the tour is saved and listed
Infant price defaults to 0 and cannot be set above 0
Commission can be set as fixed THB per head or a percentage
Tour cannot be saved without linking to a provider

US-02	As an admin, I want to import multiple tours via CSV/Excel, so that I can bulk-load the catalogue without entering tours one by one.
AC	System provides a downloadable template with all required column headers
Upload validates each row — errors are listed with row number before import proceeds
Successfully imported tours are set to DRAFT status by default
Duplicate tour names within same provider trigger a warning, not a hard block

US-03	As an admin, I want to upload a feature image for each tour, so that the tour card displays a photo in the catalogue view.
AC	Accepted formats: JPG, PNG, WEBP under 5MB
Image is cropped/resized to a standard card ratio on upload
Tours without an image show a placeholder

6.2 Client Booking
US-04	As an admin, I want to create a booking by searching for an existing client or entering a new one, so that repeat clients are not duplicated in the system.
AC	Client search by name or WhatsApp number — results appear as I type
If client exists, their details pre-fill the booking form
If new, I can create client inline without leaving the booking flow
isRepeat flag is automatically set once a client has 2+ bookings

US-05	As an admin, I want the system to calculate the total booking amount, commission, and net amount automatically based on pax counts and tour pricing, so that I never need to calculate manually.
AC	Given I select a tour and enter adult, child, and infant pax counts, then price breakdown updates in real time
Adult price × adult pax + child price × child pax = total
Infant pax adds 0 to total but is recorded on the booking
Commission amount is auto-calculated from stored commission config
Net amount = total − commission
All calculated values are stored as snapshots on the booking record (not re-calculated later)

US-06	As an admin, I want to record the client's pickup location, hotel name, and room number on the booking, so that this information appears on the receipt.
AC	Pickup location is selected from a standardised dropdown
Hotel name is free text; room number is optional
Both fields appear on the client receipt

6.3 Receipts
US-07	As an admin, I want to generate a client-facing receipt from a booking, so that I can share it with the client via WhatsApp or print it.
AC	Receipt shows: booking ref, tour name, tour date, departure time, pax breakdown, total amount in THB, pickup details, hotel/room, agency policies
Receipt includes a signature field for client acknowledgement
Receipt does NOT show commission or net amount
Receipt is generated as a printable PDF
Receipt can be regenerated at any time from the booking record

US-08	As an admin, I want to generate an internal CEO receipt from a booking, so that the CEO can approve and initiate the provider bank transfer.
AC	Internal receipt contains everything on the client receipt PLUS:
Commission amount earned, net amount to transfer, provider name and bank details
Transfer status (pending / transferred)
This receipt is accessible only from the admin dashboard — never shared externally
PDF is clearly labelled INTERNAL / CONFIDENTIAL

6.4 Provider & Transfer Management
US-09	As an admin, I want to log a bank transfer to a provider manually, so that there is a complete record of all net payments made.
AC	I can select the provider, their bank account, enter date, amount, and reference number
I can optionally link multiple booking IDs this transfer covers
Transfer is logged with timestamp and the admin user who created it
Once logged, the relevant bookings show transfer status as 'Transferred'

US-10	As an admin, I want to see an outstanding balance view per provider, so that I know how much net amount is still owed before any transfer is made.
AC	View shows: provider name, total net from confirmed bookings, total transferred to date, outstanding balance
Filterable by date range
Outstanding = net from PAID bookings − transferred amount

7. Scope
7.1 In Scope (v1)
Admin authentication (login/logout, single admin role)
Tour Catalogue — create, edit, import CSV, upload feature image, set status
Tour Provider management — profile, bank accounts, commission config
Client Database — create, search, view booking history, repeat flag
Pickup Location master list — create, edit, deactivate
Booking creation — full pricing calc, pax breakdown, notes, payment status
Booking list — searchable, filterable by tour/date/status
Client Receipt (PDF) — shareable, signature field, no commission data
Internal Receipt (PDF) — full detail including commission and bank details
Provider Transfer log — manual entry, link to bookings, reference number
Outstanding balance view per provider
Daily manifest — all bookings for a given tour date

7.2 Out of Scope (v1)
Online payment processing (Stripe, PromptPay, etc.)
Client or provider-facing portal / external logins
Automated bank transfer initiation
Multi-currency support
Multi-agency / multi-tenant support
Native mobile app (responsive web only)
Email/SMS automated notifications to clients
Guide, driver, or vehicle assignment
Waiver / e-signature document management

7.3 Future Considerations
WhatsApp integration — send receipt directly from booking screen
Booking source analytics — track which channel drives most revenue
Guide/driver assignment and daily run sheet export
Seasonal pricing rules — override base pricing for peak periods
Group / private tour pricing (flat rate)
Multi-language receipt (Thai / English toggle)

8. Technical Architecture Notes
Stack: Next.js (App Router) · Supabase (PostgreSQL, Auth, Storage, Edge Functions) · Tailwind CSS · TypeScript

8.1 Key Technical Decisions
Auth	Supabase Auth — email/password login, JWT sessions managed by Supabase, RLS policies restrict data access to authenticated admin only
Database	Supabase PostgreSQL — tables defined via Supabase migrations or SQL editor, queried via supabase-js client or Supabase server client in Next.js Route Handlers
PDF Generation	Server-side PDF generation in Next.js Route Handlers (e.g. @react-pdf/renderer) — two templates: client and internal
Image Storage	Supabase Storage — feature images uploaded to a private bucket, served via signed URLs
Price Snapshots	Unit prices and commission are snapshotted to the booking row at time of creation — price changes on a tour do not retroactively affect existing bookings
Commission Calc	If PERCENTAGE type: commission = totalAmount × (commissionValue / 100). If FIXED: commission = commissionValue × (adultPax + childPax)
Booking Ref	Auto-generated sequential: TMS-YYYY-XXXX (e.g. TMS-2026-0042) via Supabase DB function or server-side logic
CSV Import	Server-side parsing in Next.js Route Handler with row-by-row validation — returns error report before commit
Realtime	Supabase Realtime available for live booking updates / manifest refresh if needed in future phases

8.2 API Endpoints (Next.js Route Handlers)
POST /api/auth/login	Admin login
GET/POST /api/tours	List tours / create tour
PATCH/DELETE /api/tours/:id	Update / deactivate tour
POST /api/tours/import	CSV import
GET/POST /api/providers	List / create providers
GET/POST /api/providers/:id/banks	Provider bank accounts
GET/POST /api/clients	Search / create clients
GET/POST /api/bookings	List / create bookings
GET /api/bookings/:id/receipt	Generate client PDF receipt
GET /api/bookings/:id/internal	Generate internal PDF receipt
GET/POST /api/transfers	List / log provider transfers
GET /api/providers/:id/balance	Outstanding balance for provider
GET /api/manifest?date=	Daily manifest by tour date

9. Open Questions
Q1 — Transfer batching	Do you pay each booking individually or batch by provider weekly/monthly? This affects how bookings are linked to transfers.
Q2 — Receipt policies	What policies should appear on the client receipt? (cancellation terms, meeting point, etc.) — need final copy from you.
Q3 — Booking ref format	Confirm preferred booking reference format: TMS-2026-0001 or a different pattern?
Q4 — Image hosting	Supabase Storage is included in the stack — confirm if the free tier bucket limits are acceptable or if a paid plan is needed.
Q5 — Daily manifest	Should the manifest be exportable as PDF or printable view, or just screen-only?
Q6 — Password reset	Admin-only system: is a manual password reset (dev-side) acceptable, or do you need a self-service reset flow?

10. Dependencies & Risks
10.1 Risks
Price snapshot drift	If admin edits a tour price and someone re-generates a receipt, the stored snapshot vs current price may confuse staff. Mitigation: receipts always use stored booking snapshot, never re-query tour.
Manual transfer errors	Admin enters wrong amount or links wrong bookings to a transfer. Mitigation: outstanding balance view shows discrepancy clearly.
CSV import data quality	Provider-supplied tour data may be inconsistent. Mitigation: strict validation with clear error reporting before import commits.
Single admin failure	If only one admin uses the system, no one can access it if credentials are lost. Mitigation: ensure password reset flow is scoped in v1.

10.2 Dependencies
Cloud storage provider selected before development of image upload feature
Final receipt policy copy provided by agency owner before PDF template build
Supabase project created and environment variables configured before any development begins

11. Suggested Build Phases
Phase	Deliverables	Duration
Phase 1 — Foundation	Auth, admin dashboard shell, DB schema, provider + bank management	1–2 weeks
Phase 2 — Tour Catalogue	Tour CRUD, CSV import, image upload, pickup locations, tour card display	1–2 weeks
Phase 3 — Clients & Bookings	Client DB, booking creation, pricing calc, pax breakdown, payment status	2 weeks
Phase 4 — Receipts	Client PDF receipt, internal PDF receipt, booking ref generation	1 week
Phase 5 — Transfers	Provider transfer log, outstanding balance view, daily manifest	1 week
Phase 6 — Polish & QA	Search/filter, responsive layout, edge cases, UAT with admin	1 week

Estimated total: 7–9 weeks for a single full-stack developer.
Phases 3 and 4 are the highest-value deliverables — if timeline is tight, consider an early MVP release after Phase 4.



End of Document · Tour Management System PRD v1.0 · Chiang Mai Clicks · April 2026