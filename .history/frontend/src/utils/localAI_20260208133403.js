/**
 * Local AI Knowledge Base
 * Pattern-based question answering system for AgriDrone Analytics
 */

const knowledgeBase = [
  // System Overview
  {
    patterns: [
      /what.*(is|does).*(system|dashboard|application|app)/i,
      /tell me about.*(system|dashboard)/i,
      /how.*system.*work/i,
      /system overview/i,
      /what can.*(do|system)/i,
      /how.*this.*work/i,
      /explain.*(system|dashboard)/i
    ],
    answer: "🚁 **AgriDrone Analytics System Overview**\n\nThis is an advanced agricultural drone monitoring system that:\n• Detects crop diseases using AI-powered computer vision\n• Provides real-time GPS tracking and field mapping\n• Generates economic impact analysis and ROI calculations\n• Plans optimal spray paths for precision treatment\n• Offers intelligent alerts and decision recommendations\n• Creates comprehensive mission reports\n\nThe system combines drone imagery, sensor data, and AI to help farmers protect their crops efficiently."
  },

  // Disease Detection
  {
    patterns: [
      /what diseases (can|does|could|are).*(detect|identified|found)/i,
      /which diseases/i,
      /disease (types|detection|list)/i,
      /what infections/i,
      /can.*detect.*diseases?/i,
      /diseases?.*(be detected|can.*detect)/i
    ],
    answer: "🦠 **Disease Detection Capabilities**\n\nOur AI model can detect 12 different crop diseases including:\n• Bacterial Blight\n• Brown Spot\n• Leaf Blast\n• Leaf Scald\n• Tungro\n• Sheath Blight\n• Rice Blast\n• Stem Rot\n\nThe system uses YOLOv8-based computer vision with **93% accuracy** and processes up to **81 high-confidence detections** per session."
  },

  // Accuracy & Confidence
  {
    patterns: [
      /(how|what).*(accurate|accuracy)/i,
      /confidence/i,
      /how reliable/i,
      /model performance/i,
      /detection accuracy/i,
      /reliable/i,
      /accurate/i
    ],
    answer: "📊 **Model Performance Metrics**\n\n• **Detection Accuracy**: 93%\n• **High Confidence Detections**: 81 per session\n• **False Positive Rate**: <7%\n• **Processing Speed**: Real-time inference\n\nOur YOLOv8 model is trained on over 10,000 annotated crop disease images and continuously improves through active learning."
  },

  // Economic Impact
  {
    patterns: [
      /(economic|financial)/i,
      /roi|return on investment/i,
      /cost.*sav/i,
      /how much.*save/i,
      /worth.*investment/i,
      /save.*money/i,
      /benefit/i
    ],
    answer: "💰 **Economic Impact Analysis**\n\nThe system calculates:\n• **Estimated Loss Prevention**: Based on infection rate and yield loss data\n• **Precision Treatment Cost**: Only treats affected zones\n• **Net Benefit**: Revenue saved minus treatment cost\n• **ROI**: Typical returns of 100-150% in first season\n\nExample: 27% field infection could mean ₹2,70,000 in losses. Precision treatment costs only ₹2,120, resulting in ₹2,13,880 net benefit."
  },

  // Drone & GPS
  {
    patterns: [
      /drone/i,
      /gps/i,
      /where.*drone/i,
      /track/i,
      /location/i,
      /position/i,
      /map/i
    ],
    answer: "🛰️ **Drone & GPS Tracking**\n\nThe system provides:\n• **Real-time GPS positioning** with sub-meter accuracy\n• **Live drone status** indicator (connected/disconnected)\n• **Flight path visualization** on interactive map\n• **Detection GPS tagging** for precise location tracking\n• **2D/3D map views** with terrain elevation\n\nYou can view the drone location on the Field Map panel with live updates every second."
  },

  // Spray Path Planning
  {
    patterns: [
      /spray/i,
      /path.*plan/i,
      /treatment/i,
      /how.*spray/i,
      /optimal/i,
      /precision/i
    ],
      /precision spraying/i
    ],
    answer: "💧 **Intelligent Spray Path Planning**\n\nThe system generates optimal spray paths that:\n• **Target only infected zones** to minimize chemical use\n• **Calculate waypoints** for autonomous drone navigation\n• **Estimate coverage** (m² treated vs. skipped)\n• **Optimize efficiency** (up to 80% chemical savings)\n• **Show visual overlay** on map for verification\n\nPath planning uses A* algorithm with field grid analysis to ensure complete coverage while avoiding healthy crops."
  },

  // Alerts & Decisions
  {
    patterns: [
      /alerts?|notifications?/i,
      /decision (making|support|recommendations?)/i,
      /what (should|do) i do/i,
      /action (items?|recommendations?)/i,
      /intelligent (alerts?|decisions?)/i
    ],
    answer: "🚨 **Alerts & Decision Support**\n\nThe system provides:\n• **Critical Alerts**: High infection rate, rapid spread detection\n• **Warning Alerts**: Moderate infection, preventive action needed\n• **Info Alerts**: Monitoring updates, system notifications\n\nEach alert includes:\n✓ Severity level and confidence score\n✓ Affected zones and economic impact\n✓ Recommended actions (spray now, monitor, consult expert)\n✓ Scheduling options for treatment\n\nAlerts use multimodal intelligence (vision + sensor data) for higher accuracy."
  },

  // Multimodal Intelligence
  {
    patterns: [
      /multimodal|fusion (intelligence|data)/i,
      /sensor (data|fusion)/i,
      /how (does|do) (sensors?|fusion) work/i,
      /vision and sensor/i,
      /data fusion/i
    ],
    answer: "🌡️ **Multimodal Intelligence System**\n\nCombines multiple data sources:\n• **Vision Detection**: AI-analyzed crop images\n• **Moisture Sensors**: 71.7% optimal level detection\n• **Temperature Sensors**: 34.3°C warm conditions\n• **Humidity Sensors**: 69.7% moderate levels\n\nFusion Benefits:\n✓ Reduces false positives by 40%\n✓ Confirms disease presence across modalities\n✓ Provides environmental context\n✓ Enables predictive analysis\n\nExample: Vision detects leaf spots + high humidity + warm temp = confirmed fungal infection"
  },

  // Reports
  {
    patterns: [
      /reports?|reporting/i,
      /mission report/i,
      /generate (report|pdf)/i,
      /download (data|report)/i,
      /export (data|results)/i
    ],
    answer: "📄 **Mission Report Generator**\n\nGenerate comprehensive PDF reports including:\n• Detection summary with photos\n• Infection rate and field analysis\n• Economic impact calculations\n• ROI projections\n• Sensor data logs\n• Alert history\n• Recommended actions\n\nReports are:\n✓ Professional format suitable for insurance claims\n✓ Shareable with agronomists\n✓ Include GPS-tagged evidence\n✓ Generated in seconds\n\nClick 'Generate & Download Report' in the Mission Report panel."
  },

  // Video Upload & Analysis
  {
    patterns: [
      /upload.*video/i,
      /how.*(upload|add|submit).*video/i,
      /how.*(analyze|process).*video/i,
      /(upload|add).*footage/i,
      /video.*(upload|analysis|input)/i,
      /analyze.*video/i,
      /process.*video/i,
      /submit.*video/i
    ],
    answer: "🎥 **Video Upload & Analysis**\n\nTo analyze your drone footage:\n1. Click **'Choose Video'** in the Video Input panel\n2. Select .mp4/.avi footage (max 500MB)\n3. Click **'Analyze Video'**\n4. System processes frame-by-frame for detections\n5. Results appear in 30-90 seconds\n\nSupported formats:\n• MP4, AVI, MOV\n• 720p or higher recommended\n• Stable footage (avoid excessive shaking)\n• Clear crop visibility\n\nYou can upload test videos or use sample data from the uploads folder."
  },

  // Real-time vs Recorded
  {
    patterns: [
      /real( |-)?time (monitoring|detection|tracking)/i,
      /live (feed|monitoring|data)/i,
      /recorded (vs|versus) live/i,
      /when (is|are) (detections?|data) (updated|refreshed)/i
    ],
    answer: "⚡ **Real-time vs Recorded Analysis**\n\n**Real-time Mode**:\n✓ Live sensor data updates every 1-2 seconds\n✓ Instant alert generation\n✓ GPS tracking updates continuously\n\n**Video Analysis Mode**:\n✓ Upload recorded footage for batch processing\n✓ Frame-by-frame disease detection\n✓ Historical analysis and comparison\n\nThe dashboard shows **live status indicator** in top-right - green means real-time data is flowing, yellow means processing recorded footage."
  },

  // Firebase & Data Storage
  {
    patterns: [
      /firebase|database|storage/i,
      /where (is|are) data stored/i,
      /data (storage|persistence|saving)/i,
      /cloud (storage|sync)/i
    ],
    answer: "☁️ **Data Storage & Firebase**\n\nThe system uses Firebase for:\n• **Detection History**: All disease detections with timestamps\n• **Session Data**: Analysis results and metadata\n• **User Settings**: Preferences and configurations\n• **Report Archive**: Generated PDF reports\n\nData Features:\n✓ Automatic cloud backup\n✓ Real-time synchronization\n✓ Accessible from any device\n✓ Secure authentication\n✓ 30-day data retention\n\nConfigure Firebase in `config.yaml` or use local-only mode."
  },

  // Troubleshooting
  {
    patterns: [
      /help/i,
      /error/i,
      /problem/i,
      /issue/i,
      /not working/i,
      /fix/i,
      /troubleshoot/i,
      /why.*not.*work/i,
      /doesn't work/i,
      /connection/i
    ],
    answer: "🔧 **Troubleshooting Guide**\n\n**Common Issues**:\n\n1. **No detections showing**:\n   • Upload a video or ensure live feed is connected\n   • Check Video Input panel for status\n\n2. **Map not loading**:\n   • Verify internet connection (required for map tiles)\n   • Check browser console for errors\n\n3. **Backend errors**:\n   • Ensure Flask server is running: `python src/api_server.py`\n   • Check port 5000 is not blocked\n   • Verify config.yaml settings\n\n4. **Firebase connection issues**:\n   • Check serviceAccountKey.json exists\n   • Verify Firebase credentials\n   • Try local mode in config.yaml\n\nFor persistent issues, check the README.md or contact support."
  },

  // Getting Started
  {
    patterns: [
      /how.*(start|begin|use)/i,
      /getting started|get started/i,
      /quick start|quickstart/i,
      /first.*time/i,
      /new user/i,
      /tutorial/i,
      /guide/i,
      /how.*work/i
    ],
    answer: "🚀 **Getting Started Guide**\n\n**Quick Start in 3 Steps**:\n\n1. **Upload Footage**\n   • Go to Video Input panel\n   • Choose a drone video (.mp4)\n   • Click 'Analyze Video'\n\n2. **Review Detections**\n   • Check Analytics panel for statistics\n   • View Detection Feed for identified diseases\n   • Inspect Field Map for GPS locations\n\n3. **Take Action**\n   • Review Alerts & Decisions panel\n   • Generate spray path in Path Planning\n   • Download Mission Report (PDF)\n\n**Pro Tips**:\n• Start with sample videos for testing\n• Enable real-time mode for live monitoring\n• Generate reports regularly for records"
  },

  // Pricing & Hardware
  {
    patterns: [
      /cost/i,
      /price/i,
      /how much/i,
      /hardware/i,
      /requirements?/i,
      /drone.*need/i,
      /compatible/i,
      /specs?/i
    ],
    answer: "💲 **System Requirements & Compatibility**\n\n**Software** (Free & Open Source):\n• Web dashboard: Any modern browser\n• Backend: Python 3.8+, Flask\n• Storage: Firebase (free tier available)\n\n**Hardware** (Not Included):\n• Agricultural drone with camera (1080p+)\n• Optional: Multispectral camera\n• Optional: Environmental sensors\n• Laptop/PC for ground station\n\n**Compatible Drones**:\n• DJI Mavic/Phantom series\n• Parrot Bluegrass\n• Custom agricultural drones with GPS\n\n**Cost Estimate**:\n• Basic drone setup: $500-2000\n• Professional system: $2000-5000\n• ROI typically achieved in 1 season"
  },

  // Features Summary
  {
    patterns: [
      /features?/i,
      /capabilities/i,
      /what.*do/i,
      /list/i,
      /functionality/i,
      /key/i,
      /summary/i
    ],
    answer: "✨ **Key Features Summary**\n\n**Detection & Analysis**:\n✓ AI-powered disease detection (93% accuracy)\n✓ 12 disease types recognized\n✓ Real-time + recorded video analysis\n\n**Mapping & Planning**:\n✓ GPS tracking and visualization\n✓ 2D/3D interactive maps\n✓ Intelligent spray path planning\n\n**Decision Support**:\n✓ Economic impact calculator\n✓ Intelligent alerts system\n✓ Multimodal data fusion\n\n**Reporting**:\n✓ Professional PDF reports\n✓ Data export and sharing\n✓ Cloud backup (Firebase)\n\n**Monitoring**:\n✓ Live sensor integration\n✓ Historical data analysis\n✓ Performance metrics"
  },

  // Default/Fallback
  {
    patterns: [
      /.*/
    ],
    answer: "🤔 I'm not sure I understand that question. Here are some topics I can help with:\n\n• **System Overview**: What is this system?\n• **Disease Detection**: What diseases can be detected?\n• **Economic Impact**: ROI and cost savings\n• **Drone & GPS**: Tracking and mapping\n• **Spray Planning**: Treatment optimization\n• **Alerts**: Intelligent notifications\n• **Reports**: Generate PDF reports\n• **Getting Started**: How to use the system\n• **Troubleshooting**: Fix common issues\n\nTry asking me something like:\n- 'What diseases can this detect?'\n- 'How accurate is the detection?'\n- 'How do I upload a video?'\n- 'What's the economic benefit?'"
  }
];

