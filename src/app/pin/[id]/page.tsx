"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Download,
  Link as LinkIcon,
  MoreHorizontal,
  Plus,
} from "lucide-react";

interface Pin {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  createdAt: Date;
  creator: {
    id: string;
    name?: string;
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

interface PinDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PinDetailPage({ params }: PinDetailPageProps) {
  const { data: session } = useSession();
  const [pin, setPin] = useState<Pin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pinId, setPinId] = useState<string>("");
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saveCount, setSaveCount] = useState(0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);

  useEffect(() => {
    const getParams = async () => {
      try {
        const resolvedParams = await params;
        setPinId(resolvedParams.id);
      } catch (error) {
        console.error("Error resolving params:", error);
        setError(true);
      }
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!pinId) return;

    const fetchPin = async () => {
      try {
        const response = await fetch(`/api/pins/${pinId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError(true);
            return;
          }
          throw new Error('Failed to fetch pin');
        }
        const pinData = await response.json();
        setPin(pinData);
        setIsLiked(pinData.isLiked || false);
        setIsSaved(pinData.isSaved || false);
        setLikeCount(pinData._count.likes);
        setSaveCount(pinData._count.saves);
      } catch (error) {
        console.error("Error fetching pin:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPin();
  }, [pinId]);

  const handleSave = async () => {
    if (!session) {
      toast.error("Please log in to save pins");
      return;
    }

    if (isSaveLoading) return;

    setIsSaveLoading(true);
    const wasSaved = isSaved;
    const previousCount = saveCount;

    // Optimistic update
    setIsSaved(!wasSaved);
    setSaveCount(wasSaved ? previousCount - 1 : previousCount + 1);

    try {
      const method = wasSaved ? 'DELETE' : 'POST';
      const response = await fetch(`/api/pins/${pinId}/save`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update save status');
      }

      toast.success(wasSaved ? "Pin removed from saves" : "Pin saved");
    } catch (error) {
      // Revert optimistic update on error
      setIsSaved(wasSaved);
      setSaveCount(previousCount);
      toast.error("Failed to update pin. Please try again.");
      console.error('Error updating save status:', error);
    } finally {
      setIsSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="flex gap-8">
            <div className="flex-shrink-0">
              <div className="w-[500px] h-[600px] bg-gray-200 rounded-2xl animate-pulse"></div>
            </div>
            <div className="flex-1 max-w-md">
              <div className="h-8 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !pin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Pin not found</h1>
          <p className="text-lg text-gray-600 mb-8">
            Sorry, we couldn't find the pin you're looking for.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-full hover:bg-red-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header with back button and actions */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="flex items-center space-x-2">
            <button className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-full transition-colors">
              <MoreHorizontal className="w-5 h-5" />
              </button>
            <button className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-full transition-colors">
              <Share2 className="w-5 h-5" />
              </button>
            <button 
              onClick={handleSave}
              disabled={isSaveLoading}
              className={`px-6 py-2 font-semibold rounded-full transition-colors ${
                isSaved
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-red-600 text-white hover:bg-red-700'
              } ${isSaveLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSaveLoading ? "..." : (isSaved ? "Saved" : "Save")}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Pin Image Section */}
          <div className="flex-shrink-0">
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={pin.imageUrl}
                alt={pin.title}
                width={500}
                height={600}
                className="object-cover"
                style={{
                  width: 'auto',
                  height: 'auto',
                  maxWidth: '500px',
                  maxHeight: '80vh',
                }}
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
                }}
              />
            </div>
          </div>

          {/* Pin Details Section */}
          <div className="flex-1 max-w-md">
            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {pin.title}
            </h1>

            {/* Description */}
          {pin.description && (
              <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                {pin.description}
              </p>
            )}

            {/* Creator Info */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="flex items-center justify-center w-12 h-12 text-white bg-gray-400 rounded-full">
                {pin.creator.image ? (
                  <Image
                    src={pin.creator.image}
                    alt={pin.creator.name || "User"}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-lg font-semibold">
                    {pin.creator.name?.charAt(0) || "U"}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-lg">{pin.creator.name || "Anonymous"}</p>
                <p className="text-gray-500">{formatDate(pin.createdAt)}</p>
              </div>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-full hover:bg-gray-200 transition-colors">
              Follow
            </button>
          </div>

            {/* Engagement Stats */}
            <div className="flex items-center space-x-8 mb-8 text-gray-600">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5" />
                <span className="font-medium">{likeCount} likes</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">{pin._count.comments} comments</span>
              </div>
            </div>

            {/* Comments Section */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Comments</h3>
              
              {/* Comment Input */}
              <div className="flex items-start space-x-4 mb-8">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <textarea
                    placeholder="Add a comment"
                    className="w-full p-4 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
                    rows={3}
                  />
                  <div className="flex justify-end mt-3">
                    <button className="px-6 py-2 bg-red-600 text-white font-medium rounded-full hover:bg-red-700 transition-colors">
                      Post
                    </button>
                  </div>
            </div>
          </div>

              {/* Empty Comments State */}
              <div className="text-center text-gray-500 py-12">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl font-medium mb-2">No comments yet</p>
                <p className="text-gray-400">Be the first to comment!</p>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
