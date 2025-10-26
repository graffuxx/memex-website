export default function CardPreview() {
  return (
    <section className="glow-box text-center space-y-6">
      <h2 className="text-3xl font-bold text-memex-primary">Card Preview</h2>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 h-[200px] rounded-xl flex items-center justify-center text-white/60 italic">
            [ Card {i} Placeholder ]
          </div>
        ))}
      </div>
    </section>
  )
}