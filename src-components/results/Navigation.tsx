import React, { useState } from "react";

interface NavigationProps {
  pageTitles: string[];
}

const Navigation: React.FC<NavigationProps> = (props) => {
  const { pageTitles } = props;
  const [currentPage, setCurrentPage] = useState(1);

  // Function to shift the current page by one to the left or right
  const shiftPage = (direction: "left" | "right") => {
    if (direction === "left" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === "right" && currentPage < pageTitles.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const upperLimit =
    currentPage === pageTitles.length
      ? currentPage - 4
      : currentPage === pageTitles.length - 1
      ? currentPage - 3
      : currentPage - 2;

  const lowerLimit =
    currentPage === 1
      ? currentPage + 4
      : currentPage === 2
      ? currentPage + 3
      : currentPage + 2;

  return (
    <div className="flex items-center justify-center">
      {/* Left arrow to shift the current page to the left */}
      <div
        className="cursor-pointer rounded-l bg-gray-500 py-2 px-4 font-bold text-white hover:bg-gray-700"
        onClick={() => shiftPage("left")}
        // Hide the left arrow if the current page is the first page
        style={{ visibility: currentPage === 1 ? "hidden" : "visible" }}
      >
        {"<"}
      </div>
      {/* Page numbers */}

      {pageTitles.map((title, index) => {
        // Only show page numbers within the current page range

        return (
          index + 1 >= upperLimit &&
          index + 1 <= lowerLimit && (
            <div
              key={index}
              className={`mx-2 cursor-pointer rounded bg-gray-500 py-2 px-4 font-bold text-white hover:bg-gray-700 ${
                index + 1 === currentPage ? "bg-blue-500" : "bg-gray-500"
              }`}
              onClick={() => setCurrentPage(index + 1)}
              // Show the page title on hover
              title={title}
            >
              {index + 1}
            </div>
          )
        );
      })}
      {/* Right arrow to shift the current page to the right */}
      <div
        className="cursor-pointer rounded-r bg-gray-500 py-2 px-4 font-bold text-white hover:bg-gray-700"
        onClick={() => shiftPage("right")}
        // Hide the right arrow if the current page is the last page
        style={{
          visibility: currentPage === pageTitles.length ? "hidden" : "visible",
        }}
      >
        {">"}
      </div>
    </div>
  );
};
export default Navigation;
