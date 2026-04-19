import crypto from 'crypto'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      razorpay_order_id?: string
      razorpay_payment_id?: string
      razorpay_signature?: string
    }

    if (!body.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'test_secret'
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`)
      .digest('hex')

    if (generatedSignature === body.razorpay_signature) {
      return NextResponse.json({ success: true, message: 'Payment verified successfully' })
    }

    return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 })
  } catch (error: unknown) {
    console.error('Error verifying payment:', error)
    return NextResponse.json({ error: 'Error verifying payment' }, { status: 500 })
  }
}
