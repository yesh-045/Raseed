from google.adk import Agent
from google.adk.planners import BuiltInPlanner
from google.adk.agents import LlmAgent , SequentialAgent
from google.genai import types
from .tools import *
from google.adk.tools.base_tool import BaseTool
from typing import Dict, Any, Optional
from google.adk.agents.callback_context import CallbackContext
from google.adk.models import LlmResponse, LlmRequest

from .tools import *


query_enhancer = Agent(
    model="gemini-2.5-flash",
    name="QueryEnhancer",
    description="Enhances user queries with additional context and details to improve AI understanding and response accuracy.",
    instruction="""You are a query enhancement assistant.

Your task is to take a raw natural language query from a user and enhance it by adding relevant context, clarifying vague or incomplete parts, and expanding shorthand or ambiguous terms. The goal is to produce a more complete and precise version of the original query that is ready for AI interpretation, database processing, or task execution.

Follow these rules:

1. Preserve the user's original intent — do not change what they want to achieve.
2. Clarify ambiguity. If the query is vague (e.g., “What did I spend?”), infer common context like categories, timeframes, or user IDs.
3. Add context where applicable:
   - Use default timeframes such as “past 30 days” or “last month” if none are specified.
   - Translate common shorthand into full financial terms (e.g., “food” → “food-related purchases”).
4. Expand the query to include all necessary information for precise downstream processing.
5. Return the enhanced query as a single, complete sentence.

---

**Input:** A raw user query (natural language)

**Output:** A rewritten, context-rich, well-structured query that reflects the original intent

---

Examples:

- Input: "How much did I spend on groceries?"
  → Output: "Retrieve the total amount spent by user on groceries over the past 30 days."

- Input: "Show my receipts"
  → Output: "List all receipts associated with user from the past 60 days, sorted by date."

- Input: "Break it down"
  → Output: "Provide a categorized breakdown of user spending over the past 30 days, grouped by expense category."
""",
    planner=BuiltInPlanner(
        thinking_config=types.ThinkingConfig(
            include_thoughts=True,
            thinking_budget=2048,  
            
        )
    ),
)



generalAgent = LlmAgent(
    name='General_Question_Answer_agent',
    model="gemini-2.0-flash",
    description="""
        "Handles general, conversational, or informational queries unrelated to user-specific financial data.\n"
        "Used when the user's question doesn't require accessing personal receipts, budgets, or transaction history."
    """,
    instruction="""
    You are the general-purpose assistant for Project Raseed.
    Your job is to answer user queries that do not require access to personal financial data.
    
    1. Handle questions about financial concepts, budgeting tips, or general advice.
    2. Respond to casual or non-technical user input like greetings, help requests, or app explanations.
    3. Do not attempt to access or analyze user-specific data like receipts or transactions.
    
    Be helpful, clear, and informative — but stay within the scope of general knowledge.
    """
)



# Assuming FirebaseConfig is imported and initialized somewhere globally
# For example:
# firebase_config = FirebaseConfig(credentials_path="path/to/credentials.json")
# And firebase_config.db_scheme contains the schema

# def before_db_tool_modifier(
#     tool: BaseTool, args: Dict[str, Any], tool_context: ToolContext
# ) -> Optional[Dict]:
#     """Adds Firestore DB schema to tool args for dbAgent tools."""
#     agent_name = tool_context.agent_name
#     tool_name = tool.name
#     print(f"[Callback] Before tool call for tool '{tool_name}' in agent '{agent_name}'")
#     print(f"[Callback] Original args: {args}")

#     db_tools = {
#         'get_user_profile',
#         'get_recent_receipts',
#         'get_spending_by_amount_range',
#         'get_overspending_transactions',
#         'search_items_by_name',
#         'get_category_spending_breakdown',
#         'get_essential_vs_nonessential_spending'
#     }

#     # Only add schema for dbAgent tools
#     if tool_name in db_tools:
#         try:
#             from .tools import firebase_config  # Adjust import as needed
#             db_schema = firebase_config.get_db_schema
#             args['db_tools'] = db_schema
#             print(f"[Callback] Added db_schema to args: {args}")
#         except Exception as e:
#             print(f"[Callback] Error adding db_schema: {e}")

#     print("[Callback] Proceeding with original or modified args.")
#     return None


