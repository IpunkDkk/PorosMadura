'use client'

import { useEffect, useMemo, useState } from 'react'

type TagOption = {
  id: number
  name: string
}

type AddTagEvent = CustomEvent<{ tag?: TagOption }>
type SetSelectedTagsEvent = CustomEvent<{ ids?: Array<number | string> }>

export function TagCheckboxList({
  tags,
  selectedTagIds,
}: {
  tags: TagOption[]
  selectedTagIds: number[]
}) {
  const [items, setItems] = useState(tags)
  const [selectedIds, setSelectedIds] = useState(() => new Set(selectedTagIds.map(String)))

  const sortedItems = useMemo(() => {
    return [...items].sort((left, right) => left.name.localeCompare(right.name, 'id'))
  }, [items])

  useEffect(() => {
    function addTag(event: Event) {
      const tag = (event as AddTagEvent).detail?.tag
      if (!tag?.id || !tag.name) return

      setItems((current) => {
        if (current.some((item) => item.id === tag.id)) return current
        return [...current, tag]
      })
      setSelectedIds((current) => new Set([...current, String(tag.id)]))
    }

    function setSelectedTags(event: Event) {
      const ids = (event as SetSelectedTagsEvent).detail?.ids || []
      setSelectedIds(new Set(ids.map(String)))
    }

    window.addEventListener('cms:add-tag-option', addTag)
    window.addEventListener('cms:set-selected-tags', setSelectedTags)
    return () => {
      window.removeEventListener('cms:add-tag-option', addTag)
      window.removeEventListener('cms:set-selected-tags', setSelectedTags)
    }
  }, [])

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">Tags</p>
      {sortedItems.map((tag) => {
        const id = String(tag.id)
        return (
          <label key={tag.id} className="flex items-center gap-2 text-sm">
            <input
              name="tagIds"
              value={tag.id}
              type="checkbox"
              checked={selectedIds.has(id)}
              onChange={(event) => {
                setSelectedIds((current) => {
                  const next = new Set(current)
                  if (event.target.checked) next.add(id)
                  else next.delete(id)
                  return next
                })
              }}
              className="h-4 w-4"
            />
            {tag.name}
          </label>
        )
      })}
      {!sortedItems.length && (
        <p className="text-xs text-text-secondary">Belum ada tag.</p>
      )}
    </div>
  )
}
