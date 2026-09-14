from typing import List, Dict

class NewsTool:
    """Provides categorized curated tech and AI news summaries"""

    @staticmethod
    def get_latest_news(category: str = "ai") -> List[Dict[str, str]]:
        if category == "ai":
            return [
                {
                    "title": "OpenAI & DeepMind Announce New Reasoning Benchmarks",
                    "source": "TechRadar AI",
                    "time": "Today, 10:30 AM",
                    "summary": "Next-generation multi-step reasoning models demonstrate unprecedented code generation accuracy and self-reflection.",
                },
                {
                    "title": "Groq Expands Ultra-Fast Llama 3.3 Inference Globally",
                    "source": "VentureBeat",
                    "time": "Today, 08:15 AM",
                    "summary": "LPU hardware architecture delivers over 300 tokens per second for real-time edge voice and assistant applications.",
                },
                {
                    "title": "Local AI Models Achieve Near GPT-4 Performance with 4-bit Quantization",
                    "source": "HackerNews Daily",
                    "time": "Yesterday",
                    "summary": "Open-weight models running on consumer hardware now handle long-context reasoning with under 8GB VRAM.",
                }
            ]
        else:
            return [
                {
                    "title": "React 19 & Tauri 2.0 Ecosystem Updates Released",
                    "source": "Frontend Weekly",
                    "time": "Today",
                    "summary": "Cross-platform desktop application development reaches native-grade performance with smaller bundle sizes.",
                },
                {
                    "title": "PostgreSQL with pgvector Becomes Dominant Architecture for Private AI Memory",
                    "source": "Database Trends",
                    "time": "Yesterday",
                    "summary": "Hybrid relational and vector storage replaces isolated vector DBs for enterprise and personal AI agents.",
                }
            ]

news_tool = NewsTool()
