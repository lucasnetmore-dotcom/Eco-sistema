# AI Flow — Product Specification

## 1. Purpose
AI Flow is the intelligence layer of the ecosystem. It is not a generic chatbot. It reads authorized business context, reasons over operational data, recommends actions and can execute approved actions through tools.

## 2. Core promise
"Pergunta ao teu negócio e recebe uma resposta baseada nos teus próprios dados."

Examples:
- "Quanto faturei esta semana?"
- "Quais clientes não voltam há 60 dias?"
- "Porque caiu o faturamento?"
- "Quero aumentar €3.000 este mês. O que devo fazer?"
- "Cria uma campanha para recuperar clientes inativos."
- "Envia para aprovação uma campanha de recuperação."

## 3. Main areas
1. AI Home — executive briefing, alerts, recommendations and quick actions.
2. Chat — conversational business assistant with persistent conversations.
3. Insights — financial, customer, marketing, operational and team insights.
4. Goals — targets, scenarios and action plans.
5. Automations — triggers, conditions, AI decisions and actions.
6. Agents — specialized agents with restricted tools.
7. Knowledge — business documents, policies, services, FAQs and brand voice.
8. Activity — complete AI action/audit history.
9. Usage — token/credit usage, model usage and cost controls.
10. Settings — permissions, models, retention, approvals and safety.

## 4. Specialized agents
- Executive Agent: business overview and decisions.
- Finance Agent: revenue, expenses, margins, cash flow and forecasts.
- CRM Agent: customers, segmentation, retention and reactivation.
- Marketing Agent: campaigns, content, offers, attribution and experiments.
- Communication Agent: drafts and sends approved communications through Communication Flow.
- Operations Agent: appointments, workload, service capacity and reminders.
- Sales Agent: leads, opportunities, follow-ups and conversion.
- Support Agent: classifies inbound messages and prepares answers.

Agents must use least-privilege tools. An agent never receives unrestricted database access.

## 5. Tool system
Every tool has: id, description, input schema, permission, risk level, confirmation requirement and audit event.

Read tools:
- get_business_summary
- get_revenue
- get_expenses
- get_customer
- search_customers
- get_customer_history
- get_appointments
- get_campaign_metrics
- get_message_history
- get_inventory
- get_team_metrics

Action tools:
- create_customer
- update_customer
- create_appointment
- create_campaign
- create_message_draft
- queue_message
- send_message
- create_task
- create_invoice/payment_link
- add_financial_record

High-impact actions require explicit approval by default: sending bulk messages, changing financial records, refunds, deleting data, changing subscriptions and external account changes.

## 6. AI response modes
- Answer: factual response from connected data.
- Analyze: explanation, causes and evidence.
- Recommend: ranked actions with expected impact.
- Plan: multi-step plan with dependencies.
- Execute: tool calls, with confirmation where required.
- Automate: convert an approved plan into a reusable workflow.

## 7. Business memory
Memory is scoped to organization and user permissions. Store structured facts rather than blindly storing chat transcripts.

Memory categories:
- company profile
- brand voice
- services/products
- pricing rules
- business goals
- customer policies
- communication preferences
- operating hours
- approved offers
- forbidden claims

Users can inspect, edit and delete memory.

## 8. Context pipeline
User request → identity/org authorization → intent classification → relevant data retrieval → policy checks → model reasoning → structured answer/tool plan → approval if needed → execution → audit event → response.

Do not place secrets, raw credentials or unrestricted system prompts into model context.

## 9. RAG / knowledge
Knowledge sources:
- uploaded PDFs/docs
- business FAQs
- service catalogue
- policies
- website content
- approved internal notes

Pipeline: upload → extract → chunk → embed → index → retrieve → cite source internally → answer.

Document access must respect organization/user permissions.

## 10. Automations
Automation object:
- trigger
- filters
- schedule
- AI decision step
- action steps
- approval policy
- retry policy
- failure destination
- enabled status

Examples:
- New customer → welcome message.
- Appointment tomorrow → reminder.
- Customer inactive 60 days → AI drafts reactivation message.
- Payment failed → notify owner + customer workflow.
- Revenue below target → weekly executive alert.

## 11. Safety
- Tenant isolation.
- RLS on all tenant data.
- Tool-level authorization.
- Human approval for risky actions.
- Idempotency keys for external actions.
- Rate limits per user/org/tool.
- Prompt-injection defenses for documents and inbound messages.
- Never allow retrieved content to override system/security policy.
- Full audit trail for AI decisions and actions.
- PII minimization.
- Configurable data retention.

## 12. AI cost controls
Track per organization:
- requests
- input/output tokens
- estimated provider cost
- tool calls
- embeddings
- agent runs
- automation executions

Plans should have monthly AI credits and hard/soft limits. Never silently create unlimited provider spend.

## 13. Database model
Core tables:
- ai_conversations
- ai_messages
- ai_runs
- ai_tool_calls
- ai_memories
- ai_knowledge_sources
- ai_knowledge_chunks
- ai_agents
- ai_automations
- ai_automation_runs
- ai_goals
- ai_insights
- ai_usage
- ai_approvals
- ai_audit_log

All tenant-owned records contain organization_id. Sensitive actions also record actor_user_id.

## 14. API surface
- POST /api/ai/chat
- POST /api/ai/run
- GET /api/ai/conversations
- GET /api/ai/conversations/:id
- POST /api/ai/approvals/:id/approve
- POST /api/ai/approvals/:id/reject
- GET /api/ai/insights
- POST /api/ai/knowledge
- POST /api/ai/automations
- POST /api/ai/automations/:id/run
- GET /api/ai/usage

Streaming chat should use the current Vercel AI SDK API and a provider abstraction so the model can change without rewriting business logic.

## 15. UX
Desktop: sidebar + conversation area + right context panel.
Mobile: chat-first navigation.
Every AI answer should expose source/context indicators when business data was used and show an action preview before risky execution.

## 16. MVP order
Phase A: chat + business context + read-only tools.
Phase B: insights + goals + usage.
Phase C: Communication Flow integration + approval center.
Phase D: automations + agents.
Phase E: knowledge/RAG + advanced forecasting.
Phase F: cross-product autonomous workflows.

## 17. Definition of done
AI Flow is production-ready only when tenant isolation, authorization, tool permissions, audit logs, cost limits, approval flows, retries/idempotency, observability and deletion/retention controls are implemented—not merely the chat UI.
