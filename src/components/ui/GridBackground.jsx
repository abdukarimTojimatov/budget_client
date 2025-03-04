import React from "react";
const GridBackground = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-black text-white bg-grid-white/[0.006] relative">
      {children}
    </div>
  );
};
export default GridBackground;
