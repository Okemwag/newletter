import { AppLayout } from "@/components/layout/app-layout"
import { CampaignList } from "@/components/campaigns/campaign-list"

export default function CampaignsPage() {
  return (
    <AppLayout>
      <div className="p-8 animate-fade-up">
        <CampaignList />
      </div>
    </AppLayout>
  )
}
