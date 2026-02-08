"""
chatbot_service.py
==================
LangChain-powered chatbot for precision agriculture drone analytics
Provides intelligent assistance by reading project data and context
"""

import os
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import HumanMessage, AIMessage, SystemMessage
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain

# Load environment variables
load_dotenv(Path(__file__).parent.parent / '.env')

class AgriDroneChatbot:
    """
    Intelligent chatbot for AgriDrone Analytics System
    - Reads real-time detection data
    - Analyzes economic metrics
    - Provides treatment recommendations
    - Answers questions about field status and system configuration
    """
    
    def __init__(self, firebase_client=None):
        """
        Initialize chatbot with OpenAI and project data access
        
        Args:
            firebase_client: Optional FirebaseClient instance for real-time data
        """
        self.base_dir = Path(__file__).resolve().parent.parent
        self.firebase_client = firebase_client
        
        # Initialize OpenAI (user must set OPENAI_API_KEY in environment)
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError(
                "⚠️ OPENAI_API_KEY not found in environment variables. "
                "Please add it to your .env file."
            )
        
        # Initialize LangChain ChatOpenAI
        self.llm = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0.7,
            openai_api_key=api_key
        )
        
        # Initialize conversation memory
        self.memory = ConversationBufferMemory(
            return_messages=True,
            memory_key="history"
        )
        
        # System prompt with project context
        self.system_prompt = self._build_system_prompt()
        
    def _build_system_prompt(self) -> str:
        """Build comprehensive system prompt with project context."""
        return """You are an intelligent AI assistant for the AgriDrone Analytics System, 
a precision agriculture platform that uses drone imagery and YOLOv8 AI to detect crop diseases.

**Your Role:**
- Help farmers and agricultural operators understand their drone detection results
- Explain economic impact and ROI calculations
- Provide treatment recommendations based on detected disease zones
- Answer questions about the precision agriculture system
- Clarify field dimensions, coverage areas, and spray path planning

**System Capabilities:**
1. **Disease Detection**: YOLOv8 model detects Early Blight and Late Blight in tomato crops
2. **Economic Analysis**: Calculates ROI, yield protection, and cost savings vs traditional methods
3. **Treatment Planning**: Generates precise spray paths targeting only infected zones
4. **Real-time Monitoring**: Firebase-synced live detection feed with GPS coordinates
5. **3D Mapping**: MapLibre visualization with terrain, buildings, and detection overlays

**Project Context:**
- Field Location: Lahore, Pakistan (30.8725°N, 74.5897°E)
- Crop Type: Tomato
- Expected Yield: 50,000 kg/hectare (untreated)
- Market Price: ₹25/kg
- Disease Impact: 40% yield loss if untreated, 5% loss with precision treatment
- Treatment Cost: ₹3,000/hectare + ₹500 fixed drone cost

**Key Metrics to Reference:**
- ROI Calculation: (Yield Protected Value - Treatment Cost) / Treatment Cost
- Net Benefit: Revenue from saved yield minus treatment expenses
- Cost vs Traditional: Precision spray saves ~80% chemical vs blanket application

**Response Guidelines:**
1. Be concise and practical - farmers need actionable insights
2. Use exact numbers from the project data when available
3. Explain technical terms in simple agricultural language
4. Prioritize economic impact and treatment urgency
5. Reference specific detection zones, GPS coordinates, and areas when relevant
6. If data is unavailable, clearly state that and offer to help once analysis completes

**Tone**: Professional, helpful, and farmer-friendly. Balance technical accuracy with accessibility.
"""
    
    def _load_detection_data(self) -> Dict:
        """Load current detection data from Firebase or local JSON."""
        try:
            if self.firebase_client:
                # Try to get data from Firebase
                detections = self.firebase_client.get_data('/detections')
                sessions = self.firebase_client.get_data('/sessions')
                return {
                    'source': 'firebase',
                    'detections': detections or {},
                    'sessions': sessions or {},
                    'timestamp': datetime.now().isoformat()
                }
            else:
                # Fallback to local JSON
                output_dir = self.base_dir / "output"
                detections_file = output_dir / "current_detections.json"
                session_file = output_dir / "current_session.json"
                
                detections = {}
                sessions = {}
                
                if detections_file.exists():
                    with open(detections_file, 'r') as f:
                        detections = json.load(f)
                
                if session_file.exists():
                    with open(session_file, 'r') as f:
                        sessions = json.load(f)
                
                return {
                    'source': 'local',
                    'detections': detections,
                    'sessions': sessions,
                    'timestamp': datetime.now().isoformat()
                }
        except Exception as e:
            return {
                'source': 'error',
                'error': str(e),
                'detections': {},
                'sessions': {}
            }
    
    def _load_config_data(self) -> Dict:
        """Load system configuration from config.yaml."""
        try:
            import yaml
            config_path = self.base_dir / "config.yaml"
            with open(config_path, 'r') as f:
                config = yaml.safe_load(f)
            return config
        except Exception as e:
            return {'error': str(e)}
    
    def _summarize_project_state(self) -> str:
        """Generate a comprehensive summary of current project state."""
        detection_data = self._load_detection_data()
        config_data = self._load_config_data()
        
        # Count detections
        detections = detection_data.get('detections', {})
        total_detections = len(detections)
        
        # Calculate infected area
        infected_zones = 0
        disease_types = set()
        
        for det_id, det in detections.items():
            if isinstance(det, dict):
                infected_zones += 1
                if 'label' in det:
                    disease_types.add(det['label'])
        
        # Build summary
        summary_parts = [
            f"📊 **Current Project State** (Updated: {detection_data.get('timestamp', 'Unknown')})",
            f"",
            f"**Detection Status:**",
            f"- Total Detections: {total_detections}",
            f"- Infected Zones: {infected_zones}",
            f"- Disease Types: {', '.join(disease_types) if disease_types else 'None detected'}",
            f"- Data Source: {detection_data.get('source', 'Unknown')}",
            f"",
            f"**Field Configuration:**"
        ]
        
        # Add field info from config
        if 'field' in config_data:
            field = config_data['field']
            summary_parts.extend([
                f"- Area: {field.get('area_hectares', 'N/A')} hectares",
                f"- Dimensions: {field.get('length_m', 'N/A')}m × {field.get('width_m', 'N/A')}m",
                f"- GPS: {field.get('gps', {}).get('latitude', 'N/A')}°N, {field.get('gps', {}).get('longitude', 'N/A')}°E",
                f"- Grid Cell Size: {field.get('grid_cell_size', 'N/A')}m",
            ])
        
        # Add economic context
        if infected_zones > 0:
            # Rough calculation (simplified)
            infected_area_ha = infected_zones * 0.02  # Assume ~200 sq m per zone
            treatment_cost = infected_area_ha * 3000 + 500
            yield_protected_kg = infected_zones * 320  # ~320 kg per zone
            revenue_protected = yield_protected_kg * 25
            
            summary_parts.extend([
                f"",
                f"**Economic Snapshot:**",
                f"- Infected Area: ~{infected_area_ha:.2f} hectares",
                f"- Treatment Cost: ₹{treatment_cost:,.0f}",
                f"- Yield at Risk: ~{yield_protected_kg:,.0f} kg",
                f"- Revenue at Risk: ₹{revenue_protected:,.0f}",
            ])
        
        return "\n".join(summary_parts)
    
    def chat(self, user_message: str, conversation_history: Optional[List[Dict]] = None) -> Dict:
        """
        Process user message and return AI response with project context.
        
        Args:
            user_message: User's question or request
            conversation_history: Optional list of previous messages
        
        Returns:
            Dict with 'response' and 'context_data'
        """
        try:
            # Get current project state
            project_summary = self._summarize_project_state()
            detection_data = self._load_detection_data()
            
            # Build enhanced prompt with project data
            enhanced_prompt = f"""{self.system_prompt}

---
{project_summary}
---

**User Query:** {user_message}

Based on the above project data and your knowledge of precision agriculture, 
provide a helpful, accurate response. Include specific numbers and references 
to the detection data when relevant.
"""
            
            # Build message history
            messages = [SystemMessage(content=enhanced_prompt)]
            
            # Add conversation history if provided
            if conversation_history:
                for msg in conversation_history[-6:]:  # Last 6 messages for context
                    if msg.get('role') == 'user':
                        messages.append(HumanMessage(content=msg['content']))
                    elif msg.get('role') == 'assistant':
                        messages.append(AIMessage(content=msg['content']))
            
            # Add current user message
            messages.append(HumanMessage(content=user_message))
            
            # Get AI response
            response = self.llm(messages)
            
            return {
                'success': True,
                'response': response.content,
                'timestamp': datetime.now().isoformat(),
                'context_data': {
                    'detections_count': len(detection_data.get('detections', {})),
                    'data_source': detection_data.get('source'),
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'response': f"I encountered an error: {str(e)}. Please try again or rephrase your question.",
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def get_quick_summary(self) -> str:
        """Generate a quick status summary for the welcome message."""
        detection_data = self._load_detection_data()
        detections = detection_data.get('detections', {})
        
        if not detections:
            return ("👋 Welcome to AgriDrone Analytics Support!\n\n"
                   "No detections found yet. Upload a video to start analysis.\n\n"
                   "Ask me about:\n"
                   "• How the system works\n"
                   "• Economic calculations and ROI\n"
                   "• Treatment recommendations\n"
                   "• Field configuration")
        
        infected_zones = len(detections)
        return (f"👋 Welcome to AgriDrone Analytics Support!\n\n"
               f"📊 Current Status: {infected_zones} disease zones detected\n\n"
               f"Ask me anything about your field analysis, economic impact, "
               f"or treatment recommendations!")


# Singleton instance
_chatbot_instance = None

def get_chatbot(firebase_client=None):
    """Get or create chatbot singleton instance."""
    global _chatbot_instance
    if _chatbot_instance is None:
        _chatbot_instance = AgriDroneChatbot(firebase_client)
    return _chatbot_instance
