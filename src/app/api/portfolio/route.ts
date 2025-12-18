import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { userId, stock } = await request.json();

  if (!userId || !stock) {
    return NextResponse.json({ error: 'User ID and stock are required' }, { status: 400 });
  }

  try {
    const portfolio = await prisma.portfolio.upsert({
      where: { userId },
      update: {
        stocks: {
          push: stock,
        },
      },
      create: {
        userId,
        stocks: [stock],
      },
    });
    return NextResponse.json({ portfolio });
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: parseInt(userId) },
    });

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const stocks = portfolio.stocks;
    let portfolioValue = 0;

    for (const stock of stocks) {
      const response = await fetch(`https://api.marketstack.com/v1/tickers/${stock}/intraday/latest?access_key=YOUR_ACCESS_KEY`);
      const data = await response.json();
      portfolioValue += data.last;
    }

    return NextResponse.json({ portfolio, portfolioValue });
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
