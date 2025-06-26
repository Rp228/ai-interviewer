from langchain_community.llms import Ollama
from langchain.chains import LLMChain
from prompts import question_prompt, evaluation_prompt  # ✅ Correct import

# Load local model
llm = Ollama(model="gemma:2b")

# Define chains
question_chain = LLMChain(llm=llm, prompt=question_prompt)
evaluation_chain = LLMChain(llm=llm, prompt=evaluation_prompt)
