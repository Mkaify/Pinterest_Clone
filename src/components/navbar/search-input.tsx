"use client";

import { type ChangeEvent, type FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

const SearchInput = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <form onSubmit={handleSearch} className="w-full relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={handleChange}
          className="w-full py-3 pl-10 pr-4 text-sm bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-gray-200"
        />
      </div>
    </form>
  );
};

export default SearchInput;
