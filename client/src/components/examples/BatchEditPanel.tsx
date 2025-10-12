import BatchEditPanel from '../BatchEditPanel'

export default function BatchEditPanelExample() {
  return (
    <div className="w-full max-w-md">
      <BatchEditPanel
        imageCount={247}
        onApply={(settings) => console.log('Apply settings:', settings)}
      />
    </div>
  )
}
