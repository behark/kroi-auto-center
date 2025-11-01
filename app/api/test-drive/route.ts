import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import fs from 'fs/promises';
import path from 'path';

// Type for booking document
interface Booking {
  id: string;
  preferredTime: string;
  scheduledDate: string;
  [key: string]: unknown;
}

// Lazy initialize Resend to avoid build errors
function getResend() {
  return process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
}

// Validation schema
const testDriveSchema = z.object({
  customer: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    driversLicense: z.string().optional()
  }),
  carId: z.string().min(1, 'Car selection is required'),
  scheduledDate: z.string().transform(str => new Date(str)),
  preferredTime: z.enum(['morning', 'afternoon', 'evening']),
  notes: z.string().optional(),
  gdprConsent: z.boolean().refine(val => val === true, 'GDPR consent is required')
});

// Rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 3;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];
  const recentRequests = userRequests.filter((time: number) => now - time < RATE_LIMIT_WINDOW);

  if (recentRequests.length >= MAX_REQUESTS) {
    return false;
  }

  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    // Check rate limit
    if (process.env.ENABLE_RATE_LIMITING === 'true' && !checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = testDriveSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if the slot is available
    const dataDir = path.join(process.cwd(), 'data');
    const bookingsFile = path.join(dataDir, 'test-drive-bookings.json');

    // Ensure data directory exists
    await fs.mkdir(dataDir, { recursive: true });

    // Read existing bookings
    let existingBookings: Booking[] = [];
    try {
      const fileContent = await fs.readFile(bookingsFile, 'utf-8');
      existingBookings = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist yet, that's ok
    }

    // Check availability for the time slot
    const slotBookings = existingBookings.filter(booking =>
      booking.scheduledDate === data.scheduledDate.toISOString() &&
      booking.preferredTime === data.preferredTime &&
      ['pending', 'confirmed'].includes(booking.status as string)
    );

    if (slotBookings.length >= 2) { // Max 2 bookings per time slot
      return NextResponse.json(
        { error: 'This time slot is no longer available. Please choose another time.' },
        { status: 409 }
      );
    }

    // Save booking to JSON file
    const booking: Booking = {
      id: Date.now().toString(),
      type: 'testDriveBooking',
      customer: data.customer,
      carId: data.carId,
      scheduledDate: data.scheduledDate.toISOString(),
      preferredTime: data.preferredTime,
      status: 'pending',
      notes: data.notes || '',
      gdprConsent: data.gdprConsent,
      createdAt: new Date().toISOString()
    };

    existingBookings.push(booking);
    await fs.writeFile(bookingsFile, JSON.stringify(existingBookings, null, 2));

    // Send email notifications
    if (process.env.RESEND_API_KEY) {
      const resend = getResend();
      if (resend) {
        const timeSlots = {
          morning: '9:00 - 12:00',
          afternoon: '12:00 - 16:00',
          evening: '16:00 - 19:00'
        };

        try {
          // Email to admin
          await resend.emails.send({
          from: process.env.FROM_EMAIL || 'noreply@kroiautocenter.fi',
          to: process.env.CONTACT_EMAIL || 'kroiautocenter@gmail.com',
          subject: `New Test Drive Booking - ${data.customer.name}`,
          html: `
            <h2>New Test Drive Booking</h2>
            <p><strong>Customer:</strong> ${data.customer.name}</p>
            <p><strong>Email:</strong> ${data.customer.email}</p>
            <p><strong>Phone:</strong> ${data.customer.phone}</p>
            <p><strong>Car ID:</strong> ${data.carId}</p>
            <p><strong>Date:</strong> ${data.scheduledDate.toLocaleDateString('fi-FI')}</p>
            <p><strong>Time:</strong> ${timeSlots[data.preferredTime]}</p>
            ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
          `
        });

        // Confirmation email to customer
        await resend.emails.send({
          from: process.env.FROM_EMAIL || 'noreply@kroiautocenter.fi',
          to: data.customer.email,
          subject: 'Test Drive Booking Confirmation - Kroi Auto Center',
          html: `
            <h2>Test Drive Booking Confirmation</h2>
            <p>Dear ${data.customer.name},</p>
            <p>Your test drive has been scheduled for:</p>
            <p><strong>Date:</strong> ${data.scheduledDate.toLocaleDateString('fi-FI')}</p>
            <p><strong>Time:</strong> ${timeSlots[data.preferredTime]}</p>
            <p>We will contact you shortly to confirm the details.</p>
            <br>
            <p><strong>What to bring:</strong></p>
            <ul>
              <li>Valid driver's license</li>
              <li>Identification document</li>
            </ul>
            <br>
            <p>If you need to reschedule, please contact us at least 24 hours in advance.</p>
            <p>Phone: +358 XX XXX XXXX</p>
            <br>
            <p>Best regards,<br>Kroi Auto Center Team</p>
          `
        });
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Test drive booking submitted successfully',
      bookingId: booking._id,
      scheduledDate: data.scheduledDate.toISOString(),
      preferredTime: data.preferredTime
    });

  } catch (error) {
    console.error('Test drive booking error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your booking' },
      { status: 500 }
    );
  }
}

// Get available time slots
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Read existing bookings from JSON file
    const dataDir = path.join(process.cwd(), 'data');
    const bookingsFile = path.join(dataDir, 'test-drive-bookings.json');

    let bookings: Booking[] = [];
    try {
      const fileContent = await fs.readFile(bookingsFile, 'utf-8');
      const allBookings: Booking[] = JSON.parse(fileContent);

      const startDate = new Date(date);
      const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);

      bookings = allBookings.filter(booking => {
        const bookingDate = new Date(booking.scheduledDate);
        return bookingDate >= startDate &&
               bookingDate < endDate &&
               ['pending', 'confirmed'].includes(booking.status as string);
      });
    } catch (error) {
      // File doesn't exist yet, no bookings
      bookings = [];
    }

    // Count bookings per time slot
    const slotCounts = bookings.reduce((acc: Record<string, number>, booking: Booking) => {
      acc[booking.preferredTime] = (acc[booking.preferredTime] || 0) + 1;
      return acc;
    }, {});

    // Determine available slots (max 2 per slot)
    const availableSlots = {
      morning: slotCounts.morning < 2,
      afternoon: slotCounts.afternoon < 2,
      evening: slotCounts.evening < 2
    };

    return NextResponse.json({ availableSlots });

  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching available slots' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}