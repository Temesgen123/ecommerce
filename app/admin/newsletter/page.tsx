import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { Users } from 'lucide-react';

export const metadata = { title: 'Newsletter Subscribers' };

export default async function NewsletterSubscribersPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { subscribedAt: 'desc' },
  });

  const activeCount = subscribers.filter((s) => s.active).length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Newsletter Subscribers</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold">{subscribers.length}</p>
          <p className="text-sm text-muted-foreground">Total</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{activeCount}</p>
          <p className="text-sm text-muted-foreground">Active</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-red-500">
            {subscribers.length - activeCount}
          </p>
          <p className="text-sm text-muted-foreground">Unsubscribed</p>
        </div>
      </div>

      {/* Table */}
      {subscribers.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No subscribers yet.
        </p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Subscribed</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub, i) => (
                <tr
                  key={sub.id}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-muted/30'}
                >
                  <td className="px-4 py-3">{sub.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {format(new Date(sub.subscribedAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    {sub.active ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Unsubscribed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
