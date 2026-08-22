# Communication Flow — Product Specification

## 1. Purpose
Communication Flow is the omnichannel communication operating system for the ecosystem. It centralizes customer conversations, transactional messages, campaigns, templates, automations, consent, delivery status and AI-assisted replies.

## 2. Channels
Architecture must support providers independently:
- Email — Resend.
- WhatsApp — provider abstraction; start with an official WhatsApp Business API provider.
- SMS — provider abstraction.
- Push notifications — future.
- In-app notifications — native.

The channel layer must not hard-code business logic into one provider.

## 3. Main areas
1. Inbox — unified customer conversations.
2. Contacts — communication profile and consent.
3. Campaigns — bulk/segmented communication.
4. Automations — event-driven messaging.
5. Templates — reusable approved messages.
6. Broadcasts — one-off campaigns.
7. Sequences — multi-step follow-up journeys.
8. AI Inbox — suggested classifications/replies.
9. Delivery — sent/delivered/read/failed/bounced status.
10. Analytics — opens, clicks, replies, conversions and channel cost.
11. Providers — connected channels and health.
12. Compliance — consent, opt-out, suppression and retention.
13. Settings — business identity, sender profiles, hours and defaults.

## 4. Unified conversation model
A conversation belongs to an organization and optionally a customer.

Fields:
- id
- organization_id
- customer_id
- channel
- external_thread_id
- status: open/pending/closed
- assigned_user_id
- last_message_at
- unread_count
- tags
- created_at/updated_at

Messages:
- id
- conversation_id
- direction: inbound/outbound
- channel
- provider_message_id
- sender/recipient
- subject
- body_text
- body_html
- media metadata
- status
- error_code
- sent_at/delivered_at/read_at
- created_by_user_id
- ai_generated boolean
- ai_approved boolean

## 5. Inbox features
- Search by customer, phone, email, message text and tag.
- Filters by channel, status, assignee, tag and date.
- Unread queue.
- Assignment to team members.
- Internal notes invisible to customer.
- Customer profile side panel.
- Previous appointments, purchases and financial context when authorized.
- Attachments/media.
- Saved replies.
- AI reply suggestion.
- Translation support in future.
- Conversation merge/split with audit trail.
- Snooze and follow-up.

## 6. Customer communication profile
For each customer:
- preferred channel
- email
- phone
- WhatsApp identifier
- language
- timezone
- marketing consent by channel
- transactional permission
- opt-out/suppression state
- last contact
- contact frequency
- tags/segments

Consent is granular. Marketing consent is never inferred from a transactional interaction.

## 7. Templates
Template fields:
- name
- channel
- language
- subject/title
- body
- variables
- category: transactional/marketing/service
- approval status
- version
- created_by
- last_approved_by

Variables must be validated before sending. Missing variables block dispatch rather than silently sending broken text.

## 8. Campaigns
Campaign workflow:
Draft → audience → content → channel → compliance check → test → approval → schedule/send → delivery → analytics.

Audience filters:
- new customers
- inactive customers
- last visit
- lifetime spend
- service/product
- location
- tags
- appointment status
- custom attributes

Campaign features:
- scheduling
- timezone handling
- frequency caps
- quiet hours
- A/B tests
- exclusions/suppression
- test recipients
- approval workflow
- cancellation
- retry policy
- idempotency

## 9. Sequences
A sequence is a state machine of delayed steps.

Example:
Day 0: welcome
Day 3: helpful tip
Day 14: offer
Day 30: feedback request

Stop conditions:
- customer replies
- appointment booked
- purchase made
- opt-out
- campaign conversion
- manual stop

## 10. Automations / events
Supported ecosystem events:
- user.created
- organization.created
- customer.created
- customer.updated
- appointment.created
- appointment.tomorrow
- appointment.completed
- appointment.cancelled
- payment.created
- payment.failed
- subscription.created
- subscription.changed
- subscription.cancelled
- customer.inactive
- campaign.completed

Actions:
- send email
- send WhatsApp
- send SMS
- create notification
- create task
- assign conversation
- call AI to draft/classify
- wait/delay
- branch by condition
- webhook

## 11. Transactional messaging
Examples:
- appointment confirmation
- reminder
- cancellation
- payment confirmation
- payment failure
- password/account events
- service follow-up

