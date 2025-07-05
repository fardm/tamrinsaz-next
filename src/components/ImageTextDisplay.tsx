// src/components/ImageTextDisplay.tsx
import React from 'react';

interface ImageTextDisplayProps {
  text: string;
  imageName: string; // Expected to be like 'dumbbell.webp' or 'shoulder.webp'
  altText: string;
  onClick?: (value: string) => void; // Optional click handler
  filterValue?: string; // Optional value to pass to onClick
}

const getImageUrl = (imageName: string) => {
  // در Next.js، تصاویر در پوشه `public` قرار می‌گیرند و از ریشه `/` قابل دسترسی هستند.
  // بنابراین نیازی به `new URL` نیست.
  return `/images/${imageName}`;
};

export function ImageTextDisplay({ text, imageName, altText, onClick, filterValue }: ImageTextDisplayProps) {
  const handleClick = () => {
    if (onClick && filterValue) {
      onClick(filterValue);
    }
  };

  return (
    <div
      // استایل‌های پایه: پس‌زمینه خاکستری روشن/تیره، بوردر خاکستری
      // استایل‌های هاور: پس‌زمینه کمی تیره‌تر، بوردر کمی پررنگ‌تر
      className={`
        flex flex-col items-center p-2 rounded-lg
        bg-gray-50 dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        transition-colors duration-200
        ${onClick ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600' : ''}
      `}
      onClick={handleClick}
    >
      <img
        src={getImageUrl(imageName)}
        alt={altText}
        className="w-16 h-16 object-contain mb-1 rounded-lg bg-gray-200 dark:bg-gray-600 p-1"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/e0e0e0/000000?text=No+Image'; // Fallback
        }}
      />
      <span className="text-sm font-medium text-center text-gray-900 dark:text-white">
        {text}
      </span>
    </div>
  );
}