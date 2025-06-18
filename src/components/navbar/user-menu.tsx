"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import {
  ChevronDown,
  LogOut,
  Settings,
  User as UserIcon,
  Plus
} from "lucide-react";
import { getInitials } from "@/lib/utils";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const UserMenu = ({ user }: UserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => {
    setIsOpen(false);
  };

  // Fetch user profile data to get the latest profile image
  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const profileData = await response.json();
        setUserProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Refresh profile data when the menu is opened (in case user just updated their photo)
  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (!isOpen && user?.email) {
      fetchUserProfile();
    }
  };

  // Fetch profile data on component mount
  useEffect(() => {
    if (user?.email) {
      fetchUserProfile();
    }
  }, [user?.email]);

  // Refresh profile data when window regains focus (e.g., returning from settings)
  useEffect(() => {
    const handleFocus = () => {
      if (user?.email) {
        fetchUserProfile();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [user?.email]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="flex items-center gap-1 p-1 rounded-full hover:bg-gray-100 focus:outline-none"
      >
        <div className="flex items-center justify-center w-8 h-8 overflow-hidden text-white bg-gray-300 rounded-full">
          {(userProfile?.image || user.image) ? (
            <Image
              src={userProfile?.image || user.image}
              alt={userProfile?.name || user.name || "User"}
              width={32}
              height={32}
              className="object-cover w-full h-full"
            />
          ) : (
            <span>{getInitials(userProfile?.name || user.name || "")}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 w-56 mt-1 overflow-hidden bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="border-b">
            <Link 
              href={`/user/profile`} 
              className="block px-4 py-3 hover:bg-gray-50"
              onClick={closeMenu}
            >
              <div className="font-medium">{userProfile?.name || user.name}</div>
              <div className="text-xs text-gray-500">{userProfile?.email || user.email}</div>
            </Link>
          </div>

          <div className="py-1">
            <Link 
              href="/user/profile" 
              className="flex items-center px-4 py-2 text-sm hover:bg-gray-50"
              onClick={closeMenu}
            >
              <UserIcon className="w-4 h-4 mr-3 text-gray-500" />
              Profile
            </Link>
            <Link 
              href="/create" 
              className="flex items-center px-4 py-2 text-sm hover:bg-gray-50"
              onClick={closeMenu}
            >
              <Plus className="w-4 h-4 mr-3 text-gray-500" />
              Create Pin
            </Link>
            <Link 
              href="/user/settings" 
              className="flex items-center px-4 py-2 text-sm hover:bg-gray-50"
              onClick={closeMenu}
            >
              <Settings className="w-4 h-4 mr-3 text-gray-500" />
              Settings
            </Link>
          </div>

          <div className="py-1 border-t">
            <button
              onClick={() => {
                closeMenu();
                signOut();
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4 mr-3 text-gray-500" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
