export default function PresaleOverview() {
  return (
    <section className="glow-box space-y-4">
      <h2 className="text-3xl font-bold text-memex-primary text-center">Presale Levels</h2>
      <div className="space-y-2">
        {[1, 2, 3].map((level) => (
          <div key={level} className="bg-white/5 rounded-lg p-4 flex justify-between items-center">
            <span>Level {level}</span>
            <span className="text-sm text-white/70">[ Progress Placeholder ]</span>
          </div>
        ))}
        <p className="text-center text-white/60 text-sm italic">10 Levels planned – placeholder only</p>
      </div>
    </section>
  )
}