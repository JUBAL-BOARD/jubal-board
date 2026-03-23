"use client";

import { useState } from "react";

interface Props {
  images: string[];
}

const ITEMS_PER_PAGE = 5;

const ProfilePortfolio: React.FC<Props> = ({ images }) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(images.length / ITEMS_PER_PAGE);
  const visible = images.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <div className="bg-[#fafafa] p-5">
      <h3 className="font-bold text-black text-2xl mb-4">Portfolio & Certification</h3>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {visible.map((img, i) => (
          <div key={i} className="w-60 h-60 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
            <img src={img} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === page ? "bg-red-500" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePortfolio;