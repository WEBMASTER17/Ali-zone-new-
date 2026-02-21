import { NextRequest, NextResponse } from "next/server";
import amazonPaapi from "amazon-paapi";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category") || "all";
  const keyword = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const mp = searchParams.get("marketplace") || "eg";

  const marketplaceCode = mp === "us" ? "www.amazon.com" : "www.amazon.eg";

  const commonParameters = {
    AccessKey: process.env.ACCESS_KEY!,
    SecretKey: process.env.SECRET_KEY!,
    PartnerTag: process.env.PARTNER_TAG!,
    PartnerType: "Associates",
    Marketplace: marketplaceCode,
  };

  const categoryMap: Record<string, string> = {
    all: "All", electronics: "Electronics", home: "Home", beauty: "Beauty",
    fashion: "Fashion", sports: "SportingGoods", toys: "Toys", books: "Books",
    baby: "Baby", pet: "PetSupplies", automotive: "Automotive", tools: "ToolsHomeImprovement",
    office: "OfficeProducts", grocery: "Grocery", videogames: "VideoGames",
    music: "MusicalInstruments", movies: "MoviesAndTV", software: "Software",
    arts: "ArtsAndCrafts", industrial: "Industrial", kindle: "KindleStore",
    health: "HealthPersonalCare", jewelry: "Jewelry", watches: "Watches",
    luggage: "Luggage", appliances: "Appliances", collectibles: "Collectibles",
  };

  const requestParameters = {
    Keywords: keyword || "bestsellers",
    SearchIndex: categoryMap[category] || "All",
    ItemCount: 10,
    ItemPage: page,
    Resources: ["Images.Primary.Medium", "ItemInfo.Title", "Offers.Listings.Price"],
  };

  try {
    const data = await amazonPaapi.SearchItems(commonParameters, requestParameters);
    const items = data?.SearchResult?.Items || [];
    const products = items.map((item: any) => ({
      asin: item.ASIN,
      title: item.ItemInfo?.Title?.DisplayValue || "No Title",
      price: item.Offers?.Listings?.[0]?.Price?.DisplayAmount || "غير متوفر",
      image: item.Images?.Primary?.Medium?.URL || "",
    }));

    return NextResponse.json({
      products,
      hasMore: items.length === 10 && page < 10,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "خطأ في الـ API" }, { status: 500 });
  }
}
