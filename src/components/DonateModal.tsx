"use client"; // This line makes this a Client Component.

import React, { useEffect, useRef } from 'react';
import { X, CreditCard, Heart } from 'lucide-react';

interface DonateModalProps {
  isOpen: boolean; // Controls whether the modal is open or closed
  onClose: () => void; // Function to call when the modal needs to be closed
}

export function DonateModal({ isOpen, onClose }: DonateModalProps) {
  const modalRef = useRef<HTMLDivElement>(null); // Ref for the modal content div

  // useEffect hook to handle closing the modal on Escape key press or outside clicks
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose(); // Call onClose when Escape key is pressed
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click occurred outside the modal content area
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose(); // Call onClose if clicked outside
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Prevent background scrolling when modal is open
      document.addEventListener('keydown', handleEscape); // Add keydown listener
      document.addEventListener('mousedown', handleClickOutside); // Add mousedown listener
    }

    // Cleanup function: remove event listeners and re-enable scrolling when the modal closes or component unmounts
    return () => {
      document.body.style.overflow = ''; // Re-enable background scrolling
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]); // Dependencies: re-run effect if isOpen or onClose changes

  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    // Fixed overlay for the modal background
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      {/* Modal content container */}
      <div
        ref={modalRef} // Attach ref to this div
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2 space-x-reverse">
            <Heart className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            <span>حمایت مالی</span>
          </h3>
          {/* Close button */}
          <button
            onClick={onClose} // Call onClose when close button is clicked
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="بستن"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body Text */}
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-right leading-relaxed">
          سایت تمرین‌ساز به صورت رایگان عرضه شده تا همه بدون محدودیت از آن استفاده کنند. اگر این ابزار برای شما مفید بوده می توانید با حمایت مالی(دونیت) به توسعه و بهبود مستمر این سایت کمک کنید.
        </p>

        {/* Payment Button and small text, centered */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <a
            href="https://coffeete.ir/ifard" // Link to the payment site
            target="_blank" // Open in a new tab
            rel="noopener noreferrer" // Security best practice for target="_blank"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-bases shadow-md hover:shadow-lg flex items-center justify-center space-x-2 space-x-reverse" // Added flex, items-center, justify-center, space-x-2, space-x-reverse
          >
            <CreditCard className="h-5 w-5" />
            <span>پرداخت با سایت کافیته</span>
          </a>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            پرداخت ریالی با کارت‌های بانکی از طریق درگاه زرین پال
          </p>
        </div>
      </div>
    </div>
  );
}
