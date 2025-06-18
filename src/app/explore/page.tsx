"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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

const categories = [
  { name: "Home Design", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
  { name: "Fashion", image: "https://images.unsplash.com/photo-1596993100471-c3905dafa78e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
  { name: "Food & Drink", image: "https://images.unsplash.com/photo-1534516662716-0a7cccf1df88?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
  { name: "Travel", image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
  { name: "DIY & Crafts", image: "https://images.unsplash.com/photo-1615529328331-f8917597711f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
  { name: "Fitness", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
];

export default function ExplorePage() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPins = async () => {
      try {
        const response = await fetch('/api/pins');
        if (!response.ok) {
          throw new Error('Failed to fetch pins');
        }
        const data = await response.json();
        setPins(data.pins || []);
      } catch (err) {
        console.error('Error fetching pins:', err);
        setError('Failed to load pins');
      } finally {
        setLoading(false);
      }
    };

    fetchPins();
  }, []);

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

  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Explore ideas</h1>
        <p className="text-gray-600 text-center">Discover new inspiration and trending ideas</p>
      </div>

      {/* Categories */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Browse categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link 
              key={category.name}
              href={`/search?q=${encodeURIComponent(category.name)}`}
              className="group relative overflow-hidden rounded-2xl aspect-square"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-semibold text-sm md:text-base text-center px-2">
                  {category.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Trending Pins */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Trending now</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading pins...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : pins.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">📌</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">No pins yet!</h3>
            <p className="text-gray-600 mb-4">Be the first to create a pin and start exploring.</p>
            <Link
              href="/create"
              className="inline-flex items-center px-6 py-2 text-white bg-red-600 rounded-full hover:bg-red-700"
            >
              Create your first pin
            </Link>
          </div>
        ) : (
          <MasonryGrid
            items={pins}
            render={(pin) => <PinCard key={pin.id} pin={pin} onLikeChange={handleLikeChange} onSaveChange={handleSaveChange} />}
          />
        )}
      </div>
    </div>
    </div>
  );
} 