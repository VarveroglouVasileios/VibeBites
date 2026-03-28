-- Trigger edge function on new contact message
CREATE OR REPLACE TRIGGER on_contact_message_created
  AFTER INSERT ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION supabase_functions.http_request(
    'http://localhost:54321/functions/v1/notify-admin-message',
    'POST',
    '{"Content-Type":"application/json", "Authorization":"Bearer REPLACE_WITH_SERVICE_ROLE_KEY"}',
    '{}',
    '1000'
  );

-- Note: The above is for local testing. In production, you'd use the Supabase Dashboard Webhooks UI
-- which is easier to manage and more secure for service role keys.
