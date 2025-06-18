"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User, UserPlus, UserMinus } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
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

interface SearchUser {
  id: string;
  name: string;
  username: string;
  email: string;
  image: string;
  bio: string;
  profileVisibility: string;
  isFollowing: boolean;
  _count: {
    pins: number;
    followers: number;
  };
}

function SearchPageContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState<'pins' | 'people'>('pins');
  const [pins, setPins] = useState<Pin[]>([]);
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (query) {
      if (activeTab === 'pins') {
        fetchPins();
      } else {
        fetchUsers();
      }
    } else {
      setLoading(false);
    }
  }, [query, activeTab]);

  const fetchPins = async () => {
    if (!query) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/pins?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      const data = await response.json();
      setPins(data.pins || []);
    } catch (err) {
      console.error('Error fetching search results:', err);
      setError('Failed to load search results');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!query) return;
    
    setUsersLoading(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user search results');
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching user search results:', err);
      setError('Failed to load user search results');
    } finally {
      setUsersLoading(false);
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

  const handleFollowUser = async (userId: string, isCurrentlyFollowing: boolean) => {
    if (!session) {
      toast.error("Please log in to follow users");
      return;
    }

    const newFollowingState = new Set(followingUsers);
    if (isCurrentlyFollowing) {
      newFollowingState.delete(userId);
    } else {
      newFollowingState.add(userId);
    }
    setFollowingUsers(newFollowingState);

    try {
      const method = isCurrentlyFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`/api/users/${userId}/follow`, {
        method,
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { 
                  ...user, 
                  isFollowing: data.isFollowing,
                  _count: { ...user._count, followers: data.followerCount }
                }
              : user
          )
        );
        toast.success(
          data.isFollowing ? "Successfully followed user" : "Successfully unfollowed user"
        );
      } else {
        // Revert the state change
        setFollowingUsers(followingUsers);
        const errorData = await response.json();
        console.error('Follow API error:', response.status, errorData);
        toast.error(errorData.error || "Failed to update follow status");
      }
    } catch (error) {
      // Revert the state change
      setFollowingUsers(followingUsers);
      console.error('Network error:', error);
      toast.error("Network error. Please check your connection and try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching...</p>
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

  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Search Results Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">
            {query ? `Search results for "${query}"` : 'Search'}
          </h1>
          
          {/* Tab Navigation */}
          {query && (
            <div className="flex items-center space-x-6 mb-4">
              <button
                onClick={() => setActiveTab('pins')}
                className={`pb-2 border-b-2 transition-colors ${
                  activeTab === 'pins'
                    ? 'border-red-600 text-red-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                Pins {pins.length > 0 && `(${pins.length})`}
              </button>
              <button
                onClick={() => setActiveTab('people')}
                className={`pb-2 border-b-2 transition-colors ${
                  activeTab === 'people'
                    ? 'border-red-600 text-red-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                People {users.length > 0 && `(${users.length})`}
              </button>
            </div>
          )}
        </div>

        {/* Search Results */}
        {!query ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Start searching</h3>
            <p className="text-gray-600">Enter a search term to find pins and people</p>
          </div>
        ) : activeTab === 'pins' ? (
          pins.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">😔</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">No pins found</h3>
              <p className="text-gray-600 mb-4">
                Try searching for something else or check your spelling
              </p>
              <Link
                href="/explore"
                className="inline-flex items-center px-6 py-2 text-white bg-red-600 rounded-full hover:bg-red-700"
              >
                Explore trending ideas
              </Link>
            </div>
          ) : (
            <MasonryGrid
              items={pins}
              render={(pin) => <PinCard key={pin.id} pin={pin} onLikeChange={handleLikeChange} onSaveChange={handleSaveChange} />}
            />
          )
        ) : (
          // People tab
          usersLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto"></div>
              <p className="mt-4 text-gray-600">Searching for people...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No people found</h3>
              <p className="text-gray-600">
                Try searching for a different name or username
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <div key={user.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4 mb-4">
                    <Link href={`/user/${user.id}`}>
                      <div className="w-16 h-16 overflow-hidden rounded-full bg-gray-300 cursor-pointer">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-xl font-bold text-gray-600 bg-gray-200">
                            {user.name?.charAt(0) || "U"}
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1">
                      <Link href={`/user/${user.id}`}>
                        <h3 className="font-semibold text-lg hover:text-red-600 transition-colors">
                          {user.name}
                        </h3>
                      </Link>
                      {user.username && (
                        <p className="text-gray-600">@{user.username}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        {user._count.followers} followers • {user._count.pins} pins
                      </p>
                    </div>
                  </div>
                  
                  {user.bio && user.profileVisibility === 'public' && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{user.bio}</p>
                  )}
                  
                  {session && (
                    <button
                      onClick={() => handleFollowUser(user.id, user.isFollowing || followingUsers.has(user.id))}
                      className={`w-full flex items-center justify-center px-4 py-2 rounded-full font-medium transition-colors ${
                        user.isFollowing || followingUsers.has(user.id)
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                    >
                      {user.isFollowing || followingUsers.has(user.id) ? (
                        <>
                          <UserMinus className="w-4 h-4 mr-2" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Follow
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function SearchPageLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading search...</p>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageLoading />}>
      <SearchPageContent />
    </Suspense>
  );
} 