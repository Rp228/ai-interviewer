# AI Interview Chatbot

This project is an AI-powered technical interview chatbot designed to help users practice their technical interview skills. It provides a conversational interface where an AI acts as an interviewer, asking questions on a given topic, evaluating answers, and providing feedback.

## Features

* Interactive chat interface for a seamless interview experience.
* AI-generated technical questions based on a specified topic.
* Real-time evaluation and feedback on user answers.
* Tracks interview progress and provides a final score summary.
* Supports local Large Language Models (LLMs) via Ollama for privacy and offline capabilities.

## Technologies Used

### Frontend (React)

* **React:** A JavaScript library for building user interfaces.
* **CSS:** For styling components.

### Backend (FastAPI & LangChain)

* **FastAPI:** A modern, fast (high-performance) web framework for building APIs with Python 3.7+.
* **LangChain:** A framework for developing applications powered by language models.
* **Ollama:** A tool to run large language models locally.
* **Pydantic:** Used by FastAPI for data validation.
* **Uvicorn:** An ASGI server for running FastAPI applications.

## Setup Instructions

### 1. Prerequisites

Before you begin, ensure you have the following installed:

* **Node.js & npm/yarn:** For the React frontend.
    * [Download Node.js](https://nodejs.org/en/download/) (includes npm)
* **Python 3.9+:** For the FastAPI backend.
    * [Download Python](https://www.python.org/downloads/)
* **Ollama:** To run the local LLM (`gemma:2b`).
    * [Download Ollama](https://ollama.com/download)
    * After installing Ollama, open your terminal and run:
        ```bash
        ollama run gemma:2b
        ```
        This will download and run the `gemma:2b` model, making it available for your backend. You can then close this terminal, as Ollama runs as a background service.

### 2. Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <your-repo-name>
    ```
    (Assuming your backend code is in a `backend` directory)
    ```bash
    cd backend
    ```

2.  **Create a virtual environment (recommended):**
    ```bash
    python -m venv venv
    ```

3.  **Activate the virtual environment:**
    * **macOS/Linux:**
        ```bash
        source venv/bin/activate
        ```
    * **Windows:**
        ```bash
        .\venv\Scripts\activate
        ```

4.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

5.  **Run the backend server:**
    ```bash
    uvicorn main:app --reload
    ```
    The backend will typically run on `http://127.0.0.1:8000`.

### 3. Frontend Setup

1.  **Navigate to the frontend directory:**
    (Assuming your frontend code is in a `frontend` directory, or if it's at the root level alongside `backend`)
    ```bash
    cd ../frontend # If you are in the backend directory
    # OR
    # cd . # If your frontend files are in the root directory
    ```

2.  **Install dependencies:**
    ```bash
    npm install # or yarn install
    ```

3.  **Start the React development server:**
    ```bash
    npm start # or yarn start
    ```
    This will usually open your application in your browser at `http://localhost:3000`.

### 4. Integration Steps (Manual adjustments needed based on provided code)

The provided React frontend currently has a mocked bot response in `ChatWindow.js`. To connect it to your FastAPI backend, you'll need to modify `ChatWindow.js`:

1.  **Install `axios` (or use `fetch`):**
    ```bash
    npm install axios uuid
    ```
2.  **Modify `ChatWindow.js`'s `handleSend` function:**

    ```javascript
    import { useState, useEffect, useRef } from "react"; // Add useRef
    import MessageBubble from "./MessageBubble";
    import ChatInput from "./ChatInput";
    import "./ChatWindow.css";
    import axios from "axios"; // Import axios
    import { v4 as uuidv4 } from 'uuid'; // For generating session IDs

    function ChatWindow() {
      const [messages, setMessages] = useState([
        { sender: "bot", message: "👋 Hi, I'm your AI Interviewer. Please provide a topic to start!" }
      ]);
      const [sessionId, setSessionId] = useState(null);
      const [isInterviewActive, setIsInterviewActive] = useState(false);
      const [currentQuestion, setCurrentQuestion] = useState("");
      const chatMessagesRef = useRef(null); // Ref for scrolling

      // Scroll to bottom on new message
      useEffect(() => {
        if (chatMessagesRef.current) {
          chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
      }, [messages]);


      // Effect to start interview or handle initial state
      useEffect(() => {
        // If no session ID, generate one and prompt for topic
        if (!sessionId) {
          setSessionId(uuidv4());
        }
      }, [sessionId]);


      const handleSend = async (text) => {
        if (!text.trim()) return;

        setMessages((prev) => [...prev, { sender: "user", message: text }]);

        if (!isInterviewActive) {
          // This is the first message, assume it's the topic
          try {
            const response = await axios.post("[http://127.0.0.1:8000/start](http://127.0.0.1:8000/start)", {
              session_id: sessionId,
              topic: text
            });
            const { question, error } = response.data;

            if (error) {
              setMessages((prev) => [...prev, { sender: "bot", message: `Error starting interview: ${error}` }]);
            } else {
              setCurrentQuestion(question);
              setIsInterviewActive(true);
              setMessages((prev) => [...prev, { sender: "bot", message: question }]);
            }
          } catch (error) {
            setMessages((prev) => [...prev, { sender: "bot", message: `Network error: ${error.message}` }]);
          }
        } else {
          // Subsequent messages are answers
          try {
            const response = await axios.post("[http://127.0.0.1:8000/answer](http://127.0.0.1:8000/answer)", {
              session_id: sessionId,
              answer: text
            });
            const { feedback, next_question, summary, error } = response.data;

            if (error) {
              setMessages((prev) => [...prev, { sender: "bot", message: `Error processing answer: ${error}` }]);
            } else {
              if (summary) {
                // Interview finished
                setMessages((prev) => [...prev, { sender: "bot", message: feedback }]);
                setMessages((prev) => [...prev, { sender: "bot", message: summary }]);
                setIsInterviewActive(false); // End the interview state
              } else {
                // Continue interview
                setMessages((prev) => [...prev, { sender: "bot", message: feedback }]);
                setMessages((prev) => [...prev, { sender: "bot", message: next_question }]);
                setCurrentQuestion(next_question);
              }
            }
          } catch (error) {
            setMessages((prev) => [...prev, { sender: "bot", message: `Network error: ${error.message}` }]);
          }
        }
      };

      return (
        <div className="chat-window">
          <div className="chat-messages" ref={chatMessagesRef}> {/* Attach ref here */}
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} sender={msg.sender} message={msg.message} />
            ))}
          </div>
          <ChatInput onSend={handleSend} />
        </div>
      );
    }

    export default ChatWindow;
    ```
    **Explanation of Changes:**
    * **`sessionId` State:** A new state `sessionId` is added to uniquely identify each interview session on the backend. We'll use `uuid` to generate it.
    * **`isInterviewActive` State:** Tracks whether an interview has started (i.e., if a topic has been sent and the first question received).
    * **`currentQuestion` State:** Stores the last question asked by the bot, which is needed when sending the answer to the backend.
    * **Initial Bot Message:** Changed to prompt the user to provide a topic.
    * **`useEffect` for `sessionId`:** Generates a new `sessionId` when the component mounts if one doesn't exist.
    * **Conditional `handleSend` Logic:**
        * If `!isInterviewActive`, the user's input is treated as the `topic` and a POST request is made to `/start`.
        * If `isInterviewActive`, the user's input is treated as an `answer` and a POST request is made to `/answer`.
    * **API Calls (`axios.post`):** Sends data to your backend endpoints.
    * **Error Handling:** Basic `try...catch` blocks are included for network errors.
    * **Response Handling:** Parses the `response.data` from the backend and updates the `messages` state accordingly, including `feedback`, `next_question`, or a `summary` if the interview concludes.
    * **`useRef` for Scrolling:** Added `useRef` and `useEffect` to automatically scroll the chat messages to the bottom when new messages appear.
    * **Install `uuid`:** `npm install uuid`.

## Design Decisions & Branching Flow

### Frontend Design Decisions:

* **Component-Based Architecture:** The project utilizes React's component-based structure (`ChatWindow`, `ChatInput`, `MessageBubble`) for modularity, reusability, and maintainability.
* **State Management:** `useState` hook is used for local component state management (e.g., messages, input value). For a larger application, context API or Redux could be considered, but for this scope, `useState` is sufficient.
* **Styling:** Pure CSS modules are used for styling, keeping styles encapsulated within their respective components. Tailwind CSS or styled-components could be alternatives for more scalable styling.
* **User Experience (UX):**
    * Clear separation of user and bot messages.
    * Automatic scrolling to the latest message enhances usability.
    * Immediate display of user's message before bot's response for better perceived responsiveness.

### Backend Design Decisions:

* **FastAPI for API:** Chosen for its speed, automatic data validation (via Pydantic), and clear documentation generation.
* **LangChain for LLM Integration:** Provides an abstraction layer for interacting with LLMs, making it easier to switch models or add more complex LLM functionalities (like chaining prompts).
* **In-Memory Session Store:** For simplicity in this project, `sessions` are stored in a Python dictionary. For production, a database (e.g., Redis, PostgreSQL) would be necessary for persistence and scalability.
* **Prompt Engineering:** Separate `prompts.py` file to keep LLM prompts organized and easily modifiable. This is crucial for guiding the LLM's behavior.
* **Clear API Endpoints:**
    * `/start`: Dedicated for initiating a new interview session.
    * `/answer`: Handles the submission of user answers and drives the interview progression (feedback, next question, or summary).
* **CORS Configuration:** Enabled wide-open CORS (`allow_origins=["*"]`) for easy development, but this should be restricted in a production environment for security.
* **Session Management:** Each interview gets a `session_id`, allowing multiple concurrent interviews. The backend maintains the state of each interview (topic, history, score).
* **Fixed Interview Length:** The interview is hardcoded to 5 questions for simplicity. This could be made configurable.
* **Score Extraction:** Regular expressions are used to extract a numerical score from the LLM's free-form feedback, demonstrating a practical way to parse structured information from free-form text.

### Branching Flow (Interview Logic)

1.  **Initialization:**
    * Frontend loads, `ChatWindow` initializes with a "Hi, provide a topic" message.
    * A unique `sessionId` is generated on the frontend.
2.  **Start Interview:**
    * User types a `topic` (e.g., "Python programming") and sends it.
    * Frontend sends a POST request to `/start` with `sessionId` and `topic`.
    * Backend receives the request:
        * Uses `question_chain` to generate the *first question* based on the `topic`.
        * Stores the session data in `sessions` dictionary.
        * Returns the first question to the frontend.
    * Frontend receives the question and displays it. `isInterviewActive` becomes `true`.
3.  **Answer & Continue:**
    * User types an `answer` to the current question and sends it.
    * Frontend sends a POST request to `/answer` with `sessionId` and `answer`.
    * Backend receives the request:
        * Retrieves the session data.
        * Uses `evaluation_chain` to evaluate the `answer` against the `question`, generating `feedback` and a `score`.
        * Updates the session's `history` and `total_score`.
        * **Check Question Count:**
            * If `session["count"]` is less than 5:
                * Uses `question_chain` again (with the original `topic`) to generate a `next_question`.
                * Updates the `session["question"]` with the new question.
                * Returns `feedback` and `next_question` to the frontend.
            * If `session["count"]` is 5 or more:
                * Calculates the `final_score`.
                * Generates a `summary` message.
                * Returns `feedback` and `summary` to the frontend.
    * Frontend receives the response:
        * Displays the `feedback`.
        * If `next_question` is present, it displays the `next_question`.
        * If `summary` is present, it displays the `summary` and marks the interview as finished.
4.  **Interview End:**
    * When the summary is received, the frontend stops sending answers to `/answer` for that session (or could initiate a new `/start` if the user wants to restart).

## Optional Features Implemented

* **Local LLM Integration (Ollama):** The project is configured to use a locally run LLM (`gemma:2b`), providing benefits like privacy, lower latency (compared to cloud APIs), and offline capability.
* **Basic Session Management:** Supports multiple concurrent interview sessions using unique `session_id`s, allowing different users (or the same user in different tabs) to conduct interviews independently.
* **Interview Progression Tracking:** The backend keeps track of the number of questions asked and the cumulative score for each session.
* **Automated Scoring:** Attempts to extract a numerical score from the LLM's free-form feedback, which is a common challenge when working with generative models.
* **Clear Interview Termination:** Explicitly ends the interview after a fixed number of questions and provides a final summary.
* **Frontend Auto-Scrolling:** Improves user experience by automatically scrolling the chat to the latest message.