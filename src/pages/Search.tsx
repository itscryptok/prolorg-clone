import { useState } from "react";
import { useLocation } from "wouter";
import { Search as SearchIcon, ArrowLeft, Filter } from "lucide-react";
import Footer from "@/components/Footer";

export default function Search() {
  const [, setLocation] = useLocation();
  const [params, setParams] = useState({
    city: "",
    country: "",
    keyword: "",
    availability: "",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const qs = new URLSearchParams();
    if (params.keyword) qs.set("keyword", params.keyword);
    if (params.city) qs.set("city", params.city);
    if (params.country) qs.set("country", params.country);
    if (params.availability) qs.set("availability", params.availability);
    setLocation(`/feed?${qs.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="w-full md:w-4/5 lg:w-3/5 mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setLocation("/feed")} className="p-2 bg-card rounded-full hover:bg-secondary transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <SearchIcon size={36} className="text-primary" /> Discovery
          </h1>
        </div>

        <form onSubmit={handleSearch} className="bg-card border border-border p-6 rounded-xl shadow-lg space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
              Skill / Keyword
            </label>
            <input
              value={params.keyword}
              onChange={(e) => setParams({ ...params, keyword: e.target.value })}
              className="w-full bg-input border border-border p-3 rounded focus:outline-none focus:border-primary"
              placeholder="e.g. React, Product Manager, Designer"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">City</label>
              <input
                value={params.city}
                onChange={(e) => setParams({ ...params, city: e.target.value })}
                className="w-full bg-input border border-border p-3 rounded focus:outline-none focus:border-primary"
                placeholder="e.g. San Francisco"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Country</label>
              <input
                value={params.country}
                onChange={(e) => setParams({ ...params, country: e.target.value })}
                className="w-full bg-input border border-border p-3 rounded focus:outline-none focus:border-primary"
                placeholder="e.g. USA"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Availability</label>
            <input
              value={params.availability}
              onChange={(e) => setParams({ ...params, availability: e.target.value })}
              className="w-full bg-input border border-border p-3 rounded focus:outline-none focus:border-primary"
              placeholder="e.g. Immediate, Open to offers, Fractional"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-3 rounded-md font-bold hover:bg-primary/90 flex items-center justify-center gap-2 mt-2"
          >
            <Filter size={18} /> Show Matching Prologues
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Filters open the video feed showing matches first, then browsing continues with everyone else.
        </p>
      </div>
      <Footer />
    </div>
  );
}
