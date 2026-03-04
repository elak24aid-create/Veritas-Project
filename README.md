# Veritas: AI-Powered Fake News Detection System

Veritas is a professional web application designed to detect fake news using advanced Machine Learning and Natural Language Processing (NLP) techniques. It provides a modern, intuitive interface for users to verify the credibility of news articles through text analysis or URL submission.

## 🚀 Features

- **Real-time Detection**: Analyze news content instantly using a trained Machine Learning model.
- **URL Analysis**: Scrape and analyze content directly from news websites.
- **Credibility Meter**: Visual representation of news authenticity with truth probability scores.
- **Deep Insights**: Detailed breakdown of sentiment and linguistic features using Chart.js.
- **Authentication**: Secure JWT-based login and signup system for personal history tracking.
- **History Log**: Keep track of previously analyzed news items.
- **Modern UI/UX**: Sleek dark mode design with glassmorphism and smooth animations.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Vanilla CSS (Modern Grid/Flexbox), Framer Motion for animations
- **Icons**: Lucide React
- **Charts**: Chart.js & React-Chartjs-2
- **Routing**: React Router DOM

### Backend
- **Framework**: FastAPI (Python)
- **Security**: JWT Authentication (python-jose, passlib)
- **AI/ML**: Scikit-learn (TF-IDF + Passive Aggressive Classifier)
- **NLP**: NLTK, TextBlob
- **Data Handling**: Pandas, BeautifulSoup4 (Scraping)

## 📂 Project Structure

```text
pro1/
├── backend/            # FastAPI application
│   ├── main.py         # Entry point & API routes
│   ├── auth.py         # Authentication logic
│   ├── detector.py     # ML model inference logic
│   └── requirements.txt
├── frontend/           # React application
│   ├── src/            # Components, Pages, Assets
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── data/               # Datasets for training
└── models/             # Saved ML models (.pkl files)
```

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📝 License
This project is licensed under the MIT License.
