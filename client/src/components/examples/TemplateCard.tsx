import TemplateCard from '../TemplateCard'
import { useState } from 'react'

export default function TemplateCardExample() {
  const [selected, setSelected] = useState(false)
  
  return (
    <div className="w-64">
      <TemplateCard
        id="1"
        name="Blue Gradient"
        category="Minimal"
        isSelected={selected}
        onClick={() => setSelected(!selected)}
      />
    </div>
  )
}
