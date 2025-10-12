import TemplateGallery from '../TemplateGallery'
import { useState } from 'react'

const mockTemplates = [
  { id: '1', name: 'Blue Gradient', category: 'Minimal' },
  { id: '2', name: 'White Studio', category: 'Studio' },
  { id: '3', name: 'Wooden Table', category: 'Natural' },
  { id: '4', name: 'Pink Pastel', category: 'Colorful' },
  { id: '5', name: 'Black Premium', category: 'Elegant' },
  { id: '6', name: 'Gray Concrete', category: 'Industrial' },
  { id: '7', name: 'Green Nature', category: 'Natural' },
  { id: '8', name: 'Purple Vibrant', category: 'Colorful' },
]

export default function TemplateGalleryExample() {
  const [selected, setSelected] = useState<string>()
  
  return (
    <div className="w-full">
      <TemplateGallery
        templates={mockTemplates}
        selectedTemplateId={selected}
        onTemplateSelect={setSelected}
      />
    </div>
  )
}
