from google.adk.agents import LlmAgent, SequentialAgent
from typing import List, Dict, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from google.adk.tools import google_search
from google.adk.tools.agent_tool import AgentTool

class Item(BaseModel):
    item_name: str = Field(..., description="Name of the item")
    category: str = Field(..., description="Category of the item")
    brand: str = Field(..., description="Brand name")
    quantity: float = Field(..., description="Units purchased")
    unit_price: float = Field(..., description="Price per unit")
    tax: float = Field(..., description="Tax applied")
    description: Optional[str] = Field(None, description="Optional description of the item")

class Receipt(BaseModel):
    timestamp: datetime = Field(
        ..., description="ISO 8601 format timestamp of purchase"
    ),
    store: str = Field(..., description="Name of the store")
    items: List[Item] = Field(..., description="Detailed list of purchased items")
    location: str = Field(..., description="Location of the store")
    total_amount: float = Field(..., description="Total bill amount")
    


instruction_text = """
You are a specialized AI assistant for high-precision receipt processing. Your sole function is to perform Optical Character Recognition (OCR) on an uploaded receipt image and extract the data into a structured JSON format.

**Your Goal:** Analyze the provided image of a receipt and meticulously extract the required information.

**Core Instructions:**

1.  **Analyze the Image:** Carefully scan the entire receipt image to identify all textual information.
2.  **Extract Data:** From the text, extract the details that correspond to the fields in the required JSON schema below.
3.  **Strictly Adhere to the Schema:** Your final output MUST be a single, valid JSON object that conforms exactly to the specified structure and data types. Do not add any extra fields or deviate from this format.
4.  **Handle Missing Information:** This is critical. If a piece of information for any field cannot be found on the receipt, you MUST use a `null` value for that field. Do NOT guess, invent, or omit the field. For example, if the store's brand is not mentioned for an item, the output should be `"brand": null`.
5.  **Infer Where Appropriate:** You may infer logical data. For instance, you can infer the `category` (e.g., "Dairy", "Produce", "Beverage") from the `item_name`. If you cannot confidently infer a category, use a general term like "Groceries" or `null`.
6.  **Respond Only with JSON:** Do not include any explanatory text, apologies, or introductory sentences in your response. Your entire output must be the JSON object itself.

---

**Required JSON Output Schema:**

{
  "timestamp": "string (ISO 8601 format: YYYY-MM-DDTHH:MM:SS)",
  "store": "string",
  "location": "string (Address or city of the store)",
  "total_amount": "float",
  "items": [
    {
      "item_name": "string (Name of the purchased item)",
      "category": "string (Inferred category like 'Groceries', 'Electronics', 'Clothing')",
      "brand": "string (Brand of the item, if available)",
      "quantity": "float (Number of units purchased, use 1.0 if not specified)",
      "unit_price": "float (Price for a single unit of the item)",
      "tax": "float (Tax amount applied to this specific item, if available)"
    }
  ]
}

---

**Example Scenario:**

If the receipt is for "The Corner Store," dated June 21, 2025, has a total of $12.50, and lists one "Milk" for $3.50 but does not mention a brand or item-specific tax, your output should look like this:

```json
{
  "timestamp": "2025-06-21T00:00:00",
  "store": "The Corner Store",
  "location": null,
  "total_amount": 12.50,
  "items": [
    {
      "item_name": "Milk",
      "category": "Dairy",
      "brand": null,
      "quantity": 1.0,
      "unit_price": 3.50,
      "tax": null
    }
  ]
}
"""


receipt_extract_agent = LlmAgent(
    name="receipt_ingestion",
    model="gemini-2.0-flash",
    description="Agent for ingesting receipt data from images",
    instruction=instruction_text,
    output_key="parsed_receipt"
)

receipt_refinement_agent = LlmAgent(
    name='receipt_refinement',
    model='gemini-2.0-flash',
    description='Agent for refining receipt data',
    instruction = """
    You are a data refinement agent.Your primary function is to process a structured JSON object representing a parsed receipt, enrich it with external data.

**Your Goal:** Take the input JSON from the state, `{parsed_receipt}`, and for each item, use the `google_search` tool to find and add a descriptive summary and a more accurate category.

**Core Instructions:**

1.  **Receive Input:** You will be given a JSON object named `{parsed_receipt}` which contains the extracted data from a receipt.

2.  **Iterate Through Items:** Process each JSON object within the `items` array one by one.

3.  **Perform Google Search:** For each item, construct a search query using its `item_name` and `brand` (if available). For example, for an item named "Organic Blueberries" with brand "Driscoll's", a good query would be "Driscoll's Organic Blueberries". Use the `google_search` tool to get information.

4.  **Enrich Item Data:**
    *   **`category`:** Based on the search results, validate or refine the item's `category`. If the original category was generic (e.g., "Groceries") or `null`, update it to be more specific (e.g., "Produce", "Snacks", "Beverage"). If no better category can be determined, retain the original.
    *   **`description`:** Add a new field to each item called `description`. This field must contain a concise, 10-15 word summary of the item based on the information found in your search. If no relevant information is found, the value for `description` MUST be `null`.
5. ** Store The refined data in The same `{parsed_receipt}` JSON object format.
---
    """,
    tools = [google_search],
    output_key="parsed_receipt",
)


receipt_ingestion_agent = SequentialAgent(
    name='receipt_ingestion',
    description='Agent for ingesting receipt data from images and extracting structured information',
    sub_agents=[receipt_extract_agent,receipt_refinement_agent],
)