Transactional messages must remain separate from marketing campaigns and must not be blocked merely because marketing consent is absent, provided the message is genuinely transactional and legally permitted.

## 12. AI features
AI may:
- summarize conversations
- classify intent
- detect urgency
- detect sentiment as an operational signal
- extract structured customer facts
- draft replies
- rewrite tone
- translate
- suggest next action
- recommend channel/time
- identify customers for reactivation
- generate campaign variants

AI-generated outbound messages are drafts by default. Auto-send is configurable per automation and risk policy.

## 13. Inbound email / agent security
Inbound email is untrusted input. The webhook must verify provider signatures, normalize content, enforce sender/domain policies where applicable, strip or isolate malicious instructions, and never allow email content to change security policy or tool permissions.

Inbound processing pipeline:
Provider → verified webhook → event validation → tenant resolution → sanitization → classification → optional AI → action policy → human/automation action → audit.

## 14. Provider abstraction
Provider adapter interface:
- sendMessage
- getMessageStatus
- verifyWebhook
- parseInboundEvent
- uploadMedia
- getProviderHealth
- normalizeError

Store provider message IDs and raw event references for troubleshooting, but never expose provider secrets to clients.

## 15. Database model
Core tables:
- communication_channels
- communication_providers
- communication_contacts
- communication_consents
- conversations
- conversation_participants
- messages
- message_attachments
- message_templates
- template_versions
- campaigns
- campaign_audiences
- campaign_recipients
- sequences
- sequence_steps
- sequence_enrollments
- communication_automations
- communication_events
- delivery_events
- suppressions
- communication_usage
- communication_audit_log

All tenant data is organization-scoped with RLS.

## 16. API surface
- GET /api/communication/conversations
- GET /api/communication/conversations/:id
- POST /api/communication/messages
- POST /api/communication/messages/:id/retry
- POST /api/communication/webhooks/:provider
- GET /api/communication/templates
- POST /api/communication/templates
- GET /api/communication/campaigns
- POST /api/communication/campaigns
- POST /api/communication/campaigns/:id/send
- POST /api/communication/campaigns/:id/cancel
- GET /api/communication/sequences
- POST /api/communication/sequences
- GET /api/communication/analytics
- GET /api/communication/providers

## 17. Deliverability
Track:
- sent
- accepted
- delivered
- opened where supported
- clicked
- replied
- bounced
- complained
- failed

Maintain suppression lists for hard bounces, complaints and opt-outs. Apply domain authentication for email before production sending. Never build campaigns around purchased lists.

## 18. Rate limits and queues
Outbound dispatch should use a durable queue. Every message needs an idempotency key. Workers handle retries with exponential backoff and provider-specific limits. A failed message must not be duplicated because of a retry.

Separate queues:
- transactional-high-priority
- normal-outbound
- campaigns
- inbound-processing
- analytics

## 19. Billing / usage
Track per organization:
- messages by channel
- campaign recipients
- AI-assisted messages
- provider cost
- storage/media usage
- automation executions

Plans can limit monthly messages, active automations, connected channels and AI usage. Usage must be visible before a customer hits a hard limit.

## 20. Compliance and privacy
Implement:
- consent records with timestamp/source/version
- one-click unsubscribe for marketing email
- STOP/opt-out handling where supported
- suppression lists
- data export
- deletion
- retention policies
- access logs
- processor/provider records
- configurable quiet hours
- lawful-purpose separation between transactional and marketing messages

Do not invent legal entity/controller details; those must be configured by the business owner.

## 21. UX
Desktop: three-pane inbox — conversation list, thread, customer context.
Campaigns: wizard with audience → content → compliance → preview → approval → schedule.
Mobile: inbox-first experience with quick reply and assignment.

## 22. MVP order
Phase A: email + unified inbox + templates + transactional messages.
Phase B: campaigns + consent + suppression + analytics.
Phase C: WhatsApp provider + inbound conversations.
Phase D: automations + sequences.
Phase E: AI inbox + AI campaigns + AI reactivation.
Phase F: SMS/push + advanced attribution.

## 23. Definition of done
Communication Flow is production-ready only when webhook verification, tenant isolation, consent/opt-out, suppression, queueing, idempotency, retry handling, provider health, audit logs, usage limits and deletion/retention controls are implemented.
