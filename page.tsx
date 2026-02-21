"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Sun, Moon, Globe, User, LogOut, Loader } from "lucide-react";
import { toast } from "sonner";

const categories = [
  { id: "all", name: "All", ar: "الكل" }, { id: "electronics", name: "Electronics", ar: "الإلكترونيات" },
  { id: "home", name: "Home & Kitchen", ar: "المنزل والمطبخ" }, { id: "beauty", name: "Beauty", ar: "الجمال" },
  { id: "fashion", name: "Fashion", ar: "الأزياء" }, { id: "sports", name: "Sports", ar: "الرياضة" },
  { id: "toys", name: "Toys", ar: "الألعاب" }, { id: "books", name: "Books", ar: "الكتب" },
  { id: "baby", name: "Baby", ar: "منتجات الأطفال" }, { id: "pet", name: "Pet Supplies", ar: "مستلزمات الحيوانات" },
  { id: "automotive", name: "Automotive", ar: "السيارات" }, { id: "tools", name: "Tools", ar: "الأدوات" },
  { id: "office", name: "Office", ar: "المكتب" }, { id: "grocery", name: "Grocery", ar: "البقالة" },
  { id: "videogames", name: "Video Games", ar: "ألعاب الفيديو" }, { id: "music", name: "Music", ar: "الموسيقى" },
  { id: "movies", name: "Movies", ar: "الأفلام" }, { id: "software", name: "Software", ar: "البرمجيات" },
  { id: "arts", name: "Arts & Crafts", ar: "الفنون" }, { id: "industrial", name: "Industrial", ar: "الصناعي" },
  { id: "kindle", name: "Kindle", ar: "كيندل" }, { id: "health", name: "Health", ar: "الصحة" },
  { id: "jewelry", name: "Jewelry", ar: "المجوهرات" }, { id: "watches", name: "Watches", ar: "الساعات" },
];

const marketplaces = {
  eg: { code: "eg", name: "مصر 🇪🇬", domain: "https://www.amazon.eg" },
  us: { code: "us", name: "عالمي 🇺🇸", domain: "https://www.amazon.com" }
};

