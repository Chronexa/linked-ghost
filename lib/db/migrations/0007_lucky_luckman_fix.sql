DO NOT MODIFY `CREATE TYPE` STATEMENTS IF THEY ALREADY EXIST.
Only add the new columns and constraints.

```sql
ALTER TABLE "generated_drafts" ADD COLUMN IF NOT EXISTS "conversation_id" uuid;
ALTER TABLE "generated_drafts" ADD CONSTRAINT "generated_drafts_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE set null ON UPDATE no action;
```
