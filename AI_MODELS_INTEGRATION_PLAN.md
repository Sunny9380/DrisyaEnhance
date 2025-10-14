# AI Models Integration Plan for Drisya
## Upgrading Image Processing with State-of-the-Art Models

---

## 🎯 Executive Summary

Current Drisya uses self-hosted Python (rembg + procedural effects). This plan outlines integration of **top Hugging Face models** to deliver **professional-grade** image enhancement, super-resolution, and advanced editing capabilities.

---

## 📊 Top Models Analysis

### 1. **Qwen-Image-Edit-2509** (Alibaba Cloud)
**Downloads:** 108k+ | **Parameters:** 20B | **License:** Apache 2.0

**Capabilities:**
- ✅ **Multi-image editing** (1-3 images: person+product, person+scene)
- ✅ **95% person consistency** (facial identity preservation)
- ✅ **Product poster generation** from plain backgrounds
- ✅ **Text rendering & editing** inside images
- ✅ **Precise background replacement** with context awareness
- ✅ **ControlNet support** (pose, depth, sketches)

**Perfect For Drisya:**
- E-commerce product shots (white background → lifestyle scenes)
- Brand integration (logos + products)
- Multiple product composition
- Custom text overlays on images

**Integration Options:**
1. **DashScope API** (Official Alibaba Cloud)
   - Cost: Pay-per-use (outputs expire in 24h)
   - Region: Singapore/Beijing endpoints
   - Speed: ~3-5s per image
   
2. **Replicate API**
   - Cost: ~$0.01-0.05 per image
   - No VRAM needed
   
3. **Local Deployment** (GGUF Quantized)
   - VRAM: 8GB (Q4_0) to 16GB (Q8_0)
   - Cost: Free (one-time setup)
   - Speed: 5-10s per image

**API Example:**
```python
import dashscope
from dashscope import MultiModalConversation

response = MultiModalConversation.call(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    model="qwen-image-edit-2509",
    messages=[{
        "role": "user",
        "content": [
            {"image": base64_image},
            {"text": "Place product on marble background with professional lighting"}
        ]
    }]
)
```

---

### 2. **FLUX.1-Kontext-dev** (Black Forest Labs)
**Downloads:** 332k+ | **Parameters:** 12B | **License:** Non-commercial (dev)

**Capabilities:**
- ✅ **Character consistency** across edits
- ✅ **Multi-turn iterative editing** (minimal drift)
- ✅ **Style transfer** (oil painting → sketch)
- ✅ **Typography editing** within images
- ✅ **Local & global edits** (targeted modifications)

**Perfect For Drisya:**
- Iterative refinement workflows
- Style variations for same product
- Brand consistency across campaigns

**Integration Options:**
1. **fal.ai API**
   - Cost: $0.025 per megapixel
   - Commercial license available (Pro/Max)
   - Speed: ~2-4s per image
   
2. **Replicate API**
   - Cost: ~$0.02 per image
   
3. **Local (ComfyUI)**
   - VRAM: 16GB+
   - TensorRT optimization available

**API Example:**
```python
from fal_client import FalClient

result = client.subscribe("fal-ai/flux-kontext/dev", {
    "prompt": "Change velvet background to marble while keeping product identical",
    "image_url": image_url
})
```

---

### 3. **AuraSR-v2** (fal.ai)
**Downloads:** 3.5k+ | **Parameters:** 600M | **License:** Apache 2.0

**Capabilities:**
- ✅ **4x super-resolution** (256px → 1024px)
- ✅ **Ultra-fast inference** (~0.25s per image)
- ✅ **GAN-based** (vs slow diffusion models)
- ✅ **Reduced seams** between tiles
- ✅ **AI-generated image enhancement**

**Perfect For Drisya:**
- Final upscaling step for downloads
- Enhance low-res product photos
- Quality boost for Ultra tier

**Integration:**
```python
from aura_sr import AuraSR

aura_sr = AuraSR.from_pretrained("fal/AuraSR-v2")
upscaled = aura_sr.upscale_4x_overlapped(image)  # Fast 4x upscale
```

**Local Deployment:**
- VRAM: 4GB+ (very lightweight)
- Speed: 0.25s per 1024px image
- Cost: Free

---

### 4. **IDM-VTON** (Virtual Try-On)
**Downloads:** 10.9k+ | **Niche Use Case**

**Capabilities:**
- Virtual clothing try-on for products
- Garment transfer to models
- Fashion e-commerce applications

**Perfect For Drisya:**
- Fashion/apparel clients
- Virtual model generation
- Catalog creation without photoshoots

---

## 💰 Cost Analysis

### Current System (Self-Hosted Python)
- **Cost:** $0 (infrastructure only)
- **Quality:** Basic background removal + procedural effects
- **Speed:** 5-8s per image
- **Limitations:** No advanced editing, limited backgrounds

### Proposed Hybrid System

| Tier | Model | Cost/Image | Quality | Use Case |
|------|-------|------------|---------|----------|
| **Free/Basic** | Self-hosted Python | $0 | Basic | Volume processing |
| **Standard** | Qwen-Edit (API) | $0.02-0.05 | Good | E-commerce |
| **High** | FLUX Kontext | $0.025/MP | Better | Professional |
| **Ultra** | Qwen + AuraSR | $0.05-0.08 | Best | Premium output |

