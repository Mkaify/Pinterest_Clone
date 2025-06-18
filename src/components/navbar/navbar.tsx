"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import SearchInput from "./search-input";
import SearchOverlay from "./search-overlay";
import UserMenu from "./user-menu";

const Navbar = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 bg-white border-b ml-16">
      <div className="flex items-center justify-between h-full px-4 mx-auto max-w-7xl">
        {/* Empty space - logo moved to sidebar */}
        <div></div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full py-3 pl-10 pr-4 text-sm bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer"
              readOnly
            />
          </div>
        </div>

        {/* User Section */}
        <div className="flex items-center gap-2">
          {status === "loading" ? (
            <div className="flex gap-2">
              <div className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-full opacity-50">
                Log in
              </div>
              <div className="px-4 py-2 text-sm font-medium text-black bg-gray-100 rounded-full opacity-50">
                Sign up
              </div>
            </div>
          ) : session?.user ? (
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

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </header>
  );
};

export default Navbar;
