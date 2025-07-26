from google.adk.agents import LlmAgent

from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List,  Dict

load_dotenv()


class ReceiptItem(BaseModel):
    name: str
    qty: int
    price: str

class ReceiptOutput(BaseModel):
    store: str
    date: str
    total: str
    tax: str
    items: List[ReceiptItem]


    

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


receipt_ingestion_agent = LlmAgent(
    name="ReceiptIngestionAgent",
    model="gemini-2.0-flash",
    instruction=instruction_text,
    output_key="parsed_receipt"
)

receipt_feedback_agent = LlmAgent(
    name="ReceiptFeedbackAgent",
    model="gemini-2.0-flash",
    instruction="""You are an intelligent assistant for a receipt management application. Your primary function is to process user-provided corrections for data that has been automatically extracted from a receipt. You will be given the initial structured data from the receipt and the user's feedback. Your task is to understand the user's intent, update the receipt data accordingly, and provide the corrected data in the same JSON format.
            Step-by-Step Instructions for the LLM:

Step 1: Understand the Initial Data Structure
You will receive the receipt data in a structured JSON format.
tep 2: Analyze the User's Feedback

Carefully examine the user_feedback to identify the specific field(s) the user wants to correct and the new value(s) they are providing.

    Common User Feedback Scenarios:

        Simple Corrections: "The total amount was 125.50, not 12.55."

        Spelling/Name Corrections: "The store is 'The Coffee House', not 'The Cofe Hose'."

        Line Item Adjustments: "The quantity for 'Espresso' should be 2." or "You missed an item: 'Croissant' for 2.50."

        Date/Time Changes: "The date was yesterday, not today." or "The transaction happened at 10:30 AM."

Step 3: Identify and Map Corrections to the JSON structure

Based on your analysis of the user_feedback, identify the corresponding key(s) in the structured_receipt_data JSON that need to be updated.

    If the user says "the total was wrong," you should target the total_amount field.

    If any of The values are changes, recompute the total_amount, subtotal, tax, and total_price fields accordingly.

    If the feedback is about a specific product, you need to find the correct object within the line_items array to modify.

Step 4: Validate and Apply the Corrections

Update the value of the identified key(s) with the new information from the user.

    Data Type Consistency: Ensure that the new value conforms to the data type specified in the schema (e.g., a float for total_amount, an integer for quantity).

    Calculated Fields: If a change in a line item (like quantity or unit_price) affects other fields (total_price, subtotal, tax, total_amount), you should recalculate these fields. State that you have made these recalculations in your response.""",
    output_key="parsed_receipt"
)


google_wallet_agent = LlmAgent(
     name="GoogleWalletAgent",
    model="gemini-2.0-flash",
    instruction="Upload receipt data to Google Wallet.",
)


root_agent = LlmAgent(
    name="ReceiptOrchestrator",
    model="gemini-2.0-flash",
    description="Main agent responsible for orchestrating receipt processing: ingestion, feedback, and Google Wallet upload.",
    instruction="""
        "You are the central orchestrator for Project Raseed.\n"
        "Your job is to manage the receipt processing workflow:\n\n"
        "1. Use receipt_ingestion_agent to handle initial receipt uploads and data extraction.\n"
        "2. Use receipt_feedback_agent to process user feedback and correct any errors in the extracted data.\n"
        "3. Use google_wallet_agent to upload the finalized receipt data to Google Wallet.\n"
        "Do not try to process the receipts yourself. Delegate to the appropriate agent."
    """,
    sub_agents=[
        receipt_ingestion_agent,
        receipt_feedback_agent,
        google_wallet_agent
    ]
)