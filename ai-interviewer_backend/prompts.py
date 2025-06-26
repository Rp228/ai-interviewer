from langchain.prompts import PromptTemplate

# Prompt to ask a question based on topic
question_prompt = PromptTemplate.from_template("""
You are a professional technical interviewer.
Ask a relevant technical question about the topic: {topic}.
Keep it short and clear.
""")

# Prompt to evaluate a user's answer
evaluation_prompt = PromptTemplate.from_template("""
You are a technical evaluator. A candidate answered a question.
Question: {question}
Answer: {answer}

Evaluate the candidate's response. Provide helpful feedback and rate it out of 10.
""")

