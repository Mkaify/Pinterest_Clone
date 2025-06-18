"use client";

import { useState, useEffect, useRef } from "react";
import { X, Heart, MessageCircle, UserPlus, Pin, Settings } from "lucide-react";

interface Update {
  id: string;
  type: "like" | "comment" | "follow" | "pin" | "board";
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: Date;
  isRead: boolean;
  pin?: {
    id: string;
    image: string;
    title: string;
  };
}

interface UpdatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpdatesModal({ isOpen, onClose }: UpdatesModalProps) {
  const [selectedTab, setSelectedTab] = useState<"all" | "unread">("all");
  const modalRef = useRef<HTMLDivElement>(null);

  // Mock data - replace with real data from your API
  const updates: Update[] = [
    {
      id: "1",
      type: "like",
      user: {
        name: "Sarah Wilson",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      },
      content: "liked your pin",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      isRead: false,
      pin: {
        id: "1",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop",
        title: "Delicious Pasta Recipe",
      },
    },
    {
      id: "2",
      type: "comment",
      user: {
        name: "Mike Chen",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      },
      content: "commented on your pin: \"This looks amazing! Can you share the recipe?\"",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      isRead: false,
      pin: {
        id: "2",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop",
        title: "Home Decor Ideas",
      },
    },
    {
      id: "3",
      type: "follow",
      user: {
        name: "Emma Davis",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b098?w=40&h=40&fit=crop&crop=face",
      },
      content: "started following you",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isRead: true,
    },
    {
      id: "4",
      type: "pin",
      user: {
        name: "John Miller",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      },
      content: "saved your pin to their board \"Recipe Collection\"",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      isRead: true,
      pin: {
        id: "3",
        image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=100&h=100&fit=crop",
        title: "Healthy Smoothie Bowl",
      },
    },
    {
      id: "5",
      type: "board",
      user: {
        name: "Lisa Garcia",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face",
      },
      content: "started following your board \"Travel Inspiration\"",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      isRead: true,
    },
  ];

  const getUpdateIcon = (type: Update["type"]) => {
    switch (type) {
      case "like":
        return <Heart className="w-4 h-4 text-red-500" />;
      case "comment":
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case "follow":
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case "pin":
      case "board":
        return <Pin className="w-4 h-4 text-orange-500" />;
      default:
        return <Settings className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredUpdates = selectedTab === "unread" 
    ? updates.filter(update => !update.isRead)
    : updates;

  const unreadCount = updates.filter(update => !update.isRead).length;

  const markAllAsRead = () => {
    // Handle marking all as read
    console.log("Marking all notifications as read");
  };

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div ref={modalRef} className="bg-white rounded-2xl w-full max-w-md h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Updates</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedTab("all")}
              className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                selectedTab === "all"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedTab("unread")}
              className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors relative ${
                selectedTab === "unread"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Mark all as read */}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="w-full mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Updates List */}
        <div className="flex-1 overflow-y-auto">
          {filteredUpdates.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No updates</h3>
                <p className="text-gray-500 text-sm">
                  {selectedTab === "unread" ? "You're all caught up!" : "Check back later for new updates"}
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredUpdates.map((update) => (
                <div
                  key={update.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${
                    !update.isRead ? "bg-red-50" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <img
                        src={update.user.avatar}
                        alt={update.user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                        {getUpdateIcon(update.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1">
                        <span className="font-medium text-sm">{update.user.name}</span>
                        <span className="text-sm text-gray-600">{update.content}</span>
                        {!update.isRead && (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {update.timestamp.toLocaleString()}
                      </p>

                      {update.pin && (
                        <div className="flex items-center space-x-2 mt-2 p-2 bg-gray-50 rounded-lg">
                          <img
                            src={update.pin.image}
                            alt={update.pin.title}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <span className="text-sm text-gray-700 truncate">
                            {update.pin.title}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 