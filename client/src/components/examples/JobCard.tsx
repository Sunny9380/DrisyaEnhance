import JobCard from '../JobCard'

export default function JobCardExample() {
  return (
    <div className="w-full max-w-xl space-y-4">
      <JobCard
        id="1"
        templateName="Blue Gradient Background"
        imageCount={1247}
        status="processing"
        progress={67}
        timestamp="2 hours ago"
      />
      <JobCard
        id="2"
        templateName="White Minimal"
        imageCount={523}
        status="completed"
        timestamp="Yesterday"
        onView={() => console.log('View clicked')}
        onDownload={() => console.log('Download clicked')}
      />
    </div>
  )
}
