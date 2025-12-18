import { NextResponse } from "next/server";

const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY || "demo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const search = searchParams.get("search")?.toUpperCase() || "";

  try {
    // Using Alpha Vantage Listing Status CSV
    // Note: In a real app, you'd cache this CSV locally as it's several MBs
    const url = `https://www.alphavantage.co/query?function=LISTING_STATUS&apikey=${ALPHA_VANTAGE_KEY}`;
    
    const response = await fetch(url, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error("Failed to fetch listings");
    }

    const csvText = await response.text();
    const lines = csvText.split("\n");
    const headers = lines[0].split(",");
    
    // symbol,name,exchange,assetType,ipoDate,delistingDate,status
    let listings = lines.slice(1)
      .map(line => {
        const values = line.split(",");
        if (values.length < 3) return null;
        return {
          symbol: values[0],
          name: values[1],
          exchange: values[2],
          assetType: values[3],
          status: values[6]?.trim()
        };
      })
      .filter((l): l is { symbol: string; name: string; exchange: string; assetType: string; status: string } => 
        l !== null && l.status === "Active"
      );

    // Filter for Indian markets or search query
    if (search) {
      listings = listings.filter(l => 
        l.symbol.includes(search) || 
        l.name.toUpperCase().includes(search)
      );
    } else {
      // Default to common Indian exchanges if no search
      listings = listings.filter(l => 
        l.exchange === "BSE" || l.exchange === "NSE"
      );
    }

    const total = listings.length;
    const paginated = listings.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      total,
      page,
      limit,
      source: "alpha_vantage_listings"
    });
  } catch (error) {
    console.error("Listing error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch stock listings" }, { status: 500 });
  }
}
