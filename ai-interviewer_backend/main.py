from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from chain import question_chain, evaluation_chain
import re

app = FastAPI()

# Allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store
sessions = {}

# Request models
class StartRequest(BaseModel):
    session_id: str
    topic: str

class AnswerRequest(BaseModel):
    session_id: str
    answer: str

# Start interview route
@app.post("/start")
async def start_interview(req: StartRequest):
    session_id = req.session_id
    topic = req.topic

    try:
        print(f"🟢 Generating first question for topic: {topic}")
        question = question_chain.run(topic=topic)
    except Exception as e:
        print("❌ Error while generating question:", str(e))
        return {"error": str(e)}

    sessions[session_id] = {
        "topic": topic,
        "question": question,
        "history": [],
        "score": 0,
        "count": 1,
    }

    return {"question": question}

# Answer submission route
@app.post("/answer")
async def submit_answer(req: AnswerRequest):
    session_id = req.session_id
    answer = req.answer

    session = sessions.get(session_id)
    if not session:
        return {"error": "Session not found"}

    question = session["question"]

    try:
        feedback = evaluation_chain.run(question=question, answer=answer)

        # Extract numeric score (e.g., 7/10) from feedback
        score_match = re.search(r"(\d+(?:\.\d+)?)\s*/\s*10", feedback)
        score = float(score_match.group(1)) if score_match else 0

        session["history"].append({
            "question": question,
            "answer": answer,
            "feedback": feedback,
            "score": score,
        })

        session["score"] += score
        session["count"] += 1

        # Stop after 5 questions
        if session["count"] > 5:
            total_score = session["score"]
            summary = f"✅ Interview complete! You answered 5 questions.\n\n🏆 Final Score: {total_score}/50\n\nThanks for participating!"
            return {
                "feedback": feedback,
                "summary": summary,
            }

        # Otherwise, generate next question
        new_question = question_chain.run(topic=session["topic"])
        session["question"] = new_question

        return {
            "feedback": feedback,
            "next_question": new_question,
        }

    except Exception as e:
        print("❌ Error during answer evaluation or question generation:", str(e))
        return {"error": str(e)}
