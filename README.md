# HotAgents

## Inspiration

Current agents and LLM chatbots often struggle with reliability due to the vast prompt input space, requiring significant effort for prompt formulation and task switching. This necessity forces users to break their workflow, impacting productivity. While adding other modalities, like screenshots, can reduce prompt length, it also increases the user's effort to capture the screenshot.

However, most high-impact use cases for LLMs/agents can be distilled into a few simple, repeatable tasks (fixed input prompts) combined with the current context from your desktop.

What if you could trigger reliable agents with zero effort, almost like using hotkeys to control applications? Enter HotAgents!

## What it Does

HotAgents aims to simplify and streamline the use of AI agents by integrating a seamless hotkey-triggered system. With the ctrl+space hotkey combo, HotAgents captures a screenshot of your desktop and feeds it into our agent, created with WordWare. The agent then determines the appropriate action to take based on the context of the screenshot. The currently implemented actions include:

- Content Explanation: Provides explanations for the content displayed on the screen.
- Drafting Response Messages: Composes responses for chats and emails.
- Code Creation: Generates code to implement or recreate what is shown on the screen.
- Proofreading: Reviews and corrects work-in-progress documents.
    
Created during the Solaris AI GPT4o vs Gemini 1.5 Hackathon by:
- [Avery Chiu](https://github.com/AveryChiu64)
- [Aria Han](https://github.com/ariaxhan)
- [Chris Samra](https://github.com/ChrisSamra)
- [Manik Sethi](https://github.com/manik-sethi)
- [Kevin Zhu](https://github.com/kevinydzhu)

Powered by [Wordware AI](https://wordware.ai)
