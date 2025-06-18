"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MoreHorizontal, Share, Download, Flag, EyeOff } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

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

interface PinCardProps {
  pin: Pin;
  onLikeChange?: (pinId: string, isLiked: boolean, newCount: number) => void;
  onSaveChange?: (pinId: string, isSaved: boolean, newCount: number) => void;
}

const PinCard = ({ pin, onLikeChange, onSaveChange }: PinCardProps) => {
  const { data: session } = useSession();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState("Profile");
  const [dropdownPosition, setDropdownPosition] = useState<'right' | 'left'>('right');
  const [isLiked, setIsLiked] = useState(pin.isLiked || false);
  const [isSaved, setIsSaved] = useState(pin.isSaved || false);
  const [likeCount, setLikeCount] = useState(pin._count.likes);
  const [saveCount, setSaveCount] = useState(pin._count.saves);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setShowMoreDropdown(false);
      }
    };

    if (showProfileDropdown || showMoreDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown, showMoreDropdown]);

  // Determine dropdown position based on card position
  useEffect(() => {
    if (showProfileDropdown && profileDropdownRef.current) {
      const rect = profileDropdownRef.current.getBoundingClientRect();
      const spaceOnRight = window.innerWidth - rect.right;
      setDropdownPosition(spaceOnRight < 200 ? 'left' : 'right');
    }
  }, [showProfileDropdown]);

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
      const response = await fetch(`/api/pins/${pin.id}/save`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update save status');
      }

      // Notify parent component about the change
      onSaveChange?.(pin.id, !wasSaved, wasSaved ? previousCount - 1 : previousCount + 1);

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

  const handleShare = () => {
    // Share functionality
    if (navigator.share) {
      navigator.share({
        title: pin.title,
        url: `${window.location.origin}/pin/${pin.id}`,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/pin/${pin.id}`);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="relative mb-4 overflow-visible transition-all duration-200 rounded-2xl hover:shadow-lg group cursor-pointer">
      <Link href={`/pin/${pin.id}`}>
        <div className="relative">
          <Image
            src={pin.imageUrl}
            alt={pin.title}
            width={400}
            height={600}
            className="object-cover w-full rounded-2xl"
            style={{ aspectRatio: 'auto' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`;
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-2xl" />
        </div>
      </Link>

      {/* Pinterest-style overlay buttons */}
      <div className="absolute top-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-start">
        {/* Profile Dropdown - Top Left */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowProfileDropdown(!showProfileDropdown);
            }}
            className="bg-white text-gray-800 px-4 py-2 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
          >
            {selectedProfile}
          </button>

          {showProfileDropdown && (
            <div className={`absolute top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 ${
              dropdownPosition === 'left' ? 'right-0' : 'left-0'
            }`}>
              <div className="py-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProfile("Profile");
                    setShowProfileDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                >
                  Profile
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProfile("For later");
                    setShowProfileDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                >
                  For later
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProfile("Ideas");
                    setShowProfileDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                >
                  Ideas
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProfile("Recipes");
                    setShowProfileDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                >
                  Recipes
                </button>
                <hr className="my-2" />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProfileDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-600"
                >
                  Create board
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Save Button - Top Right */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSave();
          }}
          disabled={isSaveLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all shadow-lg ${
            isSaved
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-red-600 text-white hover:bg-red-700'
          } ${isSaveLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>

      </div>

      {/* Share and More buttons - Bottom Right */}
      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        {/* Share Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleShare();
          }}
          className="w-8 h-8 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
        >
          <Share className="w-4 h-4 text-gray-700" />
        </button>

        {/* More Options Button */}
        <div className="relative" ref={moreDropdownRef}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMoreDropdown(!showMoreDropdown);
            }}
            className="w-8 h-8 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-700" />
          </button>

          {showMoreDropdown && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-200 z-50">
              <div className="py-2">
                <button className="flex items-center w-full px-4 py-2 hover:bg-gray-50 text-sm">
                  <Download className="w-4 h-4 mr-3" />
                  Download image
                </button>
                <button className="flex items-center w-full px-4 py-2 hover:bg-gray-50 text-sm">
                  <EyeOff className="w-4 h-4 mr-3" />
                  Hide Pin
                </button>
                <button className="flex items-center w-full px-4 py-2 hover:bg-gray-50 text-sm text-red-600">
                  <Flag className="w-4 h-4 mr-3" />
                  Report Pin
                </button>
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default PinCard; 