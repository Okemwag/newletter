import { AppLayout } from "@/components/layout/app-layout"
import { SubscriberTable } from "@/components/subscribers/subscriber-table"

export default function SubscribersPage() {
  return (
    <AppLayout>
      <div className="p-8 animate-fade-up">
        <SubscriberTable />
      </div>
    </AppLayout>
  )
}
