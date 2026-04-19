import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'test_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret',
})

export async function POST(request: Request) {
  try {
    const { amount, receipt } = (await request.json()) as { amount?: number; receipt?: string }

    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 })
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
    })

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error: unknown) {
    console.error('Error creating Razorpay order:', error)
    return NextResponse.json({ error: 'Error creating Razorpay order' }, { status: 500 })
  }
}
