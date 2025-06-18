"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal, Filter, Grid3X3, Heart } from "lucide-react";
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

export default function ProfilePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"pins" | "boards">("pins");
  const [activeFilter, setActiveFilter] = useState<"favorites" | "created">("favorites");
  const [userPins, setUserPins] = useState<Pin[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });



  useEffect(() => {
    if (session?.user?.email) {
      fetchUserProfile();
      if (activeTab === "pins") {
        fetchUserPins();
      }
    }
  }, [session, activeTab, activeFilter]);

  // Refresh profile data when page regains focus (e.g., returning from settings)
  useEffect(() => {
    const handleFocus = () => {
      if (session?.user?.email) {
        fetchUserProfile();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [session]);

  const fetchUserProfile = async () => {
    if (!session?.user?.email) return;

    setProfileLoading(true);
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const profileData = await response.json();
        setUserProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchUserPins = async (page = 1, append = false) => {
    if (!session?.user?.email) return;
    
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setUserPins([]);
    }
    setError(null);
    
    try {
      const favoritesParam = activeFilter === "favorites" ? "&favorites=true" : "";
      const response = await fetch(`/api/pins?userId=${encodeURIComponent(session.user.email)}&page=${page}&limit=50${favoritesParam}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user pins');
      }
      
      const data = await response.json();
      
      if (append) {
        setUserPins(prev => [...prev, ...(data.pins || [])]);
      } else {
        setUserPins(data.pins || []);
      }
      
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error('Error fetching user pins:', err);
      setError('Failed to load your pins');
      if (!append) setUserPins([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMorePins = () => {
    if (pagination.page < pagination.totalPages) {
      fetchUserPins(pagination.page + 1, true);
    }
  };

  const handleLikeChange = (pinId: string, isLiked: boolean, newCount: number) => {
    setUserPins(prevPins => 
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
    setUserPins(prevPins => 
      prevPins.map(pin => 
        pin.id === pinId 
          ? { 
              ...pin, 
              isSaved, 
              _count: { ...pin._count, saves: newCount } 
            }
          : pin
      ).filter(pin => {
        // If we're viewing favorites and the pin was unsaved, remove it from the list
        if (activeFilter === "favorites" && pin.id === pinId && !isSaved) {
          return false;
        }
        return true;
      })
    );

    // Update pagination total if a pin was removed from favorites
    if (activeFilter === "favorites" && !isSaved) {
      setPagination(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1)
      }));
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
            <Link 
              href="/auth/login"
              className="px-6 py-2 text-white bg-red-600 rounded-full hover:bg-red-700"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const user = userProfile || session.user;
  const displayPins = activeTab === "pins" ? userPins : [];

  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Page Header */}
        <div className="py-8">
          <h1 className="text-3xl font-bold text-black mb-8">Your saved ideas</h1>
          
          {/* Profile Section */}
          <div className="flex items-center justify-between mb-8">
            {profileLoading ? (
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="w-24 h-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 overflow-hidden rounded-full bg-gray-300">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt={user?.name || "User"}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-xl font-bold text-gray-600 bg-gray-200">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-black">{user?.name || "User"}</h2>
                  <p className="text-sm text-gray-600">
                    {pagination.total > 0 ? `${pagination.total} pins` : "0 pins"}
                    {user?.username && ` • @${user.username}`}
                  </p>
                  {user?.bio && (
                    <p className="text-sm text-gray-600 mt-1">{user.bio}</p>
                  )}
                </div>
              </div>
            )}
            <Link
              href="/user/settings"
              className="px-4 py-2 text-sm font-medium text-black bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              Edit profile
            </Link>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-8 mb-6">
            <button
              onClick={() => setActiveTab("pins")}
              className={`text-base font-medium pb-2 border-b-2 transition-colors ${
                activeTab === "pins"
                  ? "text-black border-black"
                  : "text-gray-600 border-transparent hover:text-black"
              }`}
            >
              Pins
            </button>
            <button
              onClick={() => setActiveTab("boards")}
              className={`text-base font-medium pb-2 border-b-2 transition-colors ${
                activeTab === "boards"
                  ? "text-black border-black"
                  : "text-gray-600 border-transparent hover:text-black"
              }`}
            >
              Boards
            </button>
          </div>

          {/* Filter Section */}
          {activeTab === "pins" && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-black">
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
                <div className="flex bg-gray-100 rounded-full p-1">
                  <button
                    onClick={() => setActiveFilter("favorites")}
                    className={`px-4 py-1 text-sm font-medium rounded-full transition-colors ${
                      activeFilter === "favorites"
                        ? "bg-black text-white"
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    ★ Favorites
                  </button>
                  <button
                    onClick={() => setActiveFilter("created")}
                    className={`px-4 py-1 text-sm font-medium rounded-full transition-colors ${
                      activeFilter === "created"
                        ? "bg-black text-white"
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    Created by you
                  </button>
                </div>
              </div>
              <button className="p-2 text-gray-600 hover:text-black">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="pb-8">
          {activeTab === "pins" ? (
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading...</p>
                </div>
              ) : displayPins.length > 0 ? (
                <div>
                  <MasonryGrid
                    items={displayPins}
                    render={(pin) => <PinCard key={pin.id} pin={pin} onLikeChange={handleLikeChange} onSaveChange={handleSaveChange} />}
                  />
                  {pagination.page < pagination.totalPages && (
                    <div className="text-center mt-8">
                      <button
                        onClick={loadMorePins}
                        disabled={loadingMore}
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-full font-medium transition-colors disabled:opacity-50"
                      >
                        {loadingMore ? "Loading..." : `Load More (${pagination.total - displayPins.length} remaining)`}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Grid3X3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nothing to show...yet!</h3>
                  <p className="text-gray-600 mb-6">Pins you save will live here.</p>
                  <Link
                    href="/explore"
                    className="inline-flex items-center px-6 py-2 text-white bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                  >
                    Explore ideas
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Sample Board */}
              <div className="bg-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="grid grid-cols-2 gap-1 mb-3">
                  <div className="aspect-square bg-gray-200 rounded"></div>
                  <div className="aspect-square bg-gray-200 rounded"></div>
                  <div className="aspect-square bg-gray-200 rounded"></div>
                  <div className="aspect-square bg-gray-200 rounded"></div>
                </div>
                <h3 className="font-semibold text-sm mb-1">Social</h3>
                <p className="text-xs text-gray-600">0 Pins • 27m</p>
              </div>
              
              {/* Empty state for more boards */}
              <div className="text-center py-8 col-span-full">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Grid3X3 className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Create more boards</h3>
                <p className="text-gray-600 mb-6">Organize your pins into different boards.</p>
                <Link
                  href="/create"
                  className="inline-flex items-center px-6 py-2 text-white bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                >
                  Create board
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 