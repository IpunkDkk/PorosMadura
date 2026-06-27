import { redirect } from 'next/navigation'

export default async function AdminPageHandler({
  params,
  searchParams,
}: {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}) {
  redirect('/cms')
}
