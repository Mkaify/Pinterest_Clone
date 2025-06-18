import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function PinNotFound() {
  return (
    <div className="container px-4 py-16 mx-auto max-w-2xl text-center">
      <div className="mb-8">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <Search className="w-12 h-12 text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Pin not found</h1>
        <p className="text-lg text-gray-600 mb-8">
          Sorry, we couldn't find the pin you're looking for. It may have been removed or the link might be incorrect.
        </p>
      </div>

      <div className="space-y-4">
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-full hover:bg-red-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go back to home
        </Link>
        
        <div className="text-sm text-gray-500">
          or try searching for something else
        </div>
      </div>
    </div>
  );
} 