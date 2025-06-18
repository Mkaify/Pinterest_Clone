"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Clock, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchOverlay = ({ isOpen, onClose, searchQuery, setSearchQuery }: SearchOverlayProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Sample recent searches (in a real app, this would come from localStorage or user data)
  const recentSearches = [
    "eid girls outfit",
    "eid girls dpz", 
    "Eid",
    "girls dpz",
    "girls night"
  ];

  // Sample popular searches with images
  const popularSearches = [
    {
      term: "Urdu poetry ghalib",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      term: "Loft house design",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      term: "Cute wedding ideas",
      image: "https://images.unsplash.com/photo-1672190877749-815628ced93a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      term: "Dream bedroom inspiration",
      image: "https://images.unsplash.com/photo-1576229339550-beaa321a40e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      term: "Wallpaper ideas",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      term: "Hear me out",
      image: "https://i.pinimg.com/736x/1d/f0/57/1df05766cb98588c55afbfc3de213105.jpg"
    },
    {
      term: "My vibe",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      term: "Mirror selfie",
      image: "https://images.unsplash.com/flagged/photo-1579941428818-34037db47af4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      term: "Dp for whatsapp",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      term: "Summer aesthetic",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      term: "Study motivation",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      term: "Best friend",
      image: "https://plus.unsplash.com/premium_photo-1669135432025-cc8cc0862d47?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    }
  ];

  // Handle search submission
  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  // Focus search input when overlay opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header with search input - Fixed */}
      <div className="flex items-center p-4 border-b border-gray-200 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          />
        </form>
        <button
          onClick={onClose}
          className="ml-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Search content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Recent searches</h2>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <div
                    key={index}
                    className="flex items-center px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors text-sm group"
                  >
                    <button
                      onClick={() => handleSearch(search)}
                      className="flex items-center flex-1 min-w-0"
                    >
                      <Clock className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                      <span className="truncate">{search}</span>
                    </button>
                    <button 
                      className="ml-2 p-1 rounded-full hover:bg-gray-300 transition-colors flex-shrink-0"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // In a real app, this would remove the item from recent searches
                      }}
                      aria-label={`Remove ${search} from recent searches`}
                    >
                      <X className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ideas for you / Popular searches */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Ideas for you</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {popularSearches.slice(0, 8).map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(item.term)}
                  className="group relative aspect-square rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <Image
                    src={item.image}
                    alt={item.term}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <span className="text-white font-semibold text-center text-sm drop-shadow-lg">
                      {item.term}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Popular on Pinterest */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Popular on Pinterest</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {popularSearches.slice(8).map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(item.term)}
                  className="group relative aspect-square rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <Image
                    src={item.image}
                    alt={item.term}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <span className="text-white font-semibold text-center text-sm drop-shadow-lg">
                      {item.term}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay; 