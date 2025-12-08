"use client";

interface Props {
  children: React.ReactNode;
}

export default function SectionWrapper({ children }: Props) {
  return (
    <div className="w-full px-4 py-12 sm:px-6 lg:px-8 max-w-screen-xl mx-auto">
      {children}
    </div>
  );
}