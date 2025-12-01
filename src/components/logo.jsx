// HimelsLibraryLogoEmblem.jsx
import React from "react";

const HimelsLibraryLogoEmblem = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 200"
    role="img"
    aria-label="Himel's Library logo"
    {...props}
  >
    <g transform="translate(100, 90)" textAnchor="middle">
      {/* Base stairs */}
      <rect
        x="-60"
        y="0"
        width="120"
        height="5"
        className="fill-blue-500 dark:fill-blue-400"
      />
      <rect
        x="-50"
        y="-5"
        width="100"
        height="5"
        className="fill-blue-400 dark:fill-blue-300"
      />

      {/* Book Columns */}
      <rect
        x="-45"
        y="-55"
        width="15"
        height="50"
        rx="2"
        className="fill-blue-400 dark:fill-blue-300 stroke-white dark:stroke-gray-400 stroke-[1]"
      />
      <rect
        x="-20"
        y="-55"
        width="15"
        height="50"
        rx="2"
        className="fill-blue-400 dark:fill-blue-300 stroke-white dark:stroke-gray-400 stroke-[1]"
      />
      <rect
        x="5"
        y="-55"
        width="15"
        height="50"
        rx="2"
        className="fill-blue-400 dark:fill-blue-300 stroke-white dark:stroke-gray-400 stroke-[1]"
      />
      <rect
        x="30"
        y="-55"
        width="15"
        height="50"
        rx="2"
        className="fill-blue-400 dark:fill-blue-300 stroke-white dark:stroke-gray-400 stroke-[1]"
      />

      {/* Roof Pediment */}
      <path
        d="M -55 -55 L 0 -90 L 55 -55 Z"
        className="fill-blue-400 dark:fill-blue-400"
      />
      <path
        d="M -45 -58 L 0 -85 L 45 -58 Z"
        className="fill-transparent dark:fill-transparent"
        opacity="0.9"
      />

      {/* The 'H' in the roof */}
      <text
        x="0"
        y="-63"
        fontSize="18"
        className="font-bold font-serif fill-blue-800 dark:fill-gray-200"
      >
        H
      </text>

      {/* Text below */}
      <text
        y="35"
        fontSize="22"
        className="font-serif font-bold fill-gray-800 dark:fill-gray-200"
        letterSpacing="0.5"
      >
        HIMEL'S
      </text>
      <text
        y="58"
        fontSize="16"
        className="font-sans font-medium fill-gray-600 dark:fill-gray-400"
        letterSpacing="2"
      >
        LIBRARY
      </text>
    </g>
  </svg>
);

export default HimelsLibraryLogoEmblem;
