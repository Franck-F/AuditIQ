import Image from "next/image"

export function Clients() {
  const clients = [
    { name: "PyTorch", logo: "/logos/pytorch.png" },
    { name: "Plotly", logo: "/logos/plotly.png" },
    { name: "LlamaIndex", logo: "/logos/llamaindex.png" },
    { name: "Scikit-learn", logo: "/logos/scikit-learn.png" },
    { name: "Anthropic", logo: "/logos/anthropic.png" },
    { name: "Pandas", logo: "/logos/pandas.png" },
    { name: "Fairlearn", logo: "/logos/fairlearn.png" },
  ]

  const allLogos = [...clients, ...clients]

  return (
    <section className="border-y bg-muted/30 py-16 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Propulsé par les meilleures technologies IA
          </p>
        </div>
        <div className="relative">
          <div className="flex animate-scroll gap-8 items-center">
            {allLogos.map((client, index) => (
              <div
                key={`${client.name}-${index}`}
                className="flex h-20 w-40 flex-shrink-0 items-center justify-center rounded-lg transition-all hover:scale-105"
                title={client.name}
              >
                <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-white">
                  <Image
                    src={client.logo || "/placeholder.svg"}
                    alt={client.name}
                    width={120}
                    height={60}
                    className="max-h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
