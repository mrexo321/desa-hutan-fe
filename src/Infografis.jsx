import React from "react";
import HomeLayout from "./components/HomeLayout";

const Infografis = () => {
  // Komponen pembantu untuk garis pemisah hijau (Green Divider/Banner)
  const GreenBanner = () => (
    <div className="w-full h-12 md:h-16 bg-gradient-to-b from-[#2D6A42] to-[#163622] rounded-xl shadow-lg my-4"></div>
  );

  return (
    <HomeLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* GREEN BANNER 1 */}
        <GreenBanner />

        {/* SECTION 1: Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { title: "Total Desa", value: "1020" },
            { title: "Desa di HL", value: "124" },
            { title: "Desa di HK", value: "94" },
            { title: "Desa di HP", value: "50" },
            { title: "Desa di KHDTK", value: "211" },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-[#2D7344] p-4 md:p-6 rounded-xl shadow-md text-white flex flex-col justify-center"
            >
              <h3 className="text-sm md:text-base font-medium text-white/90 mb-2">
                {item.title}
              </h3>
              <p className="text-2xl md:text-3xl font-bold">{item.value}</p>
            </div>
          ))}
        </div>

        {/* GREEN BANNER 2 */}
        <GreenBanner />

        {/* SECTION 2: Main Bar Chart (SKOR) */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="font-bold text-gray-800 text-lg mb-2">SKOR</h2>
            <div className="flex justify-center items-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FFD700]"></span>{" "}
                Indikator 1
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#2EBA4A]"></span>{" "}
                Indikator 2
              </div>
            </div>
          </div>

          {/* Mockup Bar Chart Container */}
          <div className="relative h-64 w-full flex items-end justify-between px-2 md:px-10 border-l border-b border-gray-200 pb-2 pt-4">
            {/* Y-Axis Labels Mock */}
            <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-between text-[10px] text-gray-400 py-2">
              <span>700</span>
              <span>600</span>
              <span>500</span>
              <span>400</span>
              <span>300</span>
              <span>200</span>
              <span>100</span>
            </div>

            {/* Bars */}
            {[
              [40, 55],
              [45, 75],
              [40, 40],
              [40, 30],
              [40, 68],
              [60, 55],
              [48, 55],
              [55, 55],
              [30, 55],
              [30, 55],
              [30, 55],
              [30, 55],
              [30, 55],
            ].map((heights, i) => (
              <div
                key={i}
                className="flex gap-1 items-end h-full w-full justify-center"
              >
                <div
                  className="w-3 md:w-5 bg-[#FFD700] rounded-t-sm"
                  style={{ height: `${heights[0]}%` }}
                ></div>
                <div
                  className="w-3 md:w-5 bg-[#2EBA4A] rounded-t-sm"
                  style={{ height: `${heights[1]}%` }}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/* GREEN BANNER 3 */}
        <GreenBanner />

        {/* SECTION 3: Radial / Sunburst Chart */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Skor Indikator
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24 pl-0 md:pl-10">
            {/* Mockup Radial Chart using SVG */}
            <div className="relative w-48 h-48 md:w-64 md:h-64">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full transform -rotate-90 drop-shadow-md"
              >
                {/* Outer Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#B026FF"
                  strokeWidth="20"
                  strokeDasharray="30 250"
                  strokeDashoffset="0"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#CCFF00"
                  strokeWidth="20"
                  strokeDasharray="50 250"
                  strokeDashoffset="-32"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#FF4D4D"
                  strokeWidth="20"
                  strokeDasharray="40 250"
                  strokeDashoffset="-85"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#4DFF9A"
                  strokeWidth="20"
                  strokeDasharray="20 250"
                  strokeDashoffset="-130"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#808080"
                  strokeWidth="20"
                  strokeDasharray="25 250"
                  strokeDashoffset="-155"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#4DEBFF"
                  strokeWidth="20"
                  strokeDasharray="35 250"
                  strokeDashoffset="-185"
                />

                {/* Inner Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="22"
                  fill="transparent"
                  stroke="#D3B0FF"
                  strokeWidth="16"
                  strokeDasharray="20 250"
                  strokeDashoffset="-5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="22"
                  fill="transparent"
                  stroke="#E6FFB3"
                  strokeWidth="16"
                  strokeDasharray="35 250"
                  strokeDashoffset="-30"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="22"
                  fill="transparent"
                  stroke="#FFB3B3"
                  strokeWidth="16"
                  strokeDasharray="25 250"
                  strokeDashoffset="-70"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="22"
                  fill="transparent"
                  stroke="#B3FFD6"
                  strokeWidth="16"
                  strokeDasharray="15 250"
                  strokeDashoffset="-100"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="22"
                  fill="transparent"
                  stroke="#CCCCCC"
                  strokeWidth="16"
                  strokeDasharray="20 250"
                  strokeDashoffset="-120"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="22"
                  fill="transparent"
                  stroke="#B3F5FF"
                  strokeWidth="16"
                  strokeDasharray="25 250"
                  strokeDashoffset="-145"
                />
              </svg>
              {/* Center White Hole */}
              <div className="absolute inset-0 m-auto w-16 h-16 md:w-20 md:h-20 bg-white rounded-full shadow-inner"></div>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-3 text-xs md:text-sm font-medium text-gray-500">
              <h3 className="text-gray-900 font-bold mb-1">Skor</h3>
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-[#FF4D4D]"></span> #1
              </div>
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-[#4DFF9A]"></span> #2
              </div>
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-[#D4A373]"></span> #3
              </div>
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-[#B026FF]"></span> #4
              </div>
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-[#FFD700]"></span> #5
              </div>
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-[#B0B0B0]"></span> #6
              </div>
            </div>
          </div>
        </div>

        {/* GREEN BANNER 4 */}
        <GreenBanner />

        {/* SECTION 4: Bottom 3 Bar Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((card) => (
            <div key={card} className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="font-bold text-gray-800 text-sm mb-4">
                Indikator
              </h3>

              {/* Legend Dots */}
              <div className="flex gap-8 mb-6 ml-6">
                <span className="w-2 h-2 rounded-full bg-[#FFA500]"></span>
                <span className="w-2 h-2 rounded-full bg-[#2EBA4A]"></span>
                <span className="w-2 h-2 rounded-full bg-[#007BFF]"></span>
              </div>

              {/* Mini Bar Chart Mockup */}
              <div className="relative h-48 w-full flex items-end justify-center gap-4 border-l border-b border-gray-200 pb-1 pt-4 pl-4">
                {/* Y-Axis */}
                <div className="absolute -left-2 top-0 bottom-0 flex flex-col justify-between text-[9px] text-gray-400 py-1">
                  <span>700</span>
                  <span>600</span>
                  <span>500</span>
                  <span>400</span>
                  <span>300</span>
                  <span>200</span>
                  <span>100</span>
                </div>

                {/* 3 Bars */}
                <div
                  className="w-10 bg-[#007BFF] rounded-t-sm"
                  style={{
                    height: card === 1 ? "50%" : card === 2 ? "60%" : "35%",
                  }}
                ></div>
                <div
                  className="w-10 bg-[#FFA500] rounded-t-sm"
                  style={{
                    height: card === 1 ? "70%" : card === 2 ? "80%" : "75%",
                  }}
                ></div>
                <div
                  className="w-10 bg-[#2EBA4A] rounded-t-sm"
                  style={{
                    height: card === 1 ? "35%" : card === 2 ? "35%" : "35%",
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </HomeLayout>
  );
};

export default Infografis;
