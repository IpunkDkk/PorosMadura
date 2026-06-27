import { redirect } from 'next/navigation'

export default async function AdminNotFound({
  params,
  searchParams,
}: {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}) {
  redirect('/cms')
}
