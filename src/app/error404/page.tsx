import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-6">
      <h1 className="text-6xl font-bold mb-4 text-red-500">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
      <p className="text-lg mb-8 text-center max-w-xl">
        Oops! The page you’re looking for doesn’t exist. It may have been moved or removed.
      </p>
      <Link
        href="/"
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded transition-colors"
      >
        Return to Homepage
      </Link>
    </main>
  );
}