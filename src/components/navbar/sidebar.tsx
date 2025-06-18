"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { 
  Home, 
  Compass, 
  Plus, 
  User,
  Settings,
  MessageCircle,
  Bell
} from "lucide-react";
import MessagesModal from "./messages-modal";
import UpdatesModal from "./updates-modal";

const Sidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isUpdatesOpen, setIsUpdatesOpen] = useState(false);

  const navigationItems = [
    {
      icon: Home,
      label: "Home",
      href: "/",
      active: pathname === "/"
    },
    {
      icon: Compass,
      label: "Explore", 
      href: "/explore",
      active: pathname === "/explore"
    },
    {
      icon: Plus,
      label: "Create",
      href: "/create", 
      active: pathname === "/create"
    }
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4">
      {/* Pinterest Logo */}
              <Link href="/" className="mb-4">
          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700 transition-colors">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
            <path d="M0 12c0 5.123 3.211 9.497 7.73 11.218-.11-.937-.227-2.482.025-3.566.217-.932 1.401-5.938 1.401-5.938s-.357-.715-.357-1.774c0-1.66.962-2.9 2.161-2.9 1.02 0 1.512.765 1.512 1.682 0 1.025-.653 2.557-.99 3.978-.281 1.189.597 2.159 1.769 2.159 2.123 0 3.756-2.239 3.756-5.471 0-2.861-2.056-4.86-4.991-4.86-3.398 0-5.393 2.549-5.393 5.184 0 1.027.395 2.127.889 2.726a.36.36 0 0 1 .083.343c-.091.378-.293 1.189-.332 1.355-.053.218-.173.265-.4.159-1.492-.694-2.424-2.875-2.424-4.627 0-3.769 2.737-7.229 7.892-7.229 4.144 0 7.365 2.953 7.365 6.899 0 4.117-2.595 7.431-6.199 7.431-1.211 0-2.348-.63-2.738-1.373 0 0-.599 2.282-.744 2.84-.282 1.084-1.064 2.456-1.549 3.235C9.584 23.815 10.77 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12"></path>
          </svg>
        </div>
      </Link>

              {/* Main Navigation */}
        <nav className="flex flex-col space-y-2 flex-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative p-3 rounded-full transition-all duration-200 group ${
                  item.active 
                    ? "bg-black text-white" 
                    : "text-gray-800 hover:bg-gray-100"
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5" />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-3 px-3 py-1 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

              {/* Bottom Section */}
        <div className="flex flex-col space-y-2">
          {/* Messages and Notifications - only show when logged in */}
          {session?.user && (
            <>
              <button
                onClick={() => setIsMessagesOpen(true)}
                className="relative p-3 rounded-full transition-all duration-200 group text-gray-800 hover:bg-gray-100"
                title="Messages"
              >
                <MessageCircle className="w-5 h-5" />
              {/* Tooltip */}
              <div className="absolute left-full ml-3 px-3 py-1 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                Messages
              </div>
            </button>

                          <button
                onClick={() => setIsUpdatesOpen(true)}
                className="relative p-3 rounded-full transition-all duration-200 group text-gray-800 hover:bg-gray-100"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
              {/* Tooltip */}
              <div className="absolute left-full ml-3 px-3 py-1 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                Notifications
              </div>
            </button>
          </>
        )}

                  {/* Profile */}
          <Link
            href="/user/profile"
            className={`relative p-3 rounded-full transition-all duration-200 group ${
              pathname === "/user/profile" 
                ? "bg-black text-white" 
                : "text-gray-800 hover:bg-gray-100"
            }`}
            title="Profile"
          >
            <User className="w-5 h-5" />
          {/* Tooltip */}
          <div className="absolute left-full ml-3 px-3 py-1 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
            Profile
          </div>
        </Link>

                  {/* Settings */}
          <Link
            href="/user/settings"
            className={`relative p-3 rounded-full transition-all duration-200 group ${
              pathname === "/user/settings" 
                ? "bg-black text-white" 
                : "text-gray-800 hover:bg-gray-100"
            }`}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          {/* Tooltip */}
          <div className="absolute left-full ml-3 px-3 py-1 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
            Settings
          </div>
        </Link>
      </div>

      {/* Modals */}
      <MessagesModal 
        isOpen={isMessagesOpen} 
        onClose={() => setIsMessagesOpen(false)} 
      />
      <UpdatesModal 
        isOpen={isUpdatesOpen} 
        onClose={() => setIsUpdatesOpen(false)} 
      />
    </aside>
  );
};

export default Sidebar; 