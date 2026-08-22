# Ecosystem Shared Data Model

## Principle
Products remain independently deployable, but shared identity and organization concepts must be stable. Do not duplicate the same customer five times across products.

## Shared entities
- organizations
- organization_members
- users
- roles
- permissions
- customers
- products
- subscriptions
- usage_counters
- integrations
- event_outbox
- audit_log
- notifications

## Tenant key
Every business-owned record uses `organization_id`. User-owned records also retain `user_id` where useful. Cross-tenant queries are forbidden by policy and database RLS.

## Customer identity
Use one canonical customer identity. Product-specific tables reference `customer_id`. Store channel identifiers in communication-specific tables rather than duplicating customer profile fields.

## Event envelope
```json
{
  "id": "uuid",
  "type": "customer.created",
  "version": 1,
  "organization_id": "uuid",
  "actor_user_id": "uuid|null",
  "source_product": "finance-flow|communication-flow|ai-flow|ecosystem-os",
  "occurred_at": "ISO-8601",
  "idempotency_key": "string",
  "data": {}
}
```

## Event rules
- Events are append-only.
- Consumers must be idempotent.
- Never use events as the only source of truth for critical financial data.
- Keep an outbox record with delivery status.
- Version event contracts.

## Initial event catalog
- organization.created
- organization.updated
- customer.created
- customer.updated
- appointment.created
- appointment.completed
- appointment.cancelled
- payment.created
- payment.failed
- subscription.created
- subscription.changed
- subscription.cancelled
- message.received
- message.sent
- message.failed
- campaign.completed
- ai.run.completed
- ai.action.approved
- ai.action.rejected

## Shared permissions
Roles should be configurable, with baseline roles:
- owner
- admin
- manager
- staff
- accountant
- marketing
- read_only

High-impact scopes:
- finance.write
- customer.write
- communication.send
- communication.bulk_send
- ai.execute
- billing.write
- organization.manage

## Audit requirements
Audit sensitive actions with actor, organization, resource, action, timestamp, source IP/session where appropriate, outcome and metadata. AI actions additionally record model/run/tool identifiers.
