from pydantic import BaseModel, Field
from google.adk.agents import LlmAgent
from vertexai.preview.generative_models import GenerativeModel, Part

# ⚠️ No input schema needed — direct file upload

# 📤 Output schema
class ReceiptItem(BaseModel):
    name: str
    qty: int
    price: str

class ReceiptOutput(BaseModel):
    store: str
    date: str
    total: str
    tax: str
    items: list[ReceiptItem]

# 🧠 Prompt-based direct image handling
instruction_text = """
You are a helpful receipt ingestion agent. 
You will receive a receipt image (uploaded directly). 
Extract the store name, date, total, tax, and itemized data with name, quantity, and price.
Respond only with valid JSON structured as:
{
  "store": string,
  "date": string,
  "total": string,
  "tax": string,
  "items": [
    {"name": string, "qty": integer, "price": string},
    ...
  ]
}
"""

# 🔍 Agent
root_agent = LlmAgent(
    name="receipt_ingestion_direct_agent",
    model="gemini-2.5-flash",
    instruction=instruction_text,
    output_schema=ReceiptOutput,
    output_key="parsed_receipt"
)
