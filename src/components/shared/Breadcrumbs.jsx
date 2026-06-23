"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs sm:text-sm text-zinc-500 mb-8">
      <Link to="/" className="flex items-center gap-1 hover:text-orange-500 transition-colors">
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only">Home</span>
      </Link>
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-300 flex-shrink-0" />
            {isLast ? (
              <span className="text-zinc-900 font-medium truncate max-w-[200px] sm:max-w-xs" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link 
                to={item.url} 
                className="hover:text-orange-500 transition-colors truncate max-w-[150px] sm:max-w-xs"
              >
                {item.name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}