/**
 * Find best matching answer for user question
 * @param {string} question - User's question
 * @returns {string} - Bot's answer
 */
export function getLocalAIResponse(question) {
  const normalizedQuestion = question.trim().toLowerCase();
  
  // Try to find a matching pattern
  for (const entry of knowledgeBase) {
    for (const pattern of entry.patterns) {
      if (pattern.test(normalizedQuestion)) {
        return entry.answer;
      }
    }
  }
  
  // Fallback to default response (last entry)
  return knowledgeBase[knowledgeBase.length - 1].answer;
}

/**
 * Generate welcome message
 * @returns {string}
 */
export function getWelcomeMessage() {
  return "👋 **Welcome to AgriDrone AI Assistant!**\n\nI'm here to help you understand and use the AgriDrone Analytics System.\n\n**I can help you with**:\n• Disease detection & accuracy\n• Economic impact analysis\n• Drone tracking & mapping\n• Spray path planning\n• System troubleshooting\n• Getting started guide\n\n**Try asking me**:\n- 'What diseases can you detect?'\n- 'How accurate is the system?'\n- 'How do I upload a video?'\n- 'What's the ROI?'\n\nWhat would you like to know?";
}

/**
 * Get all available question categories for quick actions
 * @returns {Array} - List of question categories
 */
export function getQuickQuestions() {
  return [
    "What diseases can be detected?",
    "How accurate is the detection?",
    "How do I upload a video?",
    "What's the economic benefit?",
    "How to generate reports?",
    "Troubleshooting help"
  ];
}
