# TCGGrader

AI-powered trading card grading and appraisal system with professional-grade accuracy.

TCGGrader revolutionizes trading card evaluation by combining advanced computer vision with market data analysis. Upload images of your trading cards and receive instant, AI-powered grading with estimated market values based on real-time pricing data.

## Features

### AI-Powered Grading
- Multi-angle Analysis: Upload front, back, and corner images for comprehensive evaluation
- Component Scoring: Individual grades for centering, edges, corners, and surface condition
- Overall Grade: Professional-standard final grade calculation
- Confidence Metrics: Uncertainty quantification for prediction reliability

### Market Valuation
- Real-time Pricing: Live market data from PriceCharting.com
- Grade-adjusted Values: Pricing estimates based on predicted condition
- Historical Trends: Price movement analysis and insights

### Performance Optimized
- Lightweight Models: MobileNetV2 architecture for fast inference
- Memory Efficient: Lazy-loading models with optimized resource usage
- Scalable Deployment: Ready for cloud platforms like Render and Vercel

### Advanced Recognition
- CLIP Embeddings: State-of-the-art card identification technology
- Multi-set Support: Recognition across various trading card games and sets
- High Accuracy: Professional-grade prediction confidence

## Architecture

```
TCGGrader/
├── backend/                    # FastAPI Backend Service
│   ├── app/
│   │   ├── main.py            # Application entry point
│   │   ├── models/            # PyTorch grading models
│   │   ├── services/          # Business logic services
│   │   ├── utils/             # Helper functions
│   │   └── config.py          # Configuration settings
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile            # Container configuration
├── lovable-card-grader/       # React Frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Application pages
│   │   ├── utils/            # Frontend utilities
│   │   └── styles/           # CSS/styling files
│   ├── package.json          # Node.js dependencies
│   └── next.config.js        # Next.js configuration
├── docs/                     # Documentation
├── tests/                    # Test suites
└── docker-compose.yml        # Multi-container setup
```

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- pip and npm

### Backend Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/TCGGrader.git
   cd TCGGrader/backend
   ```

2. Create virtual environment
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

4. Start the server
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at `http://localhost:8000`
   Interactive docs: `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to frontend directory
   ```bash
   cd ../lovable-card-grader
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start development server
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

### Docker Setup

```bash
# Run the entire stack
docker-compose up --build

# Backend only
docker-compose up backend

# Frontend only  
docker-compose up frontend
```

## Usage

### Web Interface

1. Upload Images: Drag and drop or select card images (front/back/corners)
2. Processing: AI models analyze image quality and card condition
3. Results: View detailed grading breakdown and market valuation
4. Export: Save or share grading reports

### API Usage

```python
import requests

# Upload card image for grading
files = {'image': open('card_front.jpg', 'rb')}
response = requests.post('http://localhost:8000/grade', files=files)
result = response.json()

print(f"Overall Grade: {result['overall_grade']}")
print(f"Estimated Value: ${result['estimated_value']}")
```

### API Endpoints

- `POST /grade` - Grade a single card image
- `POST /grade/batch` - Grade multiple images
- `GET /cards/{card_id}` - Retrieve card information
- `GET /health` - Service health check

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=false

# Model Settings
MODEL_PATH=./models/
CONFIDENCE_THRESHOLD=0.7
BATCH_SIZE=1

# External Services
PRICECHARTING_API_KEY=your_api_key_here
REDIS_URL=redis://localhost:6379

# Database
DATABASE_URL=postgresql://user:pass@localhost/tcggrader
```

### Model Configuration

Customize grading parameters in `backend/app/config.py`:

```python
GRADING_WEIGHTS = {
    'centering': 0.25,
    'corners': 0.25,
    'edges': 0.25,
    'surface': 0.25
}

GRADE_THRESHOLDS = {
    'mint': 9.5,
    'near_mint': 8.5,
    'excellent': 7.0,
    'good': 5.0
}
```

## Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v --cov=app
```

### Frontend Tests
```bash
cd lovable-card-grader
npm test
```

### Integration Tests
```bash
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## Deployment

### Backend (Render)

1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy with automatic builds on push

### Frontend (Vercel)

1. Connect repository to Vercel
2. Configure build settings:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "installCommand": "npm install"
   }
   ```

### Full Stack (Docker)

```bash
# Production build
docker-compose -f docker-compose.prod.yml up -d
```

## Technology Stack

### Backend
- FastAPI - Modern, fast web framework
- PyTorch - Deep learning framework
- CLIP - OpenAI's vision-language model
- MobileNetV2 - Efficient CNN architecture
- PostgreSQL - Primary database
- Redis - Caching and session storage

### Frontend
- React - User interface library
- Next.js - Full-stack React framework
- TypeScript - Type-safe JavaScript
- Tailwind CSS - Utility-first CSS framework
- Axios - HTTP client

### DevOps
- Docker - Containerization
- GitHub Actions - CI/CD pipeline
- Render - Backend hosting
- Vercel - Frontend hosting

## Model Performance

Classification Report:
              precision    recall  f1-score   support

     grade_1       0.85      0.91      0.88       108
    grade_10       0.82      0.86      0.84       112
     grade_2       0.89      0.88      0.88       152
     grade_3       0.92      0.96      0.94       123
     grade_4       0.82      0.82      0.82       119
     grade_5       0.79      0.72      0.75       118
     grade_6       0.70      0.67      0.68       137
     grade_7       0.71      0.65      0.68       142
     grade_8       0.68      0.75      0.71       140
     grade_9       0.61      0.60      0.61       127

    accuracy                           0.78      1278
   macro avg       0.78      0.78      0.78      1278
weighted avg       0.78      0.78      0.78      1278

## Contributing

We welcome contributions! Please see our Contributing Guidelines for details.

## Roadmap

### Version 2.0
- Mobile app (React Native)
- Advanced authentication system
- Bulk grading capabilities
- Integration with major marketplaces

### Version 2.1
- Video-based grading
- AR card scanning
- Social features and sharing
- Advanced analytics dashboard

### Version 3.0
- Multi-language support
- Blockchain integration for authenticity
- Professional grading service partnerships
- Advanced market analysis tools