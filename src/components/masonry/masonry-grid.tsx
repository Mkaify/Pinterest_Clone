"use client";

import React from "react";
import Masonry from "react-masonry-css";

interface MasonryGridProps<T> {
  items: T[];
  render: (item: T) => React.ReactNode;
  className?: string;
}

const breakpointColumns = {
  default: 5,
  1536: 5,
  1280: 4,
  1024: 3,
  768: 2,
  640: 2,
  500: 1,
};

function MasonryGrid<T>({ items, render, className = "" }: MasonryGridProps<T>) {
  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className={`flex w-auto -ml-4 ${className}`}
      columnClassName="pl-4 bg-clip-padding"
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>{render(item)}</React.Fragment>
      ))}
    </Masonry>
  );
}

export default MasonryGrid;