export default function AliZoneDeals() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [marketplace, setMarketplace] = useState<"eg" | "us">("eg");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastProductRef = useCallback((node: any) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) loadMore();
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore]);

  const t = (en: string, ar: string) => lang === "en" ? en : ar;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [lang, theme]);

  useEffect(() => {
    const saved = localStorage.getItem("alizone_user");
    if (saved) { setIsLoggedIn(true); setUserEmail(saved); }
    fetchProducts("all", "", 1, marketplace);
  }, [marketplace]);

  const fetchProducts = async (cat: string, q: string, pg: number, mp: "eg" | "us") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?category=\( {cat}&q= \){encodeURIComponent(q)}&page=\( {pg}&marketplace= \){mp}`);
      const data = await res.json();
      if (pg === 1) setProducts(data.products || []);
      else setProducts(prev => [...prev, ...(data.products || [])]);
      setHasMore(data.hasMore || false);
    } catch (e) { toast.error("خطأ في جلب المنتجات"); }
    setLoading(false);
  };

  const handleCategory = (cat: string) => { setSelectedCategory(cat); setPage(1); setSearchTerm(""); fetchProducts(cat, "", 1, marketplace); };
  const handleSearch = () => { setPage(1); fetchProducts(selectedCategory, searchTerm, 1, marketplace); };

  const loadMore = () => {
    const next = page + 1;
    setPage(next); setLoadingMore(true);
    fetchProducts(selectedCategory, searchTerm, next, marketplace).finally(() => setLoadingMore(false));
  };

  const handleBuy = (asin: string) => {
    if (!isLoggedIn) { setShowLogin(true); return; }
    const domain = marketplaces[marketplace].domain;
    window.open(`\( {domain}/dp/ \){asin}?tag=${process.env.NEXT_PUBLIC_AFFILIATE_TAG}`, "_blank");
    toast.success(t("Redirecting to Amazon...", "جاري التوجيه إلى أمازون..."));
  };

  const login = (email: string) => {
    const final = email || "guest@alizone.com";
    localStorage.setItem("alizone_user", final);
    setIsLoggedIn(true); setUserEmail(final); setShowLogin(false);
    toast.success(t("Logged in!", "تم تسجيل الدخول!"));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🛍️</div>
            <h1 className="text-2xl font-bold text-orange-600">Ali Zone Deals</h1>
          </div>

          <div className="flex gap-2 text-sm">
            {Object.entries(marketplaces).map(([key, val]) => (
              <button key={key} onClick={() => setMarketplace(key as "eg" | "us")}
                className={`px-4 py-1.5 rounded-2xl transition ${marketplace === key ? "bg-orange-600 text-white" : "bg-gray-200 dark:bg-gray-800"}`}>
                {val.name}
              </button>
            ))}
          </div>

          <div className="flex-1 max-w-xl mx-auto w-full">
            <div className="relative">
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder={t("Search Amazon products...", "ابحث في منتجات أمازون...")}
                className="w-full bg-gray-100 dark:bg-gray-800 px-6 py-3 rounded-3xl text-lg" />
              <button onClick={handleSearch} className="absolute end-3 top-1/2 -translate-y-1/2 bg-orange-600 text-white px-6 py-2 rounded-2xl">
                {t("Search", "بحث")}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-3 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-800">
              {theme === "dark" ? <Sun /> : <Moon />}
            </button>
            <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="p-3 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-800">
              <Globe />
            </button>
            {isLoggedIn ? (
              <div className="flex items-center gap-2 text-sm">
                <span>{userEmail}</span>
                <button onClick={() => { localStorage.clear(); setIsLoggedIn(false); }} className="text-red-500"><LogOut size={20} /></button>
              </div>
            ) : (
              <button onClick={() => setShowLogin(true)} className="bg-orange-600 text-white px-6 py-3 rounded-3xl font-semibold flex items-center gap-2">
                <User /> {t("Login", "تسجيل الدخول")}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        <aside className="w-72 lg:w-80 p-6 border-l hidden lg:block overflow-y-auto h-screen bg-white dark:bg-gray-900">
          <h2 className="font-bold text-xl mb-6 text-orange-600">{t("Categories", "الأقسام")}</h2>
          <div className="space-y-1">
            {categories.map(cat => (
              <button key={cat.id} onClick={() => handleCategory(cat.id)}
                className={`w-full text-start px-5 py-4 rounded-2xl hover:bg-orange-50 dark:hover:bg-orange-950 ${selectedCategory === cat.id ? "bg-orange-100 dark:bg-orange-950 font-bold text-orange-600" : ""}`}>
                {lang === "ar" ? cat.ar : cat.name}
              </button>
            ))}
          </div>
        </aside>

        <div className="lg:hidden w-full px-4 py-3 border-b bg-white dark:bg-gray-900 overflow-x-auto whitespace-nowrap flex gap-3">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => handleCategory(cat.id)}
              className={`px-5 py-2 rounded-3xl text-sm ${selectedCategory === cat.id ? "bg-orange-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}>
              {lang === "ar" ? cat.ar : cat.name}
            </button>
          ))}
        </div>

        <main className="flex-1 p-4 lg:p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">{t("Featured Deals", "عروض مميزة")}</h2>
            <span className="text-sm text-gray-500">{products.length} {t("products", "منتج")}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p, idx) => (
              <div key={p.asin} ref={idx === products.length - 1 ? lastProductRef : null}
                className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border hover:border-orange-500 transition group">
                <img src={p.image} alt={p.title} className="w-full h-56 object-cover" />
                <div className="p-5">
                  <h3 className="font-semibold line-clamp-2 text-sm mb-4">{p.title}</h3>
                  <div className="flex justify-between items-center">
                    <p className="text-2xl font-bold text-orange-600">{p.price}</p>
                    <button onClick={() => handleBuy(p.asin)} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl text-sm font-semibold">
                      {t("Buy Now", "اشترِ الآن")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {loading && <div className="text-center py-12"><Loader className="animate-spin mx-auto" /></div>}

          {hasMore && !loading && (
            <div className="text-center mt-12">
              <button onClick={loadMore} disabled={loadingMore}
                className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-4 rounded-3xl font-bold text-lg">
                {loadingMore ? "جاري التحميل..." : t("Load More", "تحميل المزيد")}
              </button>
            </div>
          )}
        </main>
      </div>

      {showLogin && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-10 rounded-3xl w-full max-w-md">
            <h2 className="text-3xl font-bold mb-8 text-center">{t("Login to buy", "تسجيل الدخول للشراء")}</h2>
            <input id="emailInput" type="email" placeholder="your@email.com" className="w-full px-6 py-4 bg-gray-100 dark:bg-gray-800 rounded-3xl mb-6 text-lg" />
            <button onClick={() => login((document.getElementById("emailInput") as HTMLInputElement).value)} 
              className="w-full bg-orange-600 py-5 rounded-3xl text-xl font-bold">
              {t("Login", "دخول")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
            }
