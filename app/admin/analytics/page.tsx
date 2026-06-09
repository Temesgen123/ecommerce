import { getAnalyticsData } from '@/lib/analytics';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Analytics' };

interface Props {
  searchParams: Promise<{ days?: string }>;
}

export default async function AdminAnalyticsPage({ searchParams }: Props) {
  const { days } = await searchParams;
  const daysNum = [7, 30, 90].includes(Number(days)) ? Number(days) : 30;
  const data = await getAnalyticsData(daysNum);
  return <AnalyticsDashboard data={data} />;
}
