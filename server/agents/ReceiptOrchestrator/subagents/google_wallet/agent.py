from google.adk.agents import LlmAgent, SequentialAgent
from google.adk.tools import ToolContext
from .tools import WalletTool
from typing import Dict

def create_google_wallet_tool(tool_context: ToolContext) -> Dict:
    parsed_result = tool_context.state.get('parsed_result', {})
    print(parsed_result)
    if not parsed_result:
        return {
            'success': False,
            'error': 'No parsed result found in tool context'
        }
    

    title = parsed_result.get('title', 'Receipt')
    header = parsed_result.get('header', 'Receipt Header')
    description = parsed_result.get('description', 'Receipt Description')
    barcode_value = parsed_result.get('barcode_value', '1234567890')
    background_color = parsed_result.get('background_color', '#4285f4')
    hero_image_url = parsed_result.get('hero_image_url', None)
    logo_image_url = parsed_result.get('logo_image_url', None)
    app_link_url = parsed_result.get('app_link_url', None)
    

    wallet_tool = WalletTool()

    try:
        response = wallet_tool.create_pass(title, header, description,
            barcode_value, background_color,hero_image_url,logo_image_url, app_link_url)
        return response
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


google_wallet_agent = LlmAgent(
    name= 'google_wallet',
    model='gemini-2.0-flash',
    description='Generates a Google Wallet pass for a receipt',
    instruction="""You are a Google Wallet pass generator. 
    You can use the 'create_google_wallet_tool' to generate a Google Wallet pass. 
    This tool takes receipt data from the tool context and creates a digital pass.
    Ensure all necessary information is available in the tool context before using the tool.
    return The response from the tool as a JSON object with 'success' and 'error' keys.""",
    tools  = [ create_google_wallet_tool ]
)


