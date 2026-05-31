"use client";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 80 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="1.5" y="1.5" width="21" height="21" rx="7" stroke="currentColor" strokeWidth="3" />
      <path d="M9 7.5H15.5V10.5H12V12.5H15V15.5H12V18.5H9V7.5Z" fill="currentColor" />
      <path d="M29 7.5H33L37.5 15.5L42 7.5H46V18.5H43V12L39.2 18.5H35.8L32 12V18.5H29V7.5Z" fill="currentColor" />
      <path d="M49.5 7.5H60.5V10.1H52.5V11.9H59.5V14.3H52.5V15.9H60.8V18.5H49.5V7.5Z" fill="currentColor" />
    </svg>
  );
}

export default Logo;
