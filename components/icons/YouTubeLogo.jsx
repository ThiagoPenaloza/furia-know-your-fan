import * as React from "react";

export default function YouTubeLogo({ size = 60, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M23.498 6.186a2.994 2.994 0 0 0-2.109-2.121C19.37 3.5 12 3.5 12 3.5s-7.37 0-9.389.565A2.994 2.994 0 0 0 .502 6.186 31.41 31.41 0 0 0 0 11.999a31.41 31.41 0 0 0 .502 5.814 2.994 2.994 0 0 0 2.109 2.121C4.63 20.5 12 20.5 12 20.5s7.37 0 9.389-.565a2.994 2.994 0 0 0 2.109-2.121A31.41 31.41 0 0 0 24 12a31.41 31.41 0 0 0-.502-5.814ZM9.75 15.569V8.431L15.818 12 9.75 15.569Z" />
    </svg>
  );
}
