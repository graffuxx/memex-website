export default function Page() {
  const socials = [
    {
      name: "Telegram",
      href: "https://t.me/memexduelverse",
      color: "bg-[#0088cc]",
      icon: "/icons/telegram.svg",
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/memex.duelverse",
      color: "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500",
      icon: "/icons/instagram.svg",
    },
    {
      name: "X (Twitter)",
      href: "https://x.com/memex_duelverse",
      color: "bg-[#4B5563]",
      icon: "/icons/x.svg",
    },
    {
      name: "Discord",
      href: "https://discord.gg/GQhYFQmx",
      color: "bg-[#5865F2]",
      icon: "/icons/discord.svg",
    },
    {
      name: "YouTube",
      href: "https://youtube.com/@memexduelverse",
      color: "bg-[#FF0000]",
      icon: "/icons/youtube.svg",
    },
  ];

  return (
    <main className="max-w-3xl mx-auto py-10 px-4 text-center">
      <h1 className="text-4xl font-bold mb-6">Follow MemeX – Stay Connected</h1>
      <p className="text-lg text-gray-300 mb-10">Join our community across all platforms.</p>

      <div className="space-y-6">
        {socials.map(({ name, href, color, icon }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${color} rounded-xl flex items-center p-4 gap-4 text-white transition hover:scale-[1.02]`}
          >
            <img src={icon} alt={name} className="h-10 w-10" />
            <span className="text-xl font-semibold">{name}</span>
          </a>
        ))}
      </div>
    </main>
  );
}