**Revenue Model:**
- Free: 50 images/month (self-hosted)
- Basic: 200 images (mix self-hosted + API)
- Pro: 1000 images (primarily API models)
- Enterprise: Unlimited (API + local GPUs)

---

## 🚀 Integration Roadmap

### **Phase 1: API Integration (Week 1-2)**
1. Add API key management (DashScope, fal.ai, Replicate)
2. Create service wrappers for each model
3. Update template system with "AI Model" selector
4. Add quality tiers: Basic (self-hosted) → Ultra (Qwen+AuraSR)

### **Phase 2: Advanced Features (Week 3-4)**
1. Multi-image editing (person + product composition)
2. Text rendering on images (product labels, branding)
3. Style transfer templates (10+ artistic styles)
4. Iterative editing workflow (refine → save → refine)

### **Phase 3: Local GPU Deployment (Month 2)**
1. Deploy GGUF quantized models (Qwen Q4_0)
2. Set up ComfyUI for FLUX workflows
3. GPU instance provisioning (NVIDIA T4/A10)
4. Load balancing: API (fast) vs Local (cost-effective)

### **Phase 4: Enterprise Features (Month 3)**
1. Batch API processing (1000+ images)
2. Custom model fine-tuning (brand-specific)
3. White-label AI capabilities
4. API access for developers

---

## 🔧 Technical Implementation

### Database Schema Updates
```sql
-- Add AI model tracking
ALTER TABLE processing_jobs ADD COLUMN ai_model VARCHAR(50);
ALTER TABLE templates ADD COLUMN ai_model VARCHAR(50);
ALTER TABLE templates ADD COLUMN model_parameters JSONB;

-- Track API costs
ALTER TABLE transactions ADD COLUMN api_cost DECIMAL(10, 4);
```

### New API Routes
```typescript
// Select AI model for processing
POST /api/jobs/process-with-model
{
  imageIds: string[],
  templateId: string,
  aiModel: "qwen-2509" | "flux-kontext" | "aurasr" | "self-hosted",
  quality: "standard" | "high" | "ultra"
}

// Multi-image composition (Qwen)
POST /api/jobs/compose-images
{
  images: [productImage, backgroundImage, logoImage],
  prompt: "Place product on background with logo overlay",
  model: "qwen-2509"
}
```

### Processing Pipeline
```python
# New AI service wrapper
class AIModelService:
    def __init__(self):
        self.qwen = QwenImageEdit(api_key=DASHSCOPE_KEY)
        self.flux = FluxKontext(api_key=FAL_KEY)
        self.aura = AuraSR.from_pretrained("fal/AuraSR-v2")
    
    def process_image(self, image, template, quality):
        # Step 1: Background removal (self-hosted or API)
        if quality == "basic":
            result = self.remove_bg_local(image)
        else:
            result = self.qwen.edit(image, template.background_prompt)
        
        # Step 2: Style transfer (FLUX for high tier)
        if quality == "high":
            result = self.flux.edit(result, template.style_prompt)
        
        # Step 3: Super-resolution (AuraSR for ultra)
        if quality == "ultra":
            result = self.aura.upscale_4x_overlapped(result)
        
        return result
```

---

## 📈 Expected Improvements

| Metric | Current | With AI Models | Improvement |
|--------|---------|----------------|-------------|
| **Output Quality** | 6/10 | 9/10 | +50% |
| **Background Variety** | 5 types | Unlimited | ∞ |
| **Processing Speed** | 5-8s | 2-5s (API) | +40% |
| **Advanced Features** | Basic | Multi-image, text, styles | 10x |
| **Commercial Viability** | Limited | Enterprise-ready | ✅ |

---

## 🎯 Recommended Next Steps

1. **Immediate (This Week):**
   - Get API keys: DashScope (Qwen), fal.ai (FLUX/AuraSR)
   - Integrate Qwen-2509 for background replacement
   - Add AuraSR for 4x upscaling on Ultra tier

2. **Short-term (2-4 weeks):**
   - Add FLUX Kontext for iterative editing
   - Create 20+ new AI-powered templates
   - Update pricing to reflect API costs

3. **Long-term (2-3 months):**
   - Deploy local GPU instances (Qwen GGUF Q4_0)
   - Build multi-image composition feature
   - Custom model training for enterprise clients

---

## 💡 Business Impact

**Current Drisya = Good**
- Self-hosted processing
- Basic backgrounds
- Limited templates

**Drisya + AI Models = Exceptional**
- Professional-grade outputs
- Unlimited creative possibilities
- Compete with Canva, Adobe Express
- **10x revenue potential** with premium tiers

---

## 🔗 Quick Start Commands

```bash
# Install API clients
pip install dashscope aura-sr fal-client

# Set API keys
export DASHSCOPE_API_KEY="sk-xxx"
export FAL_KEY="xxx"
export REPLICATE_API_TOKEN="xxx"

# Test Qwen integration
python scripts/test_qwen_integration.py

# Test AuraSR upscaling
python scripts/test_aurasr.py
```

---

**Ready to transform Drisya from good → exceptional?** 🚀

Choose integration path:
- **Fast Track:** API-only (Week 1)
- **Balanced:** API + Local GPUs (Month 1-2)
- **Enterprise:** Full stack with custom models (Month 3)
