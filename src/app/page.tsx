"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import MasonryGrid from "@/components/masonry/masonry-grid";
import PinCard from "@/components/pin-card";

interface Pin {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  creator: {
    id: string;
    name: string;
    image?: string;
    username?: string;
  };
  _count: {
    likes: number;
    saves: number;
    comments: number;
  };
  isLiked?: boolean;
  isSaved?: boolean;
}

export default function Home() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  useEffect(() => {
    fetchPins();
  }, []);

  const fetchPins = async (page = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setPins([]);
    }
    setError(null);

    try {
      const response = await fetch(`/api/pins?page=${page}&limit=50`);
      if (!response.ok) {
        throw new Error('Failed to fetch pins');
      }
      const data = await response.json();
      
      if (append) {
        setPins(prev => [...prev, ...(data.pins || [])]);
      } else {
        setPins(data.pins || []);
      }
      
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error('Error fetching pins:', err);
      setError('Failed to load pins');
      if (!append) setPins([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMorePins = () => {
    if (pagination.page < pagination.totalPages) {
      fetchPins(pagination.page + 1, true);
    }
  };

  const handleLikeChange = (pinId: string, isLiked: boolean, newCount: number) => {
    setPins(prevPins => 
      prevPins.map(pin => 
        pin.id === pinId 
          ? { 
              ...pin, 
              isLiked, 
              _count: { ...pin._count, likes: newCount } 
            }
          : pin
      )
    );
  };

  const handleSaveChange = (pinId: string, isSaved: boolean, newCount: number) => {
    setPins(prevPins => 
      prevPins.map(pin => 
        pin.id === pinId 
          ? { 
              ...pin, 
              isSaved, 
              _count: { ...pin._count, saves: newCount } 
            }
          : pin
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading pins...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
  return (
      <div className="min-h-screen bg-white">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
              </div>
    );
  }

  if (pins.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">📌</span>
              </div>
            <h3 className="text-xl font-semibold mb-2">No pins yet!</h3>
            <p className="text-gray-600 mb-4">Be the first to create a pin and inspire others.</p>
            <Link
              href="/create"
              className="inline-flex items-center px-6 py-2 text-white bg-red-600 rounded-full hover:bg-red-700"
            >
              Create your first pin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <MasonryGrid
          items={pins}
          render={(pin) => <PinCard key={pin.id} pin={pin} onLikeChange={handleLikeChange} onSaveChange={handleSaveChange} />}
        />
        
        {/* Load More Button */}
        {pagination.page < pagination.totalPages && (
          <div className="text-center mt-8">
            <button
              onClick={loadMorePins}
              disabled={loadingMore}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? "Loading..." : `Load More (${pagination.total - pins.length} remaining)`}
            </button>
          </div>
        )}
        
        {/* Total pins info */}
        {pagination.total > 0 && (
          <div className="text-center mt-4 text-sm text-gray-500">
            Showing {pins.length} of {pagination.total} pins
          </div>
        )}
      </div>
    </div>
  );
}
