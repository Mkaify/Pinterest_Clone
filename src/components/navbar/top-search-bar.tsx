"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Search, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import UserMenu from "./user-menu";
import SearchOverlay from "./search-overlay";

const TopSearchBar = () => {
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const openSearch = () => {
    setIsSearchOpen(true);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-16 right-0 z-50 h-16 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-full px-4">
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={openSearch}
                className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors cursor-pointer"
                readOnly
              />
            </div>
          </div>

          {/* User Section */}
          <div className="flex items-center ml-4">
            {status === "loading" ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : session && session.user ? (
              <UserMenu user={session.user} />
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-full hover:bg-red-700"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 text-sm font-medium text-black bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={closeSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </>
  );
};

export default TopSearchBar; 