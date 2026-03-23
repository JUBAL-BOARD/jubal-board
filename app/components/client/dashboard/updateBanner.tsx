"use client";

import { useState } from "react";
import { TriangleAlert, X } from "lucide-react";

const UpdateBanner: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(true);

  if (!visible) return null;

  return (
    <div className="flex items-center justify-between bg-[#f99b98] border border-[#fcd9cc] rounded-[10px] px-[18px] py-3.5 mb-5">
      
      <div className="flex items-center gap-3.5">
        <TriangleAlert size={29} stroke="#E85D3A" />
        <div>
          <p className="m-0 font-bold text-2xl text-black">
            App Update Ready!
          </p>
          <p className="m-0 text-lg text-black mt-0.5">
            Enjoy new features and improvements. Update now for a smoother experience.
          </p>
        </div>
      </div>

      <div onClick={() => setVisible(false)} className="cursor-pointer p-1">
        <X size={16} stroke="black" />
      </div>

    </div>
  );
};

export default UpdateBanner;