# RecoveryRoad 🏥

<div align="center">

**From Discharge to Fully Charged.** An AI-powered assistant that turns confusing hospital discharge papers into a clear, interactive 30-day recovery timeline.

</div>

## 🚨 The Problem
Patients leave the hospital with stacks of paper instructions written in medical jargon. 
- **Confusion:** "Do I take this pill before or after lunch?"
- **Anxiety:** "Is this pain normal?"
- **Non-compliance:** 40% of patients misunderstand their discharge instructions, leading to preventable readmissions.

## 💡 The Solution: RecoveryRoad
RecoveryRoad is a mobile-first web app that users can scan their discharge summary with. We use a **Retrieval-Augmented Generation (RAG)** pipeline to:
1.  **Digitize** the document.
2.  **Extract** critical dates, medications, and warnings.
3.  **Generate** a gamified, interactive 30-day checklist.
4.  **Create** an instant Emergency Medical ID.

## ✨ Key Features

### 📅 Smart Recovery Timeline
- **Progressive Disclosure:** We don't overwhelm the user. We show detailed tasks for Days 1-14 and group long-term maintenance (Days 15-30) into summary cards.
- **Auto-Unrolling:** If a doc says "Take Amoxicillin for 5 days," our AI automatically generates 5 distinct daily tasks.
- **Gamification:** Users check off pills and tasks. Completing a day triggers a confetti celebration! 🎉

### 🤖 Context-Aware RAG Chatbot
- Unlike generic chatbots, RecoveryRoad answers questions **only** using the context of the uploaded PDF/Image.
- Prevents hallucination by strictly adhering to the provided medical source truth.

### 🪪 Emergency Medical ID (Passport)
- Automatically extracts active medications and "Red Flag" warnings.
- Creates a high-contrast, easy-to-read digital card for emergency responders.

### 🔒 Security-First Architecture
- **Proxy Pattern:** API keys are hidden on the server side. The frontend never sees the OpenAI/Gemini credentials.
- **Data Privacy:** Documents are processed in-memory for the duration of the session.


## 🛠️ Tech Stack

* **Frontend:** React.js, Tailwind CSS, Lucide Icons
* **Backend:** Node.js, Express (Proxy Server)
* **AI Model:** Google Gemini 1.5 Flash (via API)
* **Architecture:** Client-Server Proxy for Security

## 🚀 Getting Started

To run this project locally, you need to start both the Backend (Proxy) and the Frontend.

### Prerequisites
* Node.js (v16 or higher)
* A Google Gemini API Key

### 1. Clone the Repository
git clone [https://github.com/Sassy2575/recovery-road.git](https://github.com/yourusername/recovery-road.git)

cd recovery-road

### 2. Configure Security (.env)
Create a .env file in the root directory. Do not share this file.
 
Server Configuration

PORT=3001

 AI Credentials
 
GEMINI_API_KEY=your_actual_api_key_here

### 3. Install Dependencies
npm install

### 4. Run the Application
You need two terminals open:

Terminal 1 (Backend Server):

node server.js

 Output: RAG Proxy server running on port 3001

Terminal 2 (React Frontend):

npm start

Opens the app at http://localhost:3000
