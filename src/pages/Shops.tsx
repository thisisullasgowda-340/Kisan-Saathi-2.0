import React, { useState, useEffect } from 'react';
import { offlineDB } from '../lib/indexedDB';
import { AgriculturalShop } from '../types';
import { KARNATAKA_DISTRICTS } from '../data/seedData';
import {
  Store,
  Search,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  Filter,
  Compass,
  AlertCircle
} from 'lucide-react';

export const Shops: React.FC = () => {
  const [shops, setShops] = useState<AgriculturalShop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts');
  const [selectedTaluk, setSelectedTaluk] = useState<string>('All Taluks');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    const list = await offlineDB.getShops();
    setShops(list);
  };

  // Get User's Geolocation with explicit consent
  const handleRequestLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation permission denied or failed:', err);
        setLocationError('Location permission denied or unavailable. You can still filter by district below.');
        setIsLocating(false);
      },
      { timeout: 10000 }
    );
  };

  // Distance calculator (Haversine formula in km)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // Available taluks for currently selected district
  const availableTaluks = [
    'All Taluks',
    ...Array.from(
      new Set(
        shops
          .filter((s) => selectedDistrict === 'All Districts' || s.district === selectedDistrict)
          .map((s) => s.taluk)
      )
    ),
  ];

  // Filter and sort shops
  const filteredShops = shops
    .filter((shop) => {
      const matchDistrict = selectedDistrict === 'All Districts' || shop.district === selectedDistrict;
      const matchTaluk = selectedTaluk === 'All Taluks' || shop.taluk === selectedTaluk;
      const matchSearch =
        !searchQuery ||
        shop.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (shop.ownerName && shop.ownerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        shop.services.some((srv) => srv.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchDistrict && matchTaluk && matchSearch;
    })
    .sort((a, b) => {
      if (userLocation) {
        const distA = parseFloat(calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude));
        const distB = parseFloat(calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude));
        return distA - distB;
      }
      return 0;
    });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D32] uppercase tracking-wider">
            <Store className="w-4 h-4" />
            Karnataka Agricultural Directory
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Find Agricultural Dealers
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
            Locate verified suppliers for certified seeds, bio-fungicides, organic inputs, and university-recommended plant protection products.
          </p>
        </div>

        {/* GPS Location Button */}
        <button
          onClick={handleRequestLocation}
          disabled={isLocating}
          className="kisan-btn-secondary text-xs self-start sm:self-auto"
        >
          <Compass className={`w-4 h-4 mr-2 ${isLocating ? 'animate-spin' : ''}`} />
          {userLocation ? 'Location Active' : 'Find Near Me'}
        </button>
      </div>

      {locationError && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{locationError}</span>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="kisan-card p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by shop name, owner, village, or input (e.g. Tomato seeds, Trichoderma, Mandya)..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* District Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500">Filter District:</label>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedTaluk('All Taluks');
              }}
              className="w-full p-2 rounded-xl border border-slate-200 bg-white text-slate-700"
            >
              {KARNATAKA_DISTRICTS.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          {/* Taluk Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500">Filter Taluk:</label>
            <select
              value={selectedTaluk}
              onChange={(e) => setSelectedTaluk(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 bg-white text-slate-700"
            >
              {availableTaluks.map((taluk) => (
                <option key={taluk} value={taluk}>
                  {taluk}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Shops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredShops.length === 0 ? (
          <div className="col-span-full kisan-card p-12 text-center text-slate-500 text-xs space-y-2">
            <Store className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No agricultural shops found in {selectedDistrict}.</p>
            <button
              onClick={() => {
                setSelectedDistrict('All Districts');
                setSelectedTaluk('All Taluks');
                setSearchQuery('');
              }}
              className="text-[#2E7D32] font-bold hover:underline"
            >
              Show all Karnataka shops
            </button>
          </div>
        ) : (
          filteredShops.map((shop) => {
            const distance = userLocation
              ? calculateDistance(userLocation.lat, userLocation.lng, shop.latitude, shop.longitude)
              : null;

            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${shop.latitude},${shop.longitude}`;

            return (
              <div
                key={shop.id}
                className="kisan-card p-5 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E7D32] bg-[#F1F8E9] px-2.5 py-0.5 rounded-md">
                      {shop.district} • {shop.taluk}
                    </span>

                    {shop.verificationStatus === 'verified' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified Dealer
                      </span>
                    )}
                  </div>

                  {/* Shop Name & Owner */}
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      {shop.shopName}
                    </h3>
                    {shop.ownerName && (
                      <p className="text-xs text-slate-500">Contact: {shop.ownerName}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 text-xs text-slate-600">
                    <MapPin className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                    <span>{shop.address}</span>
                  </div>

                  {/* Distance (if GPS available) */}
                  {distance && (
                    <div className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg inline-block">
                      📍 {distance} km away from your location
                    </div>
                  )}

                  {/* Services / Input Categories */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {shop.services.map((svc, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                      >
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Call Now & Get Directions Buttons */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${shop.phoneNumber}`}
                    className="kisan-btn-primary text-xs py-2.5 justify-center"
                  >
                    <Phone className="w-3.5 h-3.5 mr-1.5" />
                    Call Now
                  </a>

                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="kisan-btn-outline text-xs py-2.5 justify-center text-slate-700"
                  >
                    <Navigation className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                    Directions
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
