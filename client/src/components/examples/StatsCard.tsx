import StatsCard from '../StatsCard'
import { Image } from 'lucide-react'

export default function StatsCardExample() {
  return (
    <div className="w-80">
      <StatsCard
        icon={Image}
        label="Total Processed"
        value="12,453"
        trend="+18% from last month"
      />
    </div>
  )
}
