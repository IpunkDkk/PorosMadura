interface BreakingNewsProps {
  title: string
  slug: string
  category?: string
}

export function BreakingNews({ title, slug, category }: BreakingNewsProps) {
  if (!title) return null

  return (
    <div className="bg-poros-red text-white text-sm py-2">
      <div className="container mx-auto px-4 lg:px-8 flex items-center">
        <span className="font-bold uppercase tracking-wider mr-4 whitespace-nowrap bg-white text-poros-red px-2 py-0.5 rounded text-xs animate-pulse">
          Breaking News
        </span>
        <a
          href={`/${category}/${slug}`}
          className="truncate hover:underline cursor-pointer font-medium"
        >
          {title}
        </a>
      </div>
    </div>
  )
}
