"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  User, 
  Lock, 
  UserPlus, 
  UserMinus, 
  Calendar,
  MapPin,
  Globe,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import PinCard from "@/components/pin-card";
import MasonryGrid from "@/components/masonry/masonry-grid";

interface Pin {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  tags: string[];
  createdAt: string;
  creator: {
    id: string;
    name: string;
    image: string;
    username: string;
  };
  isLiked: boolean;
  isSaved: boolean;
  _count: {
    likes: number;
    saves: number;
    comments: number;
  };
}

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  image: string;
  bio: string;
  profileVisibility: string;
  activityVisibility: boolean;
  createdAt: string;
  isFollowing: boolean;
  isOwnProfile: boolean;
  isPrivate: boolean;
  _count: {
    pins: number;
    followers: number;
    following: number;
  };
}

export default function UserProfilePage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPins, setUserPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinsLoading, setPinsLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  useEffect(() => {
    if (userProfile && !userProfile.isPrivate) {
      fetchUserPins();
    }
  }, [userProfile]);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      } else if (response.status === 404) {
        setError("User not found");
      } else {
        setError("Failed to load user profile");
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPins = async (page = 1) => {
    if (!userProfile || userProfile.isPrivate) return;

    setPinsLoading(true);
    try {
      const response = await fetch(
        `/api/pins?userId=${userId}&page=${page}&limit=20`
      );
      if (response.ok) {
        const data = await response.json();
        if (page === 1) {
          setUserPins(data.pins);
        } else {
          setUserPins(prev => [...prev, ...data.pins]);
        }
        setPagination({
          page: data.currentPage,
          totalPages: data.totalPages,
          total: data.total,
        });
      }
    } catch (error) {
      console.error('Error fetching user pins:', error);
    } finally {
      setPinsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!session || !userProfile) {
      toast.error("Please log in to follow users");
      return;
    }

    setFollowLoading(true);
    try {
      const method = userProfile.isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`/api/users/${userId}/follow`, {
        method,
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(prev => prev ? {
          ...prev,
          isFollowing: data.isFollowing,
          _count: {
            ...prev._count,
            followers: data.followerCount,
          },
        } : null);
        
        toast.success(
          data.isFollowing ? "Successfully followed user" : "Successfully unfollowed user"
        );
      } else {
        const errorData = await response.json();
        console.error('Follow API error:', response.status, errorData);
        toast.error(errorData.error || "Failed to update follow status");
      }
    } catch (error) {
      console.error('Network error:', error);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages && !pinsLoading) {
      fetchUserPins(pagination.page + 1);
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
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="flex items-center mb-8">
              <div className="w-8 h-8 bg-gray-200 rounded mr-4"></div>
              <div className="h-8 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{error || "User not found"}</h1>
            <Link 
              href="/"
              className="px-6 py-2 text-white bg-red-600 rounded-full hover:bg-red-700"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center p-2 rounded-full hover:bg-gray-100 mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">
            {userProfile.name || "User Profile"}
          </h1>
        </div>

        {/* Profile Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 overflow-hidden rounded-full bg-gray-300">
              {userProfile.image ? (
                <Image
                  src={userProfile.image}
                  alt={userProfile.name || "User"}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-2xl font-bold text-gray-600 bg-gray-200">
                  {userProfile.name?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black">{userProfile.name || "User"}</h2>
              {userProfile.username && (
                <p className="text-lg text-gray-600 mb-2">@{userProfile.username}</p>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <span>{userProfile._count.followers} followers</span>
                <span>{userProfile._count.following} following</span>
                {!userProfile.isPrivate && (
                  <span>{userProfile._count.pins} pins</span>
                )}
              </div>
              {userProfile.bio && !userProfile.isPrivate && (
                <p className="text-gray-600 mb-3 max-w-md">{userProfile.bio}</p>
              )}
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Joined {new Date(userProfile.createdAt).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!userProfile.isOwnProfile && (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`flex items-center px-6 py-2 rounded-full font-medium transition-colors ${
                  userProfile.isFollowing
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-red-600 text-white hover:bg-red-700"
                } ${followLoading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {followLoading ? (
                  "Loading..."
                ) : userProfile.isFollowing ? (
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
            </div>
          )}
        </div>

        {/* Private Profile Message */}
        {userProfile.isPrivate && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">This account is private</h3>
              <p className="text-gray-600 mb-4">
                Follow {userProfile.name} to see their pins and activity.
              </p>
              {!userProfile.isOwnProfile && (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`px-6 py-2 rounded-full font-medium transition-colors ${
                    userProfile.isFollowing
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-red-600 text-white hover:bg-red-700"
                  } ${followLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {followLoading ? "Loading..." : userProfile.isFollowing ? "Requested" : "Follow"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pins Grid */}
        {!userProfile.isPrivate && (
          <>
            {userPins.length > 0 ? (
              <>
                <MasonryGrid
                  items={userPins}
                  render={(pin) => (
                    <PinCard
                      key={pin.id}
                      pin={pin}
                      onLikeChange={handleLikeChange}
                      onSaveChange={handleSaveChange}
                    />
                  )}
                />

                {/* Load More Button */}
                {pagination.page < pagination.totalPages && (
                  <div className="text-center mt-8">
                    <button
                      onClick={handleLoadMore}
                      disabled={pinsLoading}
                      className={`px-8 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors ${
                        pinsLoading ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {pinsLoading ? "Loading..." : "Load More"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No pins yet</h3>
                  <p className="text-gray-600">
                    {userProfile.isOwnProfile
                      ? "Create your first pin to get started!"
                      : `${userProfile.name} hasn't created any pins yet.`}
                  </p>
                  {userProfile.isOwnProfile && (
                    <Link
                      href="/create"
                      className="inline-block mt-4 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      Create Pin
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 