def db_before_model_modifier(
    callback_context: CallbackContext, llm_request: LlmRequest
) -> Optional[LlmResponse]:
    """Adds Firestore DB schema to LLM request config for dbAgent."""
    agent_name = callback_context.agent_name
    print(f"[Callback] Before model call for agent: {agent_name}")

    # Inspect the last user message in the request contents
    last_user_message = None
    if llm_request.contents and llm_request.contents[-1].role == 'user':
        if llm_request.contents[-1].parts:
            last_user_message = llm_request.contents[-1].parts[0].text
    print(f"[Callback] Inspecting last user message: '{last_user_message}'")

    # Add db_schema to config if available
    try:
        db_schema = firebase_config.get_db_schema
        # Use a generic attribute dictionary if direct assignment fails
        if hasattr(llm_request.config, "__dict__"):
            llm_request.config.__dict__["db_tools"] = db_schema
            print(f"[Callback] Added db_schema to llm_request.config via __dict__")
        else:
            print(f"[Callback] Could not add db_schema: config has no __dict__")
    except Exception as e:
        print(f"[Callback] Error adding db_schema to llm_request.config: {e}")

    # Example: Add a prefix to the system instruction
    original_instruction = getattr(llm_request.config, "system_instruction", None)
    prefix = "[Modified by Callback] "
    if original_instruction is None:
        original_instruction = types.Content(role="system", parts=[types.Part(text="")])
    elif not isinstance(original_instruction, types.Content):
        original_instruction = types.Content(role="system", parts=[types.Part(text=str(original_instruction))])
    if not original_instruction.parts:
        original_instruction.parts.append(types.Part(text=""))
    modified_text = prefix + (original_instruction.parts[0].text or "")
    original_instruction.parts[0].text = modified_text
    llm_request.config.system_instruction = original_instruction
    print(f"[Callback] Modified system instruction to: '{modified_text}'")

    # Skip Example
    if last_user_message and "BLOCK" in last_user_message.upper():
        print("[Callback] 'BLOCK' keyword found. Skipping LLM call.")
        return LlmResponse(
            content=types.Content(
                role="model",
                parts=[types.Part(text="LLM call was blocked by before_model_callback.")],
            )
        )
    else:
        print("[Callback] Proceeding with LLM call.")
        return None

dbAgent = Agent(
    name="DatabaseAgent",
    model="gemini-2.0-flash",
    description="Handles all database queries and data retrieval for user financial information including receipts, spending analysis, and transaction history.",
    instruction="""You are the database agent for Project Raseed.

Your primary responsibility is to execute database queries to retrieve user financial data.
Analyze the user's query to determine the correct tool to use and extract all necessary parameters like user ID, date ranges, or search terms.

Key capabilities:
1. Retrieve user profile information.
2. Fetch receipts with various filters.
3. Analyze spending patterns.
4. Search for specific items.
5. Identify overspending incidents.

When responding to queries:
- Always use the appropriate tool based on the user's specific request.
- Provide comprehensive and clearly formatted information.
- Handle errors gracefully and provide helpful messages.

Available tools:
- get_user_profile: Get user budget and preferences.
- get_recent_receipts: Fetch recent transactions.
- get_spending_by_amount_range: Find transactions in an amount range.
- get_overspending_transactions: Identify budget overruns.
- get_receipts_by_store: Fetch receipts from a specific store.
- search_items_by_name: Find specific purchased items.
- get_category_spending_breakdown: Analyze spending by category.
- get_essential_vs_nonessential_spending: Analyze essential vs discretionary spending.

Always provide actionable insights along with raw data.""",
    tools=[
        get_user_profile,
        get_recent_receipts,
        get_receipts_by_store,
        get_spending_by_amount_range,
        get_overspending_transactions,
        search_items_by_name,
        get_category_spending_breakdown,
        get_essential_vs_nonessential_spending
    ],
)


# Update your router agent to include dbAgent
router_agent = LlmAgent(
    name='llmRouter',
    model='gemini-2.0-flash',
    description='Routes user queries to the appropriate sub-agent based on intent and context',
    instruction="""
    You are the central query router for Project Raseed.
    Your job is to analyze user queries and delegate them appropriately:

    1. If the query is general, conversational, or informational, route it to generalAgent.
    2. If the query involves user-specific financial data (e.g., receipts, spending, budgets), route it to dbAgent.
    
    Examples for dbAgent routing:
    - "How much did I spend last month?"
    - "Show me my recent receipts"
    - "What did I buy at Walmart?"
    - "How much did I overspend?"
    - "Break down my spending by category"
    - "Find all purchases of milk"
    - "What's my budget status?"
    
    Examples for generalAgent routing:
    - "What are some budgeting tips?"
    - "How does Raseed work?"
    - "Hello, can you help me?"
    - "What is compound interest?"
    
    Do not attempt to answer queries yourself. Always delegate to the correct sub-agent based on intent.
    """,
    sub_agents=[generalAgent, dbAgent]
)

root_agent = SequentialAgent(
    name="Coordinator",
    description="Executes a sequence of agents answerign the users query.",
    sub_agents = [ query_enhancer , router_agent ]
)




# root_agent = (
#     name="Coordinator",
#     model="gemini-2.0-flash",
#     description="Main agent responsible for routing user queries to the correct agent (e.g., receipt help, finance, shopping, or general queries).",
#     instruction=(
#         "You are the central dispatcher agent for Project Raseed.\n"
#         "Your job is to route the user's query to the correct agent based on intent:\n\n"
#         # "- Use `receipt_ingestion_agent` if the input relates to receipt uploads (e.g., 'here is a receipt', 'analyze this bill').\n"
#         "- Use `spending_agent` for questions about expenses, budget breakdowns.\n"
#         "- Use `savings_agent` for suggesting cost-saving opportunities based on past purchases.\n"
#         "- Use `shopping_agent` for cooking or shopping-related questions like 'what should I buy to make dal?'.\n"
#         "- If the query does not fit any of the above categories, delegate to `chatbot_agent` for general assistance.\n"
#         "Do not try to answer the question yourself. Always delegate to the correct agent."
#     ),
#     sub_agents=[
#         # receipt_ingestion_agent,
#         # spending_agent,
#     ),  savings_agent,
#     sub_agents=[_agent,
#         # receipt_ingestion_agent,
#         # spending_agent,
#         savings_agent,#         shopping_agent,#         chatbot_agent#     ]# )