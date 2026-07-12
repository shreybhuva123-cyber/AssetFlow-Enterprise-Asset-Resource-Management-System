# Odoo Hackathon Demo Script (5-7 Minutes)

**Presenter Note:** Have the app running locally or on Vercel. Have your phone ready to scan a QR code.

### 0:00 - 1:00: The Hook & Introduction
*Start on the `/presentation` screen.*
"Hi judges. We are team AssetFlow. Managing assets in an enterprise today is a nightmare of spreadsheets, lost laptops, and expiring warranties. We built a modern, AI-powered ERP SaaS to solve this."
*Click 'Enter Live Application' to transition to the Executive Dashboard.*

### 1:00 - 2:00: Executive Dashboard & AI
"We're looking at the Executive Dashboard. Notice the real-time KPIs and the AI Insights panel. Our system automatically detects that a MacBook has failed 4 times in 60 days and recommends retirement.
But what if I have a specific question?"
*Click the floating AI button.*
"I can ask our AI assistant: 'Which department has the most expensive assets?' The AI queries our Supabase database in real-time, respecting RLS, and gives me the exact answer."

### 2:00 - 3:00: Smart Search & Asset Lifecycle
"Let's say I need to find John Doe."
*Use the Global Search bar. Type 'John'. Click his profile.*
"Here is John's profile and his assigned assets. Oh, he needs a new monitor. Let's allocate one."
*Demonstrate the Allocation workflow.*

### 3:00 - 4:00: Mobile Scanning & Auditing
"But AssetFlow isn't just a desktop app. It's built for the field."
*Open the QR Scanner modal (or show it on your phone).*
"During a yearly audit, an IT tech just scans the sticker on the back of the laptop. Boom—instant asset details, timeline history, and one-click verification for the audit cycle."

### 4:00 - 5:00: Maintenance & Bookings
"If an asset breaks, employees can log maintenance tickets. And for shared resources like Conference Rooms or Projectors, we built a conflict-free Booking system that behaves exactly like an enterprise calendar."

### 5:00 - 6:00: Architecture & Wrap Up
"Under the hood, this is a Next.js 15 App Router application with a PostgreSQL database on Supabase. We implemented strict Row Level Security (RLS) so data is never leaked between organizations. It's fast, secure, and ready to scale to a million assets today.
Thank